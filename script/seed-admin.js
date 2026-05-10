// ============================================================
// FILE PATH: scripts/seed-admin.js
// ============================================================
// FOODMAP MADIUN — SEED SUPER ADMIN
// Jalankan: node scripts/seed-admin.js
// Butuh: NEXT_PUBLIC_SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY
//        di .env.local
//
// Berbeda dengan e-raport (yang punya tabel user_profiles), FoodMap
// pakai pattern lebih simpel: role disimpan di `app_metadata.role`
// di JWT (Supabase Auth raw_app_meta_data). Cek `proxy.ts` +
// `admin/layout.tsx` — keduanya read dari `user.app_metadata.role`.
//
// Script ini idempotent — aman di-rerun:
//   - Auth user belum ada    → buat baru
//   - Auth user sudah ada    → skip create, lanjut set role
//   - Role belum super_admin → set
//   - Role sudah super_admin → skip
// ============================================================
import ws from "ws";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "❌ NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY " +
    "tidak ditemukan di .env.local"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: ws },
});
// ============================================================
// 📋 DATA ADMIN — GANTI SESUAI KEBUTUHAN
// ============================================================
const adminList = [
  {
    full_name: "Fibidy Dev",
    email: "fibidydev01@gmail.com",
    password: "kulinerm@diun123",
    role: "super_admin",
  },
];

// ============================================================
// 🔧 HELPER — set custom claim role di app_metadata
// ============================================================
async function setRoleClaim(authUserId, role) {
  // Note: updateUserById merge app_metadata (object spread di internal),
  // jadi field lain (provider, providers, dll) tetap aman.
  const { error } = await supabase.auth.admin.updateUserById(authUserId, {
    app_metadata: { role },
  });

  if (error) {
    throw new Error(`Set role claim gagal: ${error.message}`);
  }
}

// ============================================================
// 🚀 FUNGSI CREATE ADMIN
// ============================================================
async function createAdmin(adminData) {
  try {
    console.log(`\n📝 Processing: ${adminData.full_name} (${adminData.email})`);

    // 1. Cek apakah auth user udah ada
    const { data: authList, error: listError } =
      await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    const existing = authList.users.find((u) => u.email === adminData.email);

    let authUserId;
    let createdNew = false;

    if (existing) {
      console.log(`   ⏭️  Auth user sudah ada (ID: ${existing.id})`);
      authUserId = existing.id;
    } else {
      // 2. Buat auth user baru
      console.log(`   🔐 Membuat auth user...`);
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: adminData.email,
          password: adminData.password,
          email_confirm: true,
          user_metadata: { full_name: adminData.full_name },
        });

      if (authError) throw authError;
      if (!authData.user) throw new Error("No user data returned");

      authUserId = authData.user.id;
      createdNew = true;
      console.log(`   ✅ Auth user dibuat: ${authUserId}`);
    }

    // 3. Cek role saat ini di app_metadata
    const currentRole =
      (existing?.app_metadata)?.role ?? null;

    if (currentRole === adminData.role) {
      console.log(`   ⏭️  Role sudah sesuai (${currentRole}), skip.`);
      return {
        status: "skipped",
        ...adminData,
        auth_id: authUserId,
      };
    }

    // 4. Set custom claim role
    console.log(
      `   🔑 Set role claim: ${currentRole ?? "(none)"} → ${adminData.role}`
    );
    await setRoleClaim(authUserId, adminData.role);

    return {
      status: createdNew ? "created" : "updated",
      ...adminData,
      auth_id: authUserId,
    };
  } catch (error) {
    console.error(`   ❌ ERROR: ${error.message}`);
    return { status: "failed", ...adminData, error: error.message };
  }
}

// ============================================================
// 🎬 MAIN
// ============================================================
async function main() {
  console.log("🚀 SEED ADMIN - FOODMAP MADIUN");
  console.log("=============================================\n");
  console.log(`📋 Total admin: ${adminList.length}\n`);

  const results = {
    created: [],
    updated: [],
    skipped: [],
    failed: [],
  };

  for (const admin of adminList) {
    const result = await createAdmin(admin);
    results[result.status]?.push(result);
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  console.log("\n\n=============================================");
  console.log("📊 HASIL");
  console.log("=============================================\n");

  console.log(`✅ Created : ${results.created.length}`);
  results.created.forEach((r) =>
    console.log(`   ✅ ${r.full_name} (${r.email}) — ${r.role}`)
  );

  console.log(`\n🔄 Updated : ${results.updated.length}`);
  results.updated.forEach((r) =>
    console.log(`   🔄 ${r.full_name} (${r.email}) — role di-set ke ${r.role}`)
  );

  console.log(`\n⏭️  Skipped : ${results.skipped.length}`);
  results.skipped.forEach((r) =>
    console.log(`   ⏭️  ${r.full_name} (${r.email})`)
  );

  console.log(`\n❌ Failed  : ${results.failed.length}`);
  results.failed.forEach((r) =>
    console.log(`   ❌ ${r.full_name} (${r.email}): ${r.error}`)
  );

  console.log("\n\n=============================================");
  console.log("🔑 LOGIN CREDENTIALS");
  console.log("=============================================\n");
  adminList.forEach((u) => {
    console.log(`👤 ${u.full_name} (${u.role})`);
    console.log(`   Email    : ${u.email}`);
    console.log(`   Password : ${u.password}\n`);
  });
  console.log("⚠️  Login di /login → harus auto-redirect ke /admin");
  console.log("⚠️  Kalau sebelumnya udah pernah login, LOGOUT dulu");
  console.log("    supaya JWT di-issue ulang dengan claim role baru.\n");
}

main()
  .then(() => {
    console.log("✅ Script selesai!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script gagal:", error);
    process.exit(1);
  });