-- =====================================================================
-- FOODMAP MADIUN — PATCH FIX (slugify dependency order)
-- =====================================================================
-- ⚠️ Jalankan file ini KALAU saat run 00_setup_all.sql kamu kena error:
--    "function unaccent_safe(text) does not exist"
--
-- Penyebab: di versi lama 00_setup_all.sql, urutan deklarasi salah —
--           slugify() didefinisikan SEBELUM unaccent_safe().
--
-- File ini:
--   1. Drop function lama yang broken (kalau ada)
--   2. Re-create dengan urutan yang benar
--   3. Re-attach trigger
--   4. Backfill slug untuk row yang sudah keburu di-INSERT
--
-- Setelah patch ini sukses, kamu bisa lanjut langkah berikutnya
-- (seed admin, dst). TIDAK perlu re-run seluruh 00_setup_all.sql.
-- =====================================================================


-- ---------- 1. Drop yang broken ----------

DROP TRIGGER IF EXISTS tenants_set_slug_trigger ON public.tenants;
DROP FUNCTION IF EXISTS public.tenants_set_slug() CASCADE;
DROP FUNCTION IF EXISTS public.slugify(text)      CASCADE;
DROP FUNCTION IF EXISTS public.unaccent_safe(text) CASCADE;


-- ---------- 2. Re-create dengan urutan benar ----------

-- 2a. unaccent_safe DULUAN
CREATE OR REPLACE FUNCTION public.unaccent_safe(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT translate(
           coalesce(input, ''),
           'àáâãäåèéêëìíîïòóôõöùúûüñçÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÑÇ',
           'aaaaaaeeeeiiiiooooouuuuncAAAAAAEEEEIIIIOOOOOUUUUNC'
         );
$$;

-- 2b. slugify (baru bisa reference unaccent_safe)
CREATE OR REPLACE FUNCTION public.slugify(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT regexp_replace(
           regexp_replace(
             lower(public.unaccent_safe(coalesce(input, ''))),
             '[^a-z0-9]+', '-', 'g'
           ),
           '(^-+|-+$)', '', 'g'
         );
$$;

-- 2c. trigger function
CREATE OR REPLACE FUNCTION public.tenants_set_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug   text;
  candidate   text;
  counter     int := 1;
BEGIN
  IF (TG_OP = 'INSERT' AND (NEW.slug IS NULL OR NEW.slug = ''))
     OR (TG_OP = 'UPDATE' AND NEW.nama IS DISTINCT FROM OLD.nama
         AND (NEW.slug IS NULL OR NEW.slug = '')) THEN

    base_slug := public.slugify(NEW.nama);
    IF base_slug = '' THEN
      base_slug := 'warung';
    END IF;

    candidate := base_slug;

    WHILE EXISTS (
      SELECT 1 FROM public.tenants
      WHERE slug = candidate
        AND (TG_OP = 'INSERT' OR id <> NEW.id)
    ) LOOP
      counter := counter + 1;
      candidate := base_slug || '-' || counter;
    END LOOP;

    NEW.slug := candidate;
  END IF;

  RETURN NEW;
END;
$$;


-- ---------- 3. Re-attach trigger ----------

CREATE TRIGGER tenants_set_slug_trigger
  BEFORE INSERT OR UPDATE OF nama ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.tenants_set_slug();


-- ---------- 4. Grants ----------

GRANT EXECUTE ON FUNCTION public.slugify(text)        TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.unaccent_safe(text)  TO anon, authenticated;


-- ---------- 5. Backfill slug untuk row yg sudah ada ----------
-- Pakai trick: UPDATE dummy ke nama → trigger jalan → slug keisi.

UPDATE public.tenants
SET nama = nama,
    slug = NULL  -- force trigger generate ulang
WHERE slug IS NULL OR slug = '';


-- ---------- 6. Verifikasi ----------

-- Cek fungsi sudah ada
SELECT proname FROM pg_proc
WHERE proname IN ('slugify', 'unaccent_safe', 'tenants_set_slug')
  AND pronamespace = 'public'::regnamespace;
-- Expected: 3 rows

-- Test slugify langsung
SELECT public.slugify('Sate Gule Kambing & Sapi DIMONG') AS slug_test;
-- Expected: 'sate-gule-kambing-sapi-dimong'

-- Cek slug terisi semua di tenants
SELECT nama, slug FROM public.tenants ORDER BY nama;
-- Expected: semua kolom slug terisi, no NULL


-- =====================================================================
-- DONE — patch selesai. Lanjut ke seed-admin.js
-- =====================================================================
