-- =====================================================================
-- FOODMAP MADIUN — ROLLBACK / RESET
-- =====================================================================
-- ⚠️  WARNING: Script ini DROP semua tabel + function + data.
--     Hanya jalankan di dev/staging. JANGAN jalankan di production
--     kecuali memang mau hard reset.
--
-- Setelah jalankan ini, run ulang 00_setup_all.sql untuk re-create.
-- =====================================================================

-- ---------- Drop functions ----------

DROP FUNCTION IF EXISTS public.nearby_tenants(double precision, double precision, int)                          CASCADE;
DROP FUNCTION IF EXISTS public.tenants_in_view(double precision, double precision, double precision, double precision) CASCADE;
DROP FUNCTION IF EXISTS public.is_super_admin()        CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at()        CASCADE;
DROP FUNCTION IF EXISTS public.tenants_set_slug()      CASCADE;
DROP FUNCTION IF EXISTS public.slugify(text)           CASCADE;
DROP FUNCTION IF EXISTS public.unaccent_safe(text)     CASCADE;


-- ---------- Drop tables (cascade ke FK) ----------

DROP TABLE IF EXISTS public.products   CASCADE;
DROP TABLE IF EXISTS public.tenants    CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;


-- ---------- Verifikasi reset ----------
-- Expected: 0 rows
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('tenants', 'products', 'categories');

-- NOTE:
-- Extensions (postgis, uuid-ossp, pg_trgm) TIDAK di-drop karena
-- mungkin dipakai schema lain. Drop manual kalau perlu:
--   DROP EXTENSION IF EXISTS postgis CASCADE;
--   DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;
--   DROP EXTENSION IF EXISTS pg_trgm CASCADE;
--
-- Auth users juga TIDAK di-drop. Hapus manual via Dashboard.
