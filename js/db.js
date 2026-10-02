/* ==========================================================
   Ta3leem — Database (Supabase Only)
   ========================================================== */

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
// ⚠️ Fallback Constants (للكود القديم)
// ==========================================================
const LOCAL_CATEGORIES = [
  { id: 1, name_ar: "برمجة", slug: "programming", icon: "bi-code-slash" },
  { id: 2, name_ar: "تصميم", slug: "design", icon: "bi-palette" },
  { id: 3, name_ar: "لغات", slug: "languages", icon: "bi-translate" },
  { id: 4, name_ar: "تسويق", slug: "marketing", icon: "bi-megaphone" },
  { id: 5, name_ar: "أعمال", slug: "business", icon: "bi-briefcase" },
];

const LOCAL_COURSES = [];

// ==========================================================
// 1. CATEGORIES — التصنيفات
// ==========================================================
async function getCategories() {
  try {
    const { data, error } = await sb
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
// 2. COURSES — الدورات
// ==========================================================
async function getCourses({ limit = 6, categoryId = null, level = null, search = "", sortBy = "newest" } = {}) {
  try {
    let query = sb
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

    switch (sortBy) {
      case "rating": query = query.order("rating_avg", { ascending: false }); break;
      case "popular": query = query.order("students_count", { ascending: false }); break;
      case "oldest": query = query.order("created_at", { ascending: true }); break;
      default: query = query.order("created_at", { ascending: false });
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

async function getCourseBySlug(slug) {
  try {
    const { data, error } = await sb
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

async function getLessonById(id) {
  try {
    const { data, error } = await sb
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
// 3. AUTH — المصادقة (Supabase Auth)
// ==========================================================
async function getCurrentUser() {
  try {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return null;

    const { data: profile } = await sb
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return {
      id: user.id,
      email: user.email,
      full_name: profile?.full_name || user.email.split("@")[0],
      role: profile?.role || "student",
      grade: profile?.grade || null,
      avatar_url: profile?.avatar_url,
    };
  } catch (err) {
    console.error("خطأ في جلب المستخدم:", err);
    return null;
  }
}

async function registerUser(fullName, email, password, grade = null) {
  try {
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: "student",
          grade: grade,
        },
      },
    });

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

async function loginUser(email, password) {
  try {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

async function logoutUser() {
  await sb.auth.signOut();
}

// ==========================================================
// 4. ENROLLMENTS — التسجيل في الدورات
// ==========================================================
async function getEnrollments(userId) {
  try {
    const { data, error } = await sb
      .from("enrollments")
      .select(`
        id, progress_pct, enrolled_at, completed_at,
        course:courses(id, title, slug, thumbnail_url, duration_hours)
      `)
      .eq("user_id", userId)
      .order("enrolled_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("خطأ في جلب التسجيلات:", err);
    return [];
  }
}

async function enrollInCourse(userId, courseId) {
  try {
    const { data, error } = await sb
      .from("enrollments")
      .insert({ user_id: userId, course_id: courseId, progress_pct: 0 })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") return { error: "أنت مسجل بالفعل" };
      throw error;
    }
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

// ==========================================================
// 5. LESSON PROGRESS — تقدم الدروس
// ==========================================================
async function markLessonComplete(userId, courseId, lessonId) {
  try {
    const { error } = await sb
      .from("lesson_progress")
      .upsert({
        user_id: userId,
        lesson_id: lessonId,
        course_id: courseId,
        completed: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,lesson_id" });

    if (error) throw error;
    return { error: null };
  } catch (err) {
    return { error: err.message };
  }
}

async function getLessonProgress(userId, courseId) {
  try {
    const { data, error } = await sb
      .from("lesson_progress")
      .select("lesson_id, completed")
      .eq("user_id", userId)
      .eq("course_id", courseId);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("خطأ في جلب التقدم:", err);
    return [];
  }
}

async function isLessonComplete(userId, courseId, lessonId) {
  try {
    const { data, error } = await sb
      .from("lesson_progress")
      .select("id")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .eq("completed", true)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  } catch (err) {
    return false;
  }
}

// ==========================================================
// 6. QUIZZES — الاختبارات
// ==========================================================
async function getQuizzes({ courseId = null } = {}) {
  try {
    let query = sb.from("quizzes").select(`
      *,
      course:courses(id, title, slug)
    `);

    if (courseId) query = query.eq("course_id", courseId);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("خطأ في جلب الاختبارات:", err);
    return [];
  }
}

async function getQuizById(id) {
  try {
    const { data: quiz, error: qErr } = await sb
      .from("quizzes")
      .select(`*, course:courses(id, title, slug)`)
      .eq("id", id)
      .single();

    if (qErr) throw qErr;

    const { data: questions, error: qsErr } = await sb
      .from("questions")
      .select("*")
      .eq("quiz_id", id)
      .order("position");

    if (qsErr) throw qsErr;

    quiz.questions = questions || [];
    return quiz;
  } catch (err) {
    console.error("خطأ في جلب الاختبار:", err);
    return null;
  }
}

// ==========================================================
// 7. QUIZ ATTEMPTS — محاولات الاختبارات
// ==========================================================
async function addAttempt(attempt) {
  try {
    const { data, error } = await sb
      .from("quiz_attempts")
      .insert(attempt)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

async function getAttemptsByUser(userId) {
  try {
    const { data, error } = await sb
      .from("quiz_attempts")
      .select(`
        *,
        quiz:quizzes(id, title, pass_score, course_id)
      `)
      .eq("user_id", userId)
      .order("submitted_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("خطأ في جلب المحاولات:", err);
    return [];
  }
}

async function getAllAttempts() {
  try {
    const { data, error } = await sb
      .from("quiz_attempts")
      .select(`
        *,
        quiz:quizzes(id, title, pass_score, course_id)
      `)
      .order("submitted_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("خطأ في جلب كل المحاولات:", err);
    return [];
  }
}

// ==========================================================
// 8. PRESENTATIONS — العروض
// ==========================================================
async function getAllPresentations() {
  try {
    const { data, error } = await sb
      .from("presentations")
      .select(`*, course:courses(id, title)`)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("خطأ في جلب العروض:", err);
    return [];
  }
}

async function getPresentationsByCourse(courseId) {
  try {
    const { data, error } = await sb
      .from("presentations")
      .select(`*, course:courses(id, title)`)
      .eq("course_id", courseId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    return [];
  }
}

// ==========================================================
// 9. ZOOM LINKS — روابط البث
// ==========================================================
async function getAllZoomLinks() {
  try {
    const { data, error } = await sb
      .from("zoom_links")
      .select(`*, course:courses(id, title)`)
      .order("date", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    return [];
  }
}

async function getZoomByCourse(courseId) {
  try {
    const { data, error } = await sb
      .from("zoom_links")
      .select("*")
      .eq("course_id", courseId)
      .order("date", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    return [];
  }
}

// ==========================================================
// 10. CERTIFICATES — الشهادات
// ==========================================================
function generateCertificateCode() {
  const year = new Date().getFullYear();
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const part2 = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `TA3-${year}-${part1}-${part2}`;
}

async function getOrCreateCertificate(userId, courseId) {
  try {
    // هل موجودة؟
    const { data: existing } = await sb
      .from("certificates")
      .select("*")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .maybeSingle();

    if (existing) return existing;

    // إنشاء جديدة
    const code = generateCertificateCode();
    const { data, error } = await sb
      .from("certificates")
      .insert({ user_id: userId, course_id: courseId, code })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("خطأ في الشهادة:", err);
    return null;
  }
}

// ==========================================================
// 11. SETTINGS — الإعدادات
// ==========================================================
async function getSettings() {
  try {
    const { data, error } = await sb.from("settings").select("*");
    if (error) throw error;

    const settings = {};
    (data || []).forEach(row => {
      settings[row.key] = row.value;
    });

    return {
      platform_name: settings.platform_name || "Ta3leem",
      platform_name_ar: settings.platform_name_ar || "تعليم",
      manager_name: settings.manager_name || "أحمد كرم",
      manager_title: settings.manager_title || "مدير المنصة",
      stamp_text: settings.stamp_text || "معتمد من Ta3leem",
    };
  } catch (err) {
    console.error("خطأ في الإعدادات:", err);
    return {
      platform_name: "Ta3leem",
      platform_name_ar: "تعليم",
      manager_name: "أحمد كرم",
      manager_title: "مدير المنصة",
      stamp_text: "معتمد من Ta3leem",
    };
  }
}

async function saveSettings(settings) {
  try {
    const rows = Object.entries(settings).map(([key, value]) => ({ key, value: String(value) }));
    const { error } = await sb.from("settings").upsert(rows, { onConflict: "key" });
    if (error) throw error;
    return { error: null };
  } catch (err) {
    return { error: err.message };
  }
}

// ==========================================================
// 12. USERS — المستخدمين
// ==========================================================
async function getUsers() {
  try {
    const { data, error } = await sb
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("خطأ في جلب المستخدمين:", err);
    return [];
  }
}

// ==========================================================
// 13. GRADES — السنوات الدراسية
// ==========================================================
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

// ==========================================================
// 14. DB Object — للتوافق مع الكود
// ==========================================================
const DB = {
  getCourses,
  getCategories,
  getCourseBySlug,
  getLessonById,
  getEnrollments,
  enrollInCourse,
  getCurrentUser,
  register: registerUser,
  login: loginUser,
  logout: logoutUser,
  getSettings,
  saveSettings,
  getUsers,
  getGradeName,
};