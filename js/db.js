/* ==========================================================
   Ta3leem — Database (Supabase)
   ========================================================== */

// ==========================================================
// التصنيفات — Categories
// ==========================================================
async function getCategories() {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name_ar");
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("خطأ في جلب التصنيفات:", err);
    return [];
  }
}

// ==========================================================
// الدورات — Courses
// ==========================================================
async function getCourses({ limit = 6, categoryId = null, level = null, search = "", sortBy = "newest" } = {}) {
  try {
    let query = supabase
      .from("courses")
      .select(`
        id, title, slug, description, thumbnail_url,
        level, rating_avg, rating_count, students_count,
        duration_hours, created_at,
        category:categories(id, name_ar, slug, icon)
      `)
      .eq("status", "published");

    if (categoryId) query = query.eq("category_id", categoryId);
    if (level) query = query.eq("level", level);
    if (search) query = query.ilike("title", `%${search}%`);

    // الترتيب
    switch (sortBy) {
      case "rating":
        query = query.order("rating_avg", { ascending: false });
        break;
      case "popular":
        query = query.order("students_count", { ascending: false });
        break;
      case "oldest":
        query = query.order("created_at", { ascending: true });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }

    query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("خطأ في جلب الدورات:", err);
    return [];
  }
}

// ==========================================================
// دورة واحدة بـ slug
// ==========================================================
async function getCourseBySlug(slug) {
  try {
    const { data, error } = await supabase
      .from("courses")
      .select(`
        *,
        category:categories(name_ar, slug, icon),
        sections(
          id, title, position,
          lessons(id, title, type, duration_min, position, is_free_preview)
        )
      `)
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error) throw error;

    // ترتيب الأقسام والدروس
    if (data.sections) {
      data.sections.sort((a, b) => a.position - b.position);
      data.sections.forEach(s => {
        if (s.lessons) s.lessons.sort((a, b) => a.position - b.position);
      });
    }

    return data;
  } catch (err) {
    console.error("خطأ في جلب الدورة:", err);
    return null;
  }
}

// ==========================================================
// درس واحد
// ==========================================================
async function getLessonById(id) {
  try {
    const { data, error } = await supabase
      .from("lessons")
      .select(`
        *,
        section:sections(
          id, title, position, course_id,
          course:courses(id, title, slug, thumbnail_url)
        )
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("خطأ في جلب الدرس:", err);
    return null;
  }
}

// ==========================================================
// Helper: escapeHtml
// ==========================================================
function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ==========================================================
// توافق مع الكود القديم (stubs مؤقتة)
// ==========================================================
// دي دوال مؤقتة بتشتغل بـ localStorage لحد ما ننقلها لـ Supabase

// المستخدمين
function getUsers() {
  try { return JSON.parse(localStorage.getItem("ta3leem_users") || "[]"); }
  catch { return []; }
}
function saveUsers(users) { localStorage.setItem("ta3leem_users", JSON.stringify(users)); }

function getCurrentUser() {
  try {
    const raw = localStorage.getItem("ta3leem_session");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function setCurrentUser(user) {
  if (user) localStorage.setItem("ta3leem_session", JSON.stringify(user));
  else localStorage.removeItem("ta3leem_session");
}

// Attempts
function getAllAttempts() {
  try { return JSON.parse(localStorage.getItem("ta3leem_attempts") || "[]"); }
  catch { return []; }
}
function addAttempt(attempt) {
  const all = getAllAttempts();
  all.push({
    id: "a_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
    ...attempt,
    submitted_at: new Date().toISOString(),
  });
  localStorage.setItem("ta3leem_attempts", JSON.stringify(all));
}
function getAttemptsByUser(userId) {
  return getAllAttempts().filter((a) => a.user_id === userId);
}

// Presentations
function getAllPresentations() {
  try { return JSON.parse(localStorage.getItem("ta3leem_presentations") || "[]"); }
  catch { return []; }
}
function savePresentations(list) {
  localStorage.setItem("ta3leem_presentations", JSON.stringify(list));
}
function getPresentationsByCourse(courseId) {
  return getAllPresentations().filter((p) => p.course_id === Number(courseId));
}

// Zoom
function getAllZoomLinks() {
  try { return JSON.parse(localStorage.getItem("ta3leem_zoom_links") || "[]"); }
  catch { return []; }
}
function saveZoomLinks(list) {
  localStorage.setItem("ta3leem_zoom_links", JSON.stringify(list));
}
function getZoomByCourse(courseId) {
  return getAllZoomLinks().filter((z) => z.course_id === Number(courseId));
}

// Progress
function getAllProgress() {
  try { return JSON.parse(localStorage.getItem("ta3leem_progress") || "[]"); }
  catch { return []; }
}
function saveProgress(list) {
  localStorage.setItem("ta3leem_progress", JSON.stringify(list));
}
function markLessonComplete(userId, courseId, lessonId) {
  const all = getAllProgress();
  const key = `${userId}_${courseId}_${lessonId}`;
  if (!all.find((p) => p.key === key)) {
    all.push({
      key, user_id: userId, course_id: courseId, lesson_id: lessonId,
      completed_at: new Date().toISOString(),
    });
    saveProgress(all);
  }
}
function isLessonComplete(userId, courseId, lessonId) {
  const all = getAllProgress();
  const key = `${userId}_${courseId}_${lessonId}`;
  return all.some((p) => p.key === key);
}

// Certificates
function getAllCertificates() {
  try { return JSON.parse(localStorage.getItem("ta3leem_certificates") || "[]"); }
  catch { return []; }
}
function saveCertificates(list) {
  localStorage.setItem("ta3leem_certificates", JSON.stringify(list));
}
function generateCertificateCode() {
  const year = new Date().getFullYear();
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const part2 = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `TA3-${year}-${part1}-${part2}`;
}
function getOrCreateCertificate(userId, courseId, studentName, courseTitle) {
  const all = getAllCertificates();
  const existing = all.find(c => c.user_id === userId && c.course_id === courseId);
  if (existing) return existing;
  const cert = {
    id: "c_" + Date.now(),
    code: generateCertificateCode(),
    user_id: userId,
    course_id: courseId,
    student_name: studentName,
    course_title: courseTitle,
    issued_at: new Date().toISOString(),
  };
  all.push(cert);
  saveCertificates(all);
  return cert;
}

// Settings
function getSettings() {
  try {
    const raw = localStorage.getItem("ta3leem_settings");
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    platform_name: "Ta3leem",
    platform_name_ar: "تعليم",
    manager_name: "أحمد كرم",
    manager_title: "مدير المنصة",
    stamp_text: "معتمد من Ta3leem",
  };
}
function saveSettings(settings) {
  localStorage.setItem("ta3leem_settings", JSON.stringify(settings));
}

// Grades
const GRADES = [
  { id: "prep1", name: "الأول الإعدادي" },
  { id: "prep2", name: "الثاني الإعدادي" },
  { id: "prep3", name: "الثالث الإعدادي" },
  { id: "sec1",  name: "الأول الثانوي" },
  { id: "sec2",  name: "الثاني الثانوي" },
  { id: "sec3",  name: "الثالث الثانوي" },
];
function getGradeName(gradeId) {
  const g = GRADES.find((x) => x.id === gradeId);
  return g ? g.name : "غير محدد";
}

// توليد الإيميل والرقم السري
function generateEmail(fullName, grade) {
  const cleanName = (fullName || "student").trim().toLowerCase().replace(/\s+/g, ".");
  let prefix = cleanName.replace(/[^a-z0-9.]/g, "");
  if (!prefix || prefix.length < 2) {
    prefix = "student" + Math.floor(Math.random() * 1000);
  }
  const gradeShort = (grade || "gen").replace("prep", "p").replace("sec", "s");
  const suffix = Math.floor(100 + Math.random() * 900);
  return `${prefix}${suffix}@${gradeShort}.ta3leem.local`;
}
function generatePassword() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const numbers = "23456789";
  const pick = (str, n) => Array.from({ length: n }, () => str[Math.floor(Math.random() * str.length)]).join("");
  return `${pick(letters, 3)}-${pick(numbers, 4)}-${pick(letters, 2)}`;
}

// ==========================================================
// DB Object — للتوافق مع الكود القديم
// ==========================================================
const DB = {
  async getCourses(options = {}) {
    return await getCourses(options);
  },
  async getCategories() {
    return await getCategories();
  },
  async getCourseBySlug(slug) {
    return await getCourseBySlug(slug);
  },
  async getLessonById(id) {
    return await getLessonById(id);
  },

  // مؤقت — localStorage
  async register(fullName, email, password, grade = null) {
    const users = getUsers();
    if (users.find(u => u.email === email.toLowerCase())) {
      return { error: "البريد مسجل بالفعل" };
    }
    const user = {
      id: "u_" + Date.now(),
      full_name: fullName,
      email: email.toLowerCase(),
      password,
      role: "student",
      grade: grade || null,
      created_at: new Date().toISOString(),
    };
    users.push(user);
    saveUsers(users);
    setCurrentUser({
      id: user.id, email: user.email, full_name: user.full_name,
      role: user.role, grade: user.grade,
    });
    return { data: user, error: null };
  },

  async login(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email.toLowerCase() && u.password === password);
    if (!user) return { error: "البريد أو كلمة المرور غير صحيحة" };
    setCurrentUser({
      id: user.id, email: user.email, full_name: user.full_name,
      role: user.role, grade: user.grade,
    });
    return { data: user, error: null };
  },

  async logout() { setCurrentUser(null); },

  getEnrollments(userId) {
    try {
      const all = JSON.parse(localStorage.getItem("ta3leem_enrollments") || "[]");
      return all.filter(e => e.user_id === userId);
    } catch { return []; }
  },

  enroll(userId, courseId) {
    const all = JSON.parse(localStorage.getItem("ta3leem_enrollments") || "[]");
    if (all.find(e => e.user_id === userId && e.course_id === courseId)) return false;
    all.push({
      id: "e_" + Date.now(), user_id: userId, course_id: courseId,
      progress_pct: 0, enrolled_at: new Date().toISOString(),
    });
    localStorage.setItem("ta3leem_enrollments", JSON.stringify(all));
    return true;
  },
};