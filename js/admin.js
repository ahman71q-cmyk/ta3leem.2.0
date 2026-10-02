/* ==========================================================
   Ta3leem — Admin Panel (Full)
   ========================================================== */

const ADMIN_COURSES_KEY = "ta3leem_admin_courses";
const ADMIN_LESSONS_KEY = "ta3leem_admin_lessons";
const ADMIN_QUIZZES_KEY = "ta3leem_admin_quizzes";

// ==========================================================
// التخزين
// ==========================================================
function getAdminCourses() {
  try {
    const raw = localStorage.getItem(ADMIN_COURSES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [...LOCAL_COURSES];
}
function saveAdminCourses(c) { localStorage.setItem(ADMIN_COURSES_KEY, JSON.stringify(c)); }

function getAdminLessons() {
  try {
    const raw = localStorage.getItem(ADMIN_LESSONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const lessons = [];
  LOCAL_COURSES.forEach((c) => {
    (c.sections || []).forEach((s) => {
      (s.lessons || []).forEach((l) => {
        lessons.push({ ...l, course_id: c.id, course_title: c.title, section_title: s.title });
      });
    });
  });
  return lessons;
}
function saveAdminLessons(l) { localStorage.setItem(ADMIN_LESSONS_KEY, JSON.stringify(l)); }

function getAdminQuizzes() {
  try { return JSON.parse(localStorage.getItem(ADMIN_QUIZZES_KEY) || "[]"); }
  catch { return []; }
}
function saveAdminQuizzes(q) { localStorage.setItem(ADMIN_QUIZZES_KEY, JSON.stringify(q)); }

// ==========================================================
// Tabs
// ==========================================================
function showTab(name, e) {
  if (e) e.preventDefault();
  document.querySelectorAll(".admin-tab").forEach((t) => t.classList.add("d-none"));
  document.querySelectorAll(".admin-sidebar .nav-link").forEach((l) => l.classList.remove("active"));
  document.getElementById(`tab-${name}`).classList.remove("d-none");
  if (e && e.target) e.target.classList.add("active");

  if (name === "dashboard") renderDashboard();
  if (name === "courses") renderCourses();
  if (name === "lessons") renderLessons();
  if (name === "presentations") renderPresentations();
  if (name === "zoom") renderZoom();
  if (name === "quizzes") renderQuizzes();
  if (name === "results") renderResults();
  if (name === "students") renderStudents();
  if (name === "users") renderUsers();
  if (name === "settings") renderSettings();
}

// ==========================================================
// Dashboard
// ==========================================================
function renderDashboard() {
  const courses = getAdminCourses();
  const lessons = getAdminLessons();
  const quizzes = getAdminQuizzes();
  const users = getUsers();
  const enrolls = JSON.parse(localStorage.getItem("ta3leem_enrollments") || "[]");
  const presentations = getAllPresentations();
  const zooms = getAllZoomLinks();

  document.getElementById("statTotalCourses").textContent = courses.length;
  document.getElementById("statTotalLessons").textContent = lessons.length;
  document.getElementById("statTotalUsers").textContent = users.length;
  document.getElementById("statTotalQuizzes").textContent = quizzes.length;

  const totalStudents = users.filter((u) => u.role === "student").length;
  const totalAdmins = users.filter((u) => u.role === "admin").length;
  const totalEnrollments = enrolls.length;

  const avgRating = courses.length
    ? (courses.reduce((s, c) => s + (c.rating_avg || 0), 0) / courses.length).toFixed(1)
    : "0.0";

  const recentUsers = [...users]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const recentCourses = [...courses].slice(-3).reverse();

  const students = users.filter((u) => u.role === "student");

  const prep1 = students.filter((u) => u.grade === "prep1").length;
  const prep2 = students.filter((u) => u.grade === "prep2").length;
  const prep3 = students.filter((u) => u.grade === "prep3").length;
  const sec1 = students.filter((u) => u.grade === "sec1").length;
  const sec2 = students.filter((u) => u.grade === "sec2").length;
  const sec3 = students.filter((u) => u.grade === "sec3").length;

  const totalPrep = prep1 + prep2 + prep3;
  const totalSec = sec1 + sec2 + sec3;

  document.getElementById("dashboardStats").innerHTML = `
    <div class="col-md-6 col-lg-3">
      <div class="stat-card">
        <div class="card-body d-flex align-items-center gap-3">
          <div class="icon bg-primary-subtle text-primary"><i class="bi bi-people"></i></div>
          <div><div class="fs-3 fw-bold">${totalStudents}</div><small class="text-muted">طالب مسجّل</small></div>
        </div>
      </div>
    </div>
    <div class="col-md-6 col-lg-3">
      <div class="stat-card">
        <div class="card-body d-flex align-items-center gap-3">
          <div class="icon bg-success-subtle text-success"><i class="bi bi-person-badge"></i></div>
          <div><div class="fs-3 fw-bold">${totalAdmins}</div><small class="text-muted">مشرف</small></div>
        </div>
      </div>
    </div>
    <div class="col-md-6 col-lg-3">
      <div class="stat-card">
        <div class="card-body d-flex align-items-center gap-3">
          <div class="icon bg-info-subtle text-info"><i class="bi bi-person-check"></i></div>
          <div><div class="fs-3 fw-bold">${totalEnrollments}</div><small class="text-muted">تسجيل في دورات</small></div>
        </div>
      </div>
    </div>
    <div class="col-md-6 col-lg-3">
      <div class="stat-card">
        <div class="card-body d-flex align-items-center gap-3">
          <div class="icon bg-warning-subtle text-warning"><i class="bi bi-easel"></i></div>
          <div><div class="fs-3 fw-bold">${presentations.length}</div><small class="text-muted">عرض</small></div>
        </div>
      </div>
    </div>
    <div class="col-md-6 col-lg-3">
      <div class="stat-card">
        <div class="card-body d-flex align-items-center gap-3">
          <div class="icon bg-danger-subtle text-danger"><i class="bi bi-camera-video"></i></div>
          <div><div class="fs-3 fw-bold">${zooms.length}</div><small class="text-muted">بث مباشر</small></div>
        </div>
      </div>
    </div>
    <div class="col-md-6 col-lg-3">
      <div class="stat-card">
        <div class="card-body d-flex align-items-center gap-3">
          <div class="icon bg-warning-subtle text-warning"><i class="bi bi-star"></i></div>
          <div><div class="fs-3 fw-bold">${avgRating}</div><small class="text-muted">متوسط التقييم</small></div>
        </div>
      </div>
    </div>

    <div class="col-md-6">
      <div class="stat-card">
        <div class="card-body">
          <h6 class="fw-bold mb-3"><i class="bi bi-mortarboard text-primary"></i> توزيع الطلاب حسب المرحلة</h6>
          <div class="d-flex justify-content-between mb-2">
            <span>المرحلة الإعدادية</span>
            <strong>${totalPrep} طالب</strong>
          </div>
          <div class="progress mb-3" style="height: 8px;">
            <div class="progress-bar bg-primary" style="width: ${students.length ? (totalPrep / students.length) * 100 : 0}%"></div>
          </div>
          <div class="d-flex justify-content-between mb-2">
            <span>المرحلة الثانوية</span>
            <strong>${totalSec} طالب</strong>
          </div>
          <div class="progress" style="height: 8px;">
            <div class="progress-bar bg-success" style="width: ${students.length ? (totalSec / students.length) * 100 : 0}%"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="col-md-6">
      <div class="stat-card">
        <div class="card-body">
          <h6 class="fw-bold mb-3"><i class="bi bi-list-ol text-primary"></i> تفصيل كل سنة</h6>
          <div class="row g-2 small">
            <div class="col-6">الأول الإعدادي: <strong>${prep1}</strong></div>
            <div class="col-6">الثاني الإعدادي: <strong>${prep2}</strong></div>
            <div class="col-6">الثالث الإعدادي: <strong>${prep3}</strong></div>
            <div class="col-6">الأول الثانوي: <strong>${sec1}</strong></div>
            <div class="col-6">الثاني الثانوي: <strong>${sec2}</strong></div>
            <div class="col-6">الثالث الثانوي: <strong>${sec3}</strong></div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById("recentCourses").innerHTML = recentCourses.length
    ? recentCourses.map((c) => `
        <div class="d-flex align-items-center gap-3 p-2 border-bottom">
          <img src="${c.thumbnail_url || 'https://via.placeholder.com/60'}" style="width:60px;height:40px;object-fit:cover;border-radius:6px;">
          <div class="flex-grow-1">
            <strong>${escapeHtml(c.title)}</strong>
            <div class="small text-muted">${c.category?.name_ar || ""} — ${c.duration_hours || 0} ساعة</div>
          </div>
        </div>
      `).join("")
    : '<p class="text-muted text-center py-3">لا توجد دورات</p>';

  document.getElementById("recentUsers").innerHTML = recentUsers.length
    ? recentUsers.map((u) => `
        <tr>
          <td><strong>${escapeHtml(u.full_name || "—")}</strong></td>
          <td>${escapeHtml(u.email)}</td>
          <td><span class="badge bg-primary-subtle text-primary">${u.role === "admin" ? "مشرف" : "طالب"}</span></td>
          <td class="text-muted small">${new Date(u.created_at).toLocaleDateString("ar-EG")}</td>
        </tr>
      `).join("")
    : '<tr><td colspan="4" class="text-center text-muted py-3">لا يوجد مستخدمين</td></tr>';
}

// ==========================================================
// Courses
// ==========================================================
function renderCourses() {
  const courses = getAdminCourses();
  const tbody = document.getElementById("coursesTableBody");
  if (courses.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">لا توجد دورات</td></tr>`;
    return;
  }
  const levelNames = { beginner: "مبتدئ", intermediate: "متوسط", advanced: "متقدم" };
  tbody.innerHTML = courses.map((c) => `
    <tr>
      <td><img src="${c.thumbnail_url || 'https://via.placeholder.com/60'}" style="width:60px;height:40px;object-fit:cover;border-radius:6px;"></td>
      <td><strong>${escapeHtml(c.title)}</strong></td>
      <td>${c.category?.name_ar || "—"}</td>
      <td>${levelNames[c.level] || c.level}</td>
      <td class="text-center">${(c.sections || []).reduce((s, sec) => s + (sec.lessons?.length || 0), 0)}</td>
      <td class="text-center">
        <button class="btn btn-sm btn-outline-primary me-1" onclick="editCourse(${c.id})"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteCourse(${c.id})"><i class="bi bi-trash"></i></button>
      </td>
    </tr>
  `).join("");
}

function openCourseModal() {
  document.getElementById("courseModalTitle").textContent = "إضافة دورة";
  document.getElementById("courseForm").reset();
  document.getElementById("courseId").value = "";
  loadCategoriesIntoSelect("courseCategory");
  new bootstrap.Modal(document.getElementById("courseModal")).show();
}

function editCourse(id) {
  const c = getAdminCourses().find((x) => x.id === id);
  if (!c) return;
  document.getElementById("courseModalTitle").textContent = "تعديل دورة";
  loadCategoriesIntoSelect("courseCategory", c.category_id);
  document.getElementById("courseId").value = c.id;
  document.getElementById("courseTitle").value = c.title;
  document.getElementById("courseLevel").value = c.level;
  document.getElementById("courseDuration").value = c.duration_hours || 10;
  document.getElementById("courseStudentsCount").value = c.students_count || 0;
  document.getElementById("courseThumbnail").value = c.thumbnail_url || "";
  document.getElementById("courseDescription").value = c.description || "";
  new bootstrap.Modal(document.getElementById("courseModal")).show();
}

function saveCourse(e) {
  e.preventDefault();
  const id = document.getElementById("courseId").value;
  const catId = Number(document.getElementById("courseCategory").value);
  const cat = LOCAL_CATEGORIES.find((c) => c.id === catId);

  const data = {
    title: document.getElementById("courseTitle").value.trim(),
    level: document.getElementById("courseLevel").value,
    category_id: catId,
    category: cat ? { name_ar: cat.name_ar, icon: cat.icon } : null,
    duration_hours: Number(document.getElementById("courseDuration").value) || 10,
    students_count: Number(document.getElementById("courseStudentsCount").value) || 0,
    thumbnail_url: document.getElementById("courseThumbnail").value.trim() ||
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800",
    description: document.getElementById("courseDescription").value.trim(),
  };

  let courses = getAdminCourses();

  if (id) {
    courses = courses.map((c) => (c.id === Number(id) ? { ...c, ...data } : c));
  } else {
    const newId = Math.max(...courses.map((c) => c.id), 0) + 1;
    const slug = data.title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]/g, "") + "-" + newId;
    courses.push({ id: newId, slug, ...data, rating_avg: 5.0, rating_count: 0, sections: [] });
  }

  saveAdminCourses(courses);
  bootstrap.Modal.getInstance(document.getElementById("courseModal")).hide();
  renderCourses();
  renderDashboard();
  alert("✅ تم الحفظ بنجاح");
}

function deleteCourse(id) {
  if (!confirm("هل أنت متأكد من حذف الدورة؟")) return;
  saveAdminCourses(getAdminCourses().filter((c) => c.id !== id));
  renderCourses();
  renderDashboard();
}

function loadCategoriesIntoSelect(selectId, selected = null) {
  const select = document.getElementById(selectId);
  select.innerHTML = LOCAL_CATEGORIES.map((c) =>
    `<option value="${c.id}" ${c.id === selected ? "selected" : ""}>${c.name_ar}</option>`
  ).join("");
}

// ==========================================================
// Lessons
// ==========================================================
function renderLessons() {
  const lessons = getAdminLessons();
  const tbody = document.getElementById("lessonsTableBody");
  if (lessons.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">لا توجد دروس</td></tr>`;
    return;
  }
  tbody.innerHTML = lessons.map((l) => `
    <tr>
      <td><strong>${escapeHtml(l.title)}</strong></td>
      <td>${escapeHtml(l.course_title || "—")}</td>
      <td>${l.type === "article" ? "نصي" : l.type === "video" ? "فيديو" : "مباشر"}</td>
      <td>${l.duration_min || 0} د</td>
      <td class="text-center">
        <button class="btn btn-sm btn-outline-primary me-1" onclick="editLesson(${l.id})"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteLesson(${l.id})"><i class="bi bi-trash"></i></button>
      </td>
    </tr>
  `).join("");
}

function openLessonModal() {
  document.getElementById("lessonModalTitle").textContent = "إضافة درس";
  document.getElementById("lessonForm").reset();
  document.getElementById("lessonId").value = "";
  loadCoursesIntoLessonSelect();
  updateSectionsSelect();
  new bootstrap.Modal(document.getElementById("lessonModal")).show();
}

function editLesson(id) {
  const l = getAdminLessons().find((x) => x.id === id);
  if (!l) return;
  document.getElementById("lessonModalTitle").textContent = "تعديل درس";
  document.getElementById("lessonId").value = l.id;
  document.getElementById("lessonTitle").value = l.title;
  document.getElementById("lessonDuration").value = l.duration_min || 10;
  document.getElementById("lessonContent").value = l.content || "";
  loadCoursesIntoLessonSelect(l.course_id);
  updateSectionsSelect(l.section_title);
  new bootstrap.Modal(document.getElementById("lessonModal")).show();
}

function loadCoursesIntoLessonSelect(selected = null) {
  const select = document.getElementById("lessonCourse");
  const courses = getAdminCourses();
  select.innerHTML = courses.map((c) =>
    `<option value="${c.id}" ${c.id === selected ? "selected" : ""}>${c.title}</option>`
  ).join("");
  select.onchange = updateSectionsSelect;
}

function updateSectionsSelect(selectedTitle = null) {
  const courseId = Number(document.getElementById("lessonCourse").value);
  const course = getAdminCourses().find((c) => c.id === courseId);
  const select = document.getElementById("lessonSection");
  if (!course || !course.sections || course.sections.length === 0) {
    select.innerHTML = `<option value="">— لا توجد أقسام —</option>`;
    return;
  }
  select.innerHTML = course.sections.map((s) =>
    `<option value="${s.id}" ${s.title === selectedTitle ? "selected" : ""}>${s.title}</option>`
  ).join("");
}

function saveLesson(e) {
  e.preventDefault();
  const id = document.getElementById("lessonId").value;
  const courseId = Number(document.getElementById("lessonCourse").value);
  const course = getAdminCourses().find((c) => c.id === courseId);

  const data = {
    title: document.getElementById("lessonTitle").value.trim(),
    duration_min: Number(document.getElementById("lessonDuration").value) || 10,
    content: document.getElementById("lessonContent").value,
    type: "article",
  };

  let lessons = getAdminLessons();

  if (id) {
    lessons = lessons.map((l) => (l.id === Number(id) ? { ...l, ...data } : l));
  } else {
    const newId = Math.max(...lessons.map((l) => l.id), 0) + 1;
    lessons.push({
      id: newId, ...data,
      course_id: courseId,
      course_title: course?.title || "",
      section_title: course?.sections?.[0]?.title || "الدروس",
    });
  }

  saveAdminLessons(lessons);
  bootstrap.Modal.getInstance(document.getElementById("lessonModal")).hide();
  renderLessons();
  renderDashboard();
  alert("✅ تم الحفظ بنجاح");
}

function deleteLesson(id) {
  if (!confirm("هل أنت متأكد من حذف الدرس؟")) return;
  saveAdminLessons(getAdminLessons().filter((l) => l.id !== id));
  renderLessons();
  renderDashboard();
}

// ==========================================================
// Presentations (العروض)
// ==========================================================
function renderPresentations() {
  const pres = getAllPresentations();
  const tbody = document.getElementById("presentationsTableBody");
  if (pres.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">لا توجد عروض. أضف أول عرض.</td></tr>`;
    return;
  }
  tbody.innerHTML = pres.map((p) => {
    const course = getAdminCourses().find(c => c.id === p.course_id);
    return `
      <tr>
        <td><strong>${escapeHtml(p.title)}</strong></td>
        <td>${escapeHtml(course?.title || "—")}</td>
        <td><span class="badge bg-primary-subtle text-primary">${p.file_type.toUpperCase()}</span></td>
        <td class="small">${formatFileSize(p.file_size || 0)}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-success me-1" onclick="openPresentation(${p.id})"><i class="bi bi-eye"></i></button>
          <button class="btn btn-sm btn-outline-danger" onclick="deletePresentationAdmin(${p.id})"><i class="bi bi-trash"></i></button>
        </td>
      </tr>
    `;
  }).join("");
}

function openPresentationModal() {
  document.getElementById("presentationModalTitle").textContent = "إضافة عرض";
  document.getElementById("presentationForm").reset();
  document.getElementById("presentationId").value = "";
  loadCoursesIntoPresentationSelect();
  new bootstrap.Modal(document.getElementById("presentationModal")).show();
}

function loadCoursesIntoPresentationSelect(selected = null) {
  const select = document.getElementById("presentationCourse");
  const courses = getAdminCourses();
  select.innerHTML = courses.map((c) =>
    `<option value="${c.id}" ${c.id === selected ? "selected" : ""}>${c.title}</option>`
  ).join("");
}

function submitPresentationForm() {
  const form = document.getElementById("presentationForm");
  if (!form) return;
  const evt = new Event("submit", { cancelable: true, bubbles: true });
  form.dispatchEvent(evt);
}

async function savePresentation(e) {
  if (e) e.preventDefault();
  console.log("🚀 savePresentation بدأت");

  const title = document.getElementById("presentationTitle").value.trim();
  const courseId = Number(document.getElementById("presentationCourse").value);
  const desc = document.getElementById("presentationDesc").value.trim();
  const fileInput = document.getElementById("presentationFile");
  const file = fileInput.files[0];

  console.log("📄 الملف:", file ? file.name : "مفيش");

  if (!title) { alert("⚠️ اكتب عنوان العرض"); return; }
  if (!file) { alert("⚠️ اختر ملف"); return; }

  const submitBtn = document.querySelector('#presentationModal .modal-footer button.btn-primary');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> جاري الرفع...`;
  }

  try {
    const base64 = await fileToBase64(file);
    const ext = file.name.split(".").pop().toLowerCase();
    const fileType = ext === "pdf" ? "pdf" : ext === "pptx" ? "pptx" : "ppt";

    createPresentation({
      course_id: courseId,
      title,
      description: desc,
      fileBase64: base64,
      fileName: file.name,
      fileType,
      fileSize: file.size,
    });

    bootstrap.Modal.getInstance(document.getElementById("presentationModal")).hide();
    renderPresentations();
    renderDashboard();
    alert("✅ تم رفع العرض بنجاح");
  } catch (err) {
    console.error("❌ خطأ:", err);
    alert("❌ " + err.message);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i class="bi bi-save"></i> رفع وحفظ`;
    }
  }
}

function deletePresentationAdmin(id) {
  if (!confirm("هل أنت متأكد من حذف العرض؟")) return;
  deletePresentation(id);
  renderPresentations();
  renderDashboard();
}

// ==========================================================
// Zoom Links
// ==========================================================
function renderZoom() {
  const zooms = getAllZoomLinks();
  const tbody = document.getElementById("zoomTableBody");
  if (zooms.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">لا توجد روابط.</td></tr>`;
    return;
  }
  tbody.innerHTML = zooms.map((z) => {
    const course = getAdminCourses().find(c => c.id === z.course_id);
    return `
      <tr>
        <td><strong>${escapeHtml(z.title)}</strong></td>
        <td>${escapeHtml(course?.title || "—")}</td>
        <td>
          <a href="${escapeHtml(z.url)}" target="_blank" class="text-primary small">
            <i class="bi bi-link-45deg"></i> فتح
          </a>
        </td>
        <td class="small">${z.date ? new Date(z.date).toLocaleString("ar-EG") : "—"}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-danger" onclick="deleteZoomAdmin(${z.id})"><i class="bi bi-trash"></i></button>
        </td>
      </tr>
    `;
  }).join("");
}

function openZoomModal() {
  document.getElementById("zoomModalTitle").textContent = "إضافة رابط Zoom";
  document.getElementById("zoomForm").reset();
  document.getElementById("zoomId").value = "";
  loadCoursesIntoZoomSelect();
  new bootstrap.Modal(document.getElementById("zoomModal")).show();
}

function loadCoursesIntoZoomSelect(selected = null) {
  const select = document.getElementById("zoomCourse");
  const courses = getAdminCourses();
  select.innerHTML = courses.map((c) =>
    `<option value="${c.id}" ${c.id === selected ? "selected" : ""}>${c.title}</option>`
  ).join("");
}

function saveZoom(e) {
  e.preventDefault();
  const title = document.getElementById("zoomTitle").value.trim();
  const courseId = Number(document.getElementById("zoomCourse").value);
  const url = document.getElementById("zoomUrl").value.trim();
  const date = document.getElementById("zoomDate").value;

  const all = getAllZoomLinks();
  const newId = all.length > 0 ? Math.max(...all.map(z => z.id)) + 1 : 1;
  all.push({
    id: newId,
    course_id: courseId,
    title, url,
    date: date || null,
    created_at: new Date().toISOString(),
  });
  saveZoomLinks(all);

  bootstrap.Modal.getInstance(document.getElementById("zoomModal")).hide();
  renderZoom();
  renderDashboard();
  alert("✅ تم إضافة الرابط بنجاح");
}

function deleteZoomAdmin(id) {
  if (!confirm("هل أنت متأكد من حذف الرابط؟")) return;
  saveZoomLinks(getAllZoomLinks().filter(z => z.id !== Number(id)));
  renderZoom();
  renderDashboard();
}

// ==========================================================
// Quizzes
// ==========================================================
function renderQuizzes() {
  const quizzes = getAdminQuizzes();
  const tbody = document.getElementById("quizzesTableBody");
  if (quizzes.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">لا توجد اختبارات</td></tr>`;
    return;
  }
  tbody.innerHTML = quizzes.map((q) => `
    <tr>
      <td><strong>${escapeHtml(q.title)}</strong></td>
      <td>${escapeHtml(q.course_title || "—")}</td>
      <td class="text-center">${q.questions?.length || 0}</td>
      <td class="text-center">${q.time_limit_min || 15} د</td>
      <td class="text-center">${q.pass_score || 60}%</td>
      <td class="text-center">
        <button class="btn btn-sm btn-outline-primary me-1" onclick="editQuiz(${q.id})"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteQuiz(${q.id})"><i class="bi bi-trash"></i></button>
      </td>
    </tr>
  `).join("");
}

function openQuizModal() {
  document.getElementById("quizModalTitle").textContent = "إضافة اختبار";
  document.getElementById("quizForm").reset();
  document.getElementById("quizId").value = "";
  document.getElementById("questionsList").innerHTML = "";
  questionCounter = 0;  // ✅ صفّر العداد
  loadCoursesIntoQuizSelect();
  addQuestion();
  new bootstrap.Modal(document.getElementById("quizModal")).show();
}

function editQuiz(id) {
  const q = getAdminQuizzes().find((x) => x.id === id);
  if (!q) return;
  document.getElementById("quizModalTitle").textContent = "تعديل اختبار";
  document.getElementById("quizId").value = q.id;
  document.getElementById("quizTitle").value = q.title;
  document.getElementById("quizCourse").value = q.course_id;
  document.getElementById("quizDuration").value = q.time_limit_min || 15;
  document.getElementById("quizPassScore").value = q.pass_score || 60;
  loadCoursesIntoQuizSelect(q.course_id);
  document.getElementById("questionsList").innerHTML = "";
  questionCounter = 0;  // ✅ صفّر العداد
  (q.questions || []).forEach((question) => addQuestion(question));
  new bootstrap.Modal(document.getElementById("quizModal")).show();
}

function loadCoursesIntoQuizSelect(selected = null) {
  const select = document.getElementById("quizCourse");
  const courses = getAdminCourses();
  select.innerHTML = courses.map((c) =>
    `<option value="${c.id}" ${c.id === selected ? "selected" : ""}>${c.title}</option>`
  ).join("");
}

let questionCounter = 0;

function addQuestion(question = null) {
  const container = document.getElementById("questionsList");
  const id = ++questionCounter;
  const q = question || { type: "mcq", text: "", options: ["", "", "", ""], correct_answer: 0, points: 5 };

  const div = document.createElement("div");
  div.className = "question-card border rounded-3 p-3 mb-3 bg-light";
  div.dataset.qid = id;
  div.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-2">
      <strong class="text-primary">سؤال #${id}</strong>
      <button type="button" class="btn btn-sm btn-outline-danger" onclick="this.closest('.question-card').remove()">
        <i class="bi bi-trash"></i> حذف
      </button>
    </div>
    <div class="mb-2">
      <label class="form-label small fw-semibold">نص السؤال</label>
      <input type="text" class="form-control form-control-sm q-text" value="${escapeHtml(q.text)}">
    </div>
    <div class="row g-2 mb-2">
      <div class="col-md-6">
        <label class="form-label small fw-semibold">النوع</label>
        <select class="form-select form-select-sm q-type">
          <option value="mcq" ${q.type === "mcq" ? "selected" : ""}>اختيار من متعدد</option>
          <option value="tf" ${q.type === "tf" ? "selected" : ""}>صح / خطأ</option>
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label small fw-semibold">النقاط</label>
        <input type="number" class="form-control form-control-sm q-points" value="${q.points || 5}" min="1">
      </div>
    </div>
    <div class="q-options-mcq" ${q.type !== "mcq" ? 'style="display:none"' : ""}>
      <label class="form-label small fw-semibold">الخيارات (اختر الصحيحة)</label>
      ${[0,1,2,3].map((i) => `
        <div class="input-group input-group-sm mb-1">
          <span class="input-group-text">
            <input type="radio" name="correct_${id}" value="${i}" ${q.correct_answer === i ? "checked" : ""}>
          </span>
          <input type="text" class="form-control q-option" data-idx="${i}" value="${escapeHtml(q.options?.[i] || "")}">
        </div>
      `).join("")}
    </div>
    <div class="q-options-tf" ${q.type !== "tf" ? 'style="display:none"' : ""}>
      <label class="form-label small fw-semibold">الإجابة الصحيحة</label>
      <div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="tf_${id}" value="true" ${q.correct_answer === true ? "checked" : ""}>
          <label class="form-check-label">صح</label>
        </div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="tf_${id}" value="false" ${q.correct_answer === false ? "checked" : ""}>
          <label class="form-check-label">خطأ</label>
        </div>
      </div>
    </div>
  `;

  container.appendChild(div);

  div.querySelector(".q-type").addEventListener("change", (e) => {
    const type = e.target.value;
    div.querySelector(".q-options-mcq").style.display = type === "mcq" ? "" : "none";
    div.querySelector(".q-options-tf").style.display = type === "tf" ? "" : "none";
  });
}

// ==========================================================
// ✅ جمع الأسئلة مع IDs فريدة
// ==========================================================
function collectQuestions() {
  const cards = document.querySelectorAll(".question-card");
  const questions = [];
  let qIndex = 0;
  cards.forEach((card) => {
    const cardId = card.dataset.qid;
    const type = card.querySelector(".q-type").value;
    const text = card.querySelector(".q-text").value.trim();
    if (!text) return;

    let correct_answer = null;
    let options = [];

    if (type === "mcq") {
      options = [...card.querySelectorAll(".q-option")].map((i) => i.value.trim());
      const selected = card.querySelector(`input[name="correct_${cardId}"]:checked`);
      correct_answer = selected ? Number(selected.value) : 0;
    } else {
      const selected = card.querySelector(`input[name="tf_${cardId}"]:checked`);
      correct_answer = selected ? selected.value === "true" : true;
    }

    qIndex++;
    questions.push({
      id: qIndex,   // ✅ ID فريد لكل سؤال
      type, text, options, correct_answer,
      points: Number(card.querySelector(".q-points").value) || 5,
    });
  });
  return questions;
}

function saveQuiz(e) {
  e.preventDefault();
  const id = document.getElementById("quizId").value;
  const courseId = Number(document.getElementById("quizCourse").value);
  const course = getAdminCourses().find((c) => c.id === courseId);
  const questions = collectQuestions();

  if (questions.length === 0) {
    alert("⚠️ أضف سؤال واحد على الأقل");
    return;
  }

  const data = {
    title: document.getElementById("quizTitle").value.trim(),
    course_id: courseId,
    course_title: course?.title || "",
    time_limit_min: Number(document.getElementById("quizDuration").value) || 15,
    pass_score: Number(document.getElementById("quizPassScore").value) || 60,
    questions,
  };

  let quizzes = getAdminQuizzes();

  if (id) {
    quizzes = quizzes.map((q) => (q.id === Number(id) ? { ...q, ...data } : q));
  } else {
    const newId = Math.max(...quizzes.map((q) => q.id), 0) + 1;
    quizzes.push({ id: newId, ...data });
  }

  saveAdminQuizzes(quizzes);
  bootstrap.Modal.getInstance(document.getElementById("quizModal")).hide();
  renderQuizzes();
  renderDashboard();
  alert("✅ تم حفظ الاختبار بنجاح");
}

function deleteQuiz(id) {
  if (!confirm("هل أنت متأكد من حذف الاختبار؟")) return;
  saveAdminQuizzes(getAdminQuizzes().filter((q) => q.id !== id));
  renderQuizzes();
  renderDashboard();
}

// ==========================================================
// Results
// ==========================================================
function renderResults() {
  const attempts = getAllAttempts();
  const users = getUsers();

  const totalAttempts = attempts.length;
  const uniqueStudents = new Set(attempts.map((a) => a.user_id)).size;
  const passed = attempts.filter((a) => {
    const pct = a.total_points > 0 ? (a.score / a.total_points) * 100 : 0;
    return pct >= (a.pass_score || 60);
  }).length;
  const avgScore = totalAttempts > 0
    ? Math.round(attempts.reduce((s, a) => s + (a.total_points > 0 ? (a.score / a.total_points) * 100 : 0), 0) / totalAttempts)
    : 0;

  document.getElementById("resultsStats").innerHTML = `
    <div class="col-md-3">
      <div class="stat-card"><div class="card-body d-flex align-items-center gap-3">
        <div class="icon bg-primary-subtle text-primary"><i class="bi bi-clipboard-check"></i></div>
        <div><div class="fs-3 fw-bold">${totalAttempts}</div><small class="text-muted">محاولة</small></div>
      </div></div>
    </div>
    <div class="col-md-3">
      <div class="stat-card"><div class="card-body d-flex align-items-center gap-3">
        <div class="icon bg-info-subtle text-info"><i class="bi bi-people"></i></div>
        <div><div class="fs-3 fw-bold">${uniqueStudents}</div><small class="text-muted">طالب</small></div>
      </div></div>
    </div>
    <div class="col-md-3">
      <div class="stat-card"><div class="card-body d-flex align-items-center gap-3">
        <div class="icon bg-success-subtle text-success"><i class="bi bi-check-circle"></i></div>
        <div><div class="fs-3 fw-bold">${passed}</div><small class="text-muted">ناجح</small></div>
      </div></div>
    </div>
    <div class="col-md-3">
      <div class="stat-card"><div class="card-body d-flex align-items-center gap-3">
        <div class="icon bg-warning-subtle text-warning"><i class="bi bi-graph-up"></i></div>
        <div><div class="fs-3 fw-bold">${avgScore}%</div><small class="text-muted">متوسط</small></div>
      </div></div>
    </div>
  `;

  const tbody = document.getElementById("resultsTableBody");
  if (attempts.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">لا توجد محاولات بعد</td></tr>`;
    return;
  }

  const sorted = [...attempts].sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));

  tbody.innerHTML = sorted.map((a) => {
    const user = users.find((u) => u.id === a.user_id);
    const pct = a.total_points > 0 ? Math.round((a.score / a.total_points) * 100) : 0;
    const isPassed = pct >= (a.pass_score || 60);
    return `
      <tr>
        <td><strong>${escapeHtml(user?.full_name || "مجهول")}</strong>
            <div class="small text-muted">${escapeHtml(user?.email || "")}</div></td>
        <td>${escapeHtml(a.quiz_title || "—")}</td>
        <td class="text-center"><span class="badge bg-primary-subtle text-primary">${getGradeName(user?.grade)}</span></td>
        <td class="text-center"><strong>${a.score}</strong> / ${a.total_points}</td>
        <td class="text-center"><span class="badge ${isPassed ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}">${pct}%</span></td>
        <td class="text-center"><span class="badge ${isPassed ? "bg-success" : "bg-danger"}">${isPassed ? "ناجح" : "راسب"}</span></td>
        <td class="text-center text-muted small">${new Date(a.submitted_at).toLocaleDateString("ar-EG")}</td>
      </tr>
    `;
  }).join("");
}

// ==========================================================
// Users
// ==========================================================
function renderUsers() {
  const users = getUsers();
  const tbody = document.getElementById("usersTableBody");
  if (users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">لا يوجد مستخدمين</td></tr>`;
    return;
  }
  tbody.innerHTML = users.map((u) => `
    <tr>
      <td><strong>${escapeHtml(u.full_name)}</strong></td>
      <td>${escapeHtml(u.email)}</td>
      <td><span class="badge ${u.role === "admin" ? "bg-danger-subtle text-danger" : "bg-primary-subtle text-primary"}">${u.role === "admin" ? "مشرف" : "طالب"}</span></td>
      <td class="small">${u.role === "admin" ? "—" : getGradeName(u.grade)}</td>
      <td class="text-muted small">${new Date(u.created_at).toLocaleDateString("ar-EG")}</td>
    </tr>
  `).join("");
}

// ==========================================================
// Students
// ==========================================================
function renderStudents() {
  const users = getUsers().filter((u) => u.role === "student");
  const tbody = document.getElementById("studentsTableBody");
  if (users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">لا يوجد طلاب بعد.</td></tr>`;
    return;
  }
  tbody.innerHTML = users.map((u) => `
    <tr>
      <td><strong>${escapeHtml(u.full_name)}</strong></td>
      <td><code class="text-primary">${escapeHtml(u.email)}</code></td>
      <td><code class="text-danger">${escapeHtml(u.password || "—")}</code></td>
      <td><span class="badge bg-primary-subtle text-primary">${getGradeName(u.grade)}</span></td>
      <td class="small text-muted">${new Date(u.created_at).toLocaleDateString("ar-EG")}</td>
      <td class="text-center">
        <button class="btn btn-sm btn-outline-danger" onclick="deleteStudent('${u.id}')"><i class="bi bi-trash"></i></button>
      </td>
    </tr>
  `).join("");
}

function openStudentModal() {
  document.getElementById("studentForm").reset();
  document.getElementById("studentResult").classList.add("d-none");
  new bootstrap.Modal(document.getElementById("studentModal")).show();
}

function createStudent(e) {
  e.preventDefault();
  const fullName = document.getElementById("studentName").value.trim();
  const grade = document.getElementById("studentGrade").value;
  if (!fullName || !grade) { alert("⚠️ املأ الاسم والسنة"); return; }

  const users = getUsers();
  let email = generateEmail(fullName, grade);
  let attempts = 0;
  while (users.find((u) => u.email === email) && attempts < 10) {
    email = generateEmail(fullName, grade);
    attempts++;
  }
  const password = generatePassword();
  const student = {
    id: "u_" + Date.now(),
    full_name: fullName, email, password,
    role: "student", grade,
    created_at: new Date().toISOString(),
  };
  users.push(student);
  saveUsers(users);

  const resultBox = document.getElementById("studentResult");
  resultBox.classList.remove("d-none");
  resultBox.innerHTML = `
    <div class="alert alert-success">
      <h6 class="fw-bold"><i class="bi bi-check-circle-fill"></i> تم إنشاء حساب الطالب</h6>
      <div class="p-3 bg-white rounded border">
        <div class="mb-2"><strong>الاسم:</strong> ${escapeHtml(fullName)}</div>
        <div class="mb-2"><strong>الإيميل:</strong> <code>${escapeHtml(email)}</code></div>
        <div class="mb-2"><strong>الرقم السري:</strong> <code>${escapeHtml(password)}</code></div>
        <div><strong>السنة:</strong> ${getGradeName(grade)}</div>
      </div>
      <button class="btn btn-sm btn-primary mt-3" onclick="copyStudentData('${fullName}', '${email}', '${password}', '${getGradeName(grade)}')">
        <i class="bi bi-clipboard-check"></i> نسخ كل البيانات
      </button>
    </div>
  `;

  renderStudents();
  renderDashboard();
}

function deleteStudent(id) {
  if (!confirm("هل أنت متأكد من حذف الطالب؟")) return;
  saveUsers(getUsers().filter((u) => u.id !== id));
  renderStudents();
  renderDashboard();
}

function copyStudentData(name, email, password, grade) {
  const text = `بيانات الدخول لمنصة Ta3leem:\n────────────────────\nالاسم: ${name}\nالإيميل: ${email}\nالرقم السري: ${password}\nالسنة الدراسية: ${grade}\n────────────────────`;
  navigator.clipboard.writeText(text).then(() => showToast("✅ تم نسخ كل البيانات"));
}

function showToast(msg) {
  const toast = document.createElement("div");
  toast.className = "position-fixed bottom-0 end-0 m-3 p-3 bg-success text-white rounded shadow";
  toast.style.zIndex = "9999";
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

// ==========================================================
// Settings — إعدادات المنصة
// ==========================================================
function renderSettings() {
  const settings = getSettings();

  const el = (id) => document.getElementById(id);
  if (el("settingPlatformNameAr")) el("settingPlatformNameAr").value = settings.platform_name_ar || "";
  if (el("settingPlatformName")) el("settingPlatformName").value = settings.platform_name || "";
  if (el("settingStampText")) el("settingStampText").value = settings.stamp_text || "";
  if (el("settingManagerName")) el("settingManagerName").value = settings.manager_name || "";
  if (el("settingManagerTitle")) el("settingManagerTitle").value = settings.manager_title || "";
}

function savePlatformSettings() {
  const settings = {
    platform_name: document.getElementById("settingPlatformName").value.trim() || "Ta3leem",
    platform_name_ar: document.getElementById("settingPlatformNameAr").value.trim() || "تعليم",
    stamp_text: document.getElementById("settingStampText").value.trim() || "معتمد من Ta3leem",
    manager_name: document.getElementById("settingManagerName").value.trim() || "أحمد كرم",
    manager_title: document.getElementById("settingManagerTitle").value.trim() || "مدير المنصة",
  };
  saveSettings(settings);
  alert("✅ تم حفظ الإعدادات بنجاح");
}
// ==========================================================
// Init
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
  renderDashboard();
});