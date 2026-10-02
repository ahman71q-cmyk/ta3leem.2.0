/* ==========================================================
   Ta3leem — Supabase Client
   ========================================================== */

// ⚠️ استبدل القيم دي بقيم مشروعك من:
// Supabase → Settings → API
const SUPABASE_URL = "https://cpjigybsfsciyrgwiaoa.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_1SKSJkZcclkZiFogTbBCfA_YcjR42JW";

// ✅ اسم مميز للمتغير
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.sb = sb;

console.log("🔌 Supabase Client initialized");

// اختبار الاتصال
(async () => {
  try {
    const { error } = await sb.from("courses").select("id").limit(1);
    if (error) throw error;
    console.log("✅ Supabase connected successfully");
  } catch (err) {
    console.error("❌ Supabase connection failed:", err.message);
  }
})();