/* ==========================================================
   Ta3leem — Admin Panel (Supabase)
   ========================================================== */

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
  if (name === "enrollments") renderEnrollments(); 
  if (name === "users") renderUsers();
  if (name === "settings") renderSettings();
}

// ==========================================================
// 1. Dashboard
// ==========================================================
async function renderDashboard() {
  const courses = await getCourses({ limit: 999 });
  const lessons = await sb.from("lessons").select("id");
  const quizzes = await getQuizzes();
  const users = await getUsers();
  const presentations = await getAllPresentations();
  const zooms = await getAllZoomLinks();
  const enrolls = await sb.from("enrollments").select("id");

  document.getElementById("statTotalCourses").textContent = courses.length;
  document.getElementById("statTotalLessons").textContent = lessons.data?.length || 0;
  document.getElementById("statTotalUsers").textContent = users.length;
  document.getElementById("statTotalQuizzes").textContent = quizzes.length;

  const totalStudents = users.filter((u) => u.role === "student").length;
  const totalAdmins = users.filter((u) => u.role === "admin").length;
  const totalEnrollments = enrolls.data?.length || 0;

  const avgRating = courses.length
    ? (courses.reduce((s, c) => s + (c.rating_avg || 0), 0) / courses.length).toFixed(1)
    : "0.0";

  const recentUsers = users.slice(0, 5);
  const recentCourses = courses.slice(-3).reverse();

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
          <div><div class="fs-3 fw-bold">${totalStudents}</div><small class="text-muted">طالب</small></div>
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
          <div><div class="fs-3 fw-bold">${totalEnrollments}</div><small class="text-muted">تسجيل</small></div>
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
          <div><div class="fs-3 fw-bold">${zooms.length}</div><small class="text-muted">بث</small></div>
        </div>
      </div>
    </div>
    <div class="col-md-6 col-lg-3">
      <div class="stat-card">
        <div class="card-body d-flex align-items-center gap-3">
          <div class="icon bg-warning-subtle text-warning"><i class="bi bi-star"></i></div>
          <div><div class="fs-3 fw-bold">${avgRating}</div><small class="text-muted">متوسط</small></div>
        </div>
      </div>
    </div>

    <div class="col-md-6">
      <div class="stat-card">
        <div class="card-body">
          <h6 class="fw-bold mb-3"><i class="bi bi-mortarboard text-primary"></i> توزيع الطلاب</h6>
          <div class="d-flex justify-content-between mb-2"><span>إعدادي</span><strong>${totalPrep}</strong></div>
          <div class="progress mb-3" style="height: 8px;">
            <div class="progress-bar bg-primary" style="width: ${students.length ? (totalPrep / students.length) * 100 : 0}%"></div>
          </div>
          <div class="d-flex justify-content-between mb-2"><span>ثانوي</span><strong>${totalSec}</strong></div>
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
            <div class="small text-muted">${c.duration_hours || 0} ساعة</div>
          </div>
        </div>
      `).join("")
    : '<p class="text-muted text-center py-3">لا توجد دورات</p>';

  document.getElementById("recentUsers").innerHTML = recentUsers.length
    ? recentUsers.map((u) => `
        <tr>
          <td><strong>${escapeHtml(u.full_name || "—")}</strong></td>
          <td>${escapeHtml(u.email || "—")}</td>
          <td><span class="badge bg-primary-subtle text-primary">${u.role === "admin" ? "مشرف" : "طالب"}</span></td>
          <td class="text-muted small">${new Date(u.created_at).toLocaleDateString("ar-EG")}</td>
        </tr>
      `).join("")
    : '<tr><td colspan="4" class="text-center text-muted py-3">لا يوجد مستخدمين</td></tr>';
}

// ==========================================================
// 2. Courses
// ==========================================================
async function renderCourses() {
  const courses = await getCourses({ limit: 999 });
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
      <td class="text-center">—</td>
      <td class="text-center">
        <button class="btn btn-sm btn-outline-primary me-1" onclick="editCourse(${c.id})"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteCourse(${c.id})"><i class="bi bi-trash"></i></button>
      </td>
    </tr>
  `).join("");
}
// ==========================================================
// Helper: تحميل التصنيفات في Select
// ==========================================================
async function loadCategoriesIntoSelect(selectId, selected = null) {
  try {
    const cats = await getCategories();
    const select = document.getElementById(selectId);
    if (!select) {
      console.warn("Select not found:", selectId);
      return;
    }
    select.innerHTML = cats.map((c) =>
      `<option value="${c.id}" ${c.id === selected ? "selected" : ""}>${escapeHtml(c.name_ar)}</option>`
    ).join("");
  } catch (err) {
    console.error("خطأ في تحميل التصنيفات:", err);
  }
}
async function openCourseModal() {
  document.getElementById("courseModalTitle").textContent = "إضافة دورة";
  document.getElementById("courseForm").reset();
  document.getElementById("courseId").value = "";
  
  // ✅ انتظر تحميل التصنيفات
  await loadCategoriesIntoSelect("courseCategory");
  
  // ✅ بعدين افتح الـ Modal
  new bootstrap.Modal(document.getElementById("courseModal")).show();
}

async function editCourse(id) {
  const { data: c } = await sb.from("courses").select("*").eq("id", id).single();
  if (!c) return;
  document.getElementById("courseModalTitle").textContent = "تعديل دورة";
  await loadCategoriesIntoSelect("courseCategory", c.category_id);
  document.getElementById("courseId").value = c.id;
  document.getElementById("courseTitle").value = c.title;
  document.getElementById("courseLevel").value = c.level;
  document.getElementById("courseDuration").value = c.duration_hours || 10;
  document.getElementById("courseStudentsCount").value = c.students_count || 0;
  document.getElementById("courseThumbnail").value = c.thumbnail_url || "";
  document.getElementById("courseDescription").value = c.description || "";
  new bootstrap.Modal(document.getElementById("courseModal")).show();
}

async function saveCourse(e) {
  e.preventDefault();
  const id = document.getElementById("courseId").value;

  const title = document.getElementById("courseTitle").value.trim();
  const level = document.getElementById("courseLevel").value;
  const categoryId = document.getElementById("courseCategory").value;
  const duration = document.getElementById("courseDuration").value;
  const studentsCount = document.getElementById("courseStudentsCount").value;
  const thumbnail = document.getElementById("courseThumbnail").value.trim();
  const description = document.getElementById("courseDescription").value.trim();

  // ✅ تحقق من الحقول الإلزامية
  if (!title) {
    return showAlertModal("warning", "اكتب عنوان الدورة");
  }
  if (!categoryId) {
    return showAlertModal("warning", "اختر تصنيف الدورة");
  }
  if (!description) {
    return showAlertModal("warning", "اكتب وصف الدورة");
  }

  const data = {
    title,
    level,
    category_id: Number(categoryId),
    duration_hours: Number(duration) || 10,
    students_count: Number(studentsCount) || 0,
    thumbnail_url: thumbnail ||
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800",
    description,
  };

  // ✅ زر الحفظ — عرض loading
  const submitBtn = document.querySelector('#courseModal .modal-footer button.btn-primary');
  const originalBtnHTML = submitBtn ? submitBtn.innerHTML : "";

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> جاري الحفظ...`;
  }

  try {
    if (id) {
      // ✅ تعديل
      const { error } = await sb
        .from("courses")
        .update(data)
        .eq("id", Number(id));

      if (error) throw error;

    } else {
      // ✅ إضافة جديدة
      const slug = title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]/g, "") + "-" + Date.now();

      const { error } = await sb
        .from("courses")
        .insert({ ...data, slug, status: "published" });

      if (error) throw error;
    }

    // ✅ إغلاق الـ modal
    bootstrap.Modal.getInstance(document.getElementById("courseModal")).hide();

    // ✅ رسالة نجاح
    showAlertModal(
      "success",
      id ? "تم تحديث الدورة بنجاح" : "تم إضافة الدورة بنجاح"
    );

    // ✅ تحديث القوائم
    renderCourses();
    renderDashboard();

  } catch (err) {
    console.error("خطأ في حفظ الدورة:", err);
    showAlertModal("danger", err.message || "فشل حفظ الدورة");

  } finally {
    // ✅ إرجاع الزر لحالته
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHTML;
    }
  }
}
// ✅ حذف دورة
async function deleteCourse(id) {
  confirmAdmin("هل تريد حذف هذه الدورة؟ سيتم حذف كل الدروس المرتبطة بها.", async () => {
    try {
      const { error } = await sb.from("courses").delete().eq("id", id);
      if (error) throw error;

      showAlertModal("success", "تم حذف الدورة بنجاح");
      renderCourses();
      renderDashboard();
    } catch (err) {
      console.error("خطأ في حذف الدورة:", err);
      showAlertModal("danger", err.message || "فشل حذف الدورة");
    }
  });
}
// ==========================================================
// 3. Lessons
// ==========================================================
async function renderLessons() {
  const { data: lessons } = await sb
    .from("lessons")
    .select(`id, title, type, duration_min, section:sections(id, title, course:courses(id, title))`);

  const tbody = document.getElementById("lessonsTableBody");
  if (!lessons || lessons.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">لا توجد دروس</td></tr>`;
    return;
  }
  tbody.innerHTML = lessons.map((l) => `
    <tr>
      <td><strong>${escapeHtml(l.title)}</strong></td>
      <td>${escapeHtml(l.section?.course?.title || "—")}</td>
      <td>${l.type === "article" ? "نصي" : l.type === "video" ? "فيديو" : "مباشر"}</td>
      <td>${l.duration_min || 0} د</td>
      <td class="text-center">
        <button class="btn btn-sm btn-outline-primary me-1" onclick="editLesson(${l.id})"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteLesson(${l.id})"><i class="bi bi-trash"></i></button>
      </td>
    </tr>
  `).join("");
}

async function openLessonModal() {
  document.getElementById("lessonModalTitle").textContent = "إضافة درس";
  document.getElementById("lessonForm").reset();
  document.getElementById("lessonId").value = "";
  await loadCoursesIntoLessonSelect();
  new bootstrap.Modal(document.getElementById("lessonModal")).show();
}

async function editLesson(id) {
  const { data: l } = await sb.from("lessons").select("*").eq("id", id).single();
  if (!l) return;
  document.getElementById("lessonModalTitle").textContent = "تعديل درس";
  document.getElementById("lessonId").value = l.id;
  document.getElementById("lessonTitle").value = l.title;
  document.getElementById("lessonDuration").value = l.duration_min || 10;
  document.getElementById("lessonContent").value = l.content || "";
  await loadCoursesIntoLessonSelect(l.section_id);
  new bootstrap.Modal(document.getElementById("lessonModal")).show();
}

async function loadCoursesIntoLessonSelect(selectedSectionId = null) {
  const { data: sections } = await sb
    .from("sections")
    .select(`id, title, course:courses(id, title)`)
    .order("position");

  const select = document.getElementById("lessonCourse");
  select.innerHTML = (sections || []).map((s) =>
    `<option value="${s.id}" ${s.id === selectedSectionId ? "selected" : ""}>${escapeHtml(s.course?.title || "—")} → ${escapeHtml(s.title)}</option>`
  ).join("");
}

async function saveLesson(e) {
  e.preventDefault();
  const id = document.getElementById("lessonId").value;
  const sectionId = Number(document.getElementById("lessonCourse").value);

  const data = {
    section_id: sectionId,
    title: document.getElementById("lessonTitle").value.trim(),
    duration_min: Number(document.getElementById("lessonDuration").value) || 10,
    content: document.getElementById("lessonContent").value,
    type: "article",
  };

  if (id) {
    const { error } = await sb.from("lessons").update(data).eq("id", Number(id));
    if (error) return showAlertModal("danger", error.message);
  } else {
    const { error } = await sb.from("lessons").insert(data);
    if (error) return showAlertModal("danger", error.message);
  }

  bootstrap.Modal.getInstance(document.getElementById("lessonModal")).hide();
  showAlertModal("success", "تم حفظ الدرس بنجاح");
  renderLessons();
  renderDashboard();
}

async function deleteLesson(id) {
  confirmAdmin("هل تريد حذف هذا الدرس؟", async () => {
    try {
      const { error } = await sb.from("lessons").delete().eq("id", id);
      if (error) throw error;
      showAlertModal("success", "تم حذف الدرس بنجاح");
      renderLessons();
      renderDashboard();
    } catch (err) {
      showAlertModal("danger", err.message);
    }
  });
}

// ==========================================================
// 4. Presentations
// ==========================================================
async function renderPresentations() {
  const pres = await getAllPresentations();
  const tbody = document.getElementById("presentationsTableBody");
  if (pres.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">لا توجد عروض</td></tr>`;
    return;
  }
  tbody.innerHTML = pres.map((p) => `
    <tr>
      <td><strong>${escapeHtml(p.title)}</strong></td>
      <td>${escapeHtml(p.course?.title || "—")}</td>
      <td><span class="badge bg-primary-subtle text-primary">${(p.file_type || "pdf").toUpperCase()}</span></td>
      <td class="small">${formatFileSize(p.file_size || 0)}</td>
      <td class="text-center">
        <a href="${p.file_url}" target="_blank" class="btn btn-sm btn-outline-success me-1"><i class="bi bi-eye"></i></a>
        <button class="btn btn-sm btn-outline-danger" onclick="deletePresentationAdmin(${p.id})"><i class="bi bi-trash"></i></button>
      </td>
    </tr>
  `).join("");
}

async function openPresentationModal() {
  document.getElementById("presentationModalTitle").textContent = "إضافة عرض";
  document.getElementById("presentationForm").reset();
  document.getElementById("presentationId").value = "";
  await loadCoursesIntoPresentationSelect();
  new bootstrap.Modal(document.getElementById("presentationModal")).show();
}

async function loadCoursesIntoPresentationSelect(selected = null) {
  const courses = await getCourses({ limit: 999 });
  const select = document.getElementById("presentationCourse");
  select.innerHTML = courses.map((c) =>
    `<option value="${c.id}" ${c.id === selected ? "selected" : ""}>${c.title}</option>`
  ).join("");
}

async function savePresentation(e) {
  if (e) e.preventDefault();

  const title = document.getElementById("presentationTitle").value.trim();
  const courseId = Number(document.getElementById("presentationCourse").value);
  const desc = document.getElementById("presentationDesc").value.trim();
  const file = document.getElementById("presentationFile").files[0];

  if (!title) return showAlertModal("warning", "اكتب عنوان العرض");
  if (!file) return showAlertModal("warning", "اختر ملف للعرض");

  // ✅ تحقق من حجم الملف
  const MAX_SIZE = 3 * 1024 * 1024; // 3 MB
  if (file.size > MAX_SIZE) {
    return showAlertModal("danger", "الملف أكبر من 3 ميجا. اختر ملف أصغر.");
  }

  const submitBtn = document.querySelector('#presentationModal .modal-footer button.btn-primary');
  const originalBtnHTML = submitBtn ? submitBtn.innerHTML : "";

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> جاري الرفع...`;
  }

  try {
    const { url, error } = await uploadFile(file, `course-${courseId}`);
    if (error) throw new Error(error);

    const ext = file.name.split(".").pop().toLowerCase();
    const fileType = ext === "pdf" ? "pdf" : ext === "pptx" ? "pptx" : "ppt";

    const { error: dbErr } = await sb.from("presentations").insert({
      course_id: courseId,
      title,
      description: desc,
      file_url: url,
      file_name: file.name,
      file_type: fileType,
      file_size: file.size,
    });

    if (dbErr) throw dbErr;

    // ✅ إغلاق الـ modal
    bootstrap.Modal.getInstance(document.getElementById("presentationModal")).hide();

    // ✅ رسالة نجاح
    showAlertModal("success", "تم رفع العرض بنجاح");

    // ✅ تحديث القوائم
    renderPresentations();
    renderDashboard();

  } catch (err) {
    console.error("خطأ في رفع العرض:", err);
    showAlertModal("danger", err.message || "فشل رفع العرض");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHTML;
    }
  }
}

function submitPresentationForm() {
  const form = document.getElementById("presentationForm");
  if (!form) return;
  const evt = new Event("submit", { cancelable: true, bubbles: true });
  form.dispatchEvent(evt);
}

async function deletePresentationAdmin(id) {
  confirmAdmin("هل تريد حذف هذا العرض؟", async () => {
    try {
      const { error } = await sb.from("presentations").delete().eq("id", id);
      if (error) throw error;
      showAlertModal("success", "تم حذف العرض بنجاح");
      renderPresentations();
      renderDashboard();
    } catch (err) {
      showAlertModal("danger", err.message);
    }
  });
}

// ==========================================================
// 5. Zoom
// ==========================================================
async function renderZoom() {
  const zooms = await getAllZoomLinks();
  const tbody = document.getElementById("zoomTableBody");
  if (zooms.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">لا توجد روابط</td></tr>`;
    return;
  }
  tbody.innerHTML = zooms.map((z) => `
    <tr>
      <td><strong>${escapeHtml(z.title)}</strong></td>
      <td>${escapeHtml(z.course?.title || "—")}</td>
      <td><a href="${escapeHtml(z.url)}" target="_blank" class="text-primary small"><i class="bi bi-link-45deg"></i> فتح</a></td>
      <td class="small">${z.date ? new Date(z.date).toLocaleString("ar-EG") : "—"}</td>
      <td class="text-center">
        <button class="btn btn-sm btn-outline-danger" onclick="deleteZoomAdmin(${z.id})"><i class="bi bi-trash"></i></button>
      </td>
    </tr>
  `).join("");
}

async function openZoomModal() {
  document.getElementById("zoomModalTitle").textContent = "إضافة رابط Zoom";
  document.getElementById("zoomForm").reset();
  document.getElementById("zoomId").value = "";
  const courses = await getCourses({ limit: 999 });
  const select = document.getElementById("zoomCourse");
  select.innerHTML = courses.map((c) => `<option value="${c.id}">${c.title}</option>`).join("");
  new bootstrap.Modal(document.getElementById("zoomModal")).show();
}

async function saveZoom(e) {
  e.preventDefault();
  const data = {
    course_id: Number(document.getElementById("zoomCourse").value),
    title: document.getElementById("zoomTitle").value.trim(),
    url: document.getElementById("zoomUrl").value.trim(),
    date: document.getElementById("zoomDate").value || null,
  };
  const { error } = await sb.from("zoom_links").insert(data);
  if (error) return showAlertModal("danger", error.message);
  bootstrap.Modal.getInstance(document.getElementById("zoomModal")).hide();
  showAlertModal("success", "تم إضافة الرابط بنجاح");
  renderZoom();
  renderDashboard();
}
async function deleteZoomAdmin(id) {
  confirmAdmin("هل تريد حذف هذا الرابط؟", async () => {
    try {
      await sb.from("zoom_links").delete().eq("id", id);
      showAlertModal("success", "تم حذف الرابط بنجاح");
      renderZoom();
      renderDashboard();
    } catch (err) {
      showAlertModal("danger", err.message);
    }
  });
}
// ==========================================================
// 6. Quizzes
// ==========================================================
async function renderQuizzes() {
  const quizzes = await getQuizzes();
  const tbody = document.getElementById("quizzesTableBody");
  if (quizzes.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">لا توجد اختبارات</td></tr>`;
    return;
  }
  tbody.innerHTML = quizzes.map((q) => `
    <tr>
      <td><strong>${escapeHtml(q.title)}</strong></td>
      <td>${escapeHtml(q.course?.title || "—")}</td>
      <td class="text-center">—</td>
      <td class="text-center">${q.time_limit_min || 15} د</td>
      <td class="text-center">${q.pass_score || 60}%</td>
      <td class="text-center">
        <button class="btn btn-sm btn-outline-primary me-1" onclick="editQuiz(${q.id})"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteQuiz(${q.id})"><i class="bi bi-trash"></i></button>
      </td>
    </tr>
  `).join("");
}

async function openQuizModal() {
  document.getElementById("quizModalTitle").textContent = "إضافة اختبار";
  document.getElementById("quizForm").reset();
  document.getElementById("quizId").value = "";
  document.getElementById("questionsList").innerHTML = "";
  questionCounter = 0;
  const courses = await getCourses({ limit: 999 });
  document.getElementById("quizCourse").innerHTML = courses.map((c) => `<option value="${c.id}">${c.title}</option>`).join("");
  addQuestion();
  new bootstrap.Modal(document.getElementById("quizModal")).show();
}

async function editQuiz(id) {
  const quiz = await getQuizById(id);
  if (!quiz) return;
  document.getElementById("quizModalTitle").textContent = "تعديل اختبار";
  document.getElementById("quizId").value = quiz.id;
  document.getElementById("quizTitle").value = quiz.title;
  document.getElementById("quizDuration").value = quiz.time_limit_min || 15;
  document.getElementById("quizPassScore").value = quiz.pass_score || 60;

  const courses = await getCourses({ limit: 999 });
  document.getElementById("quizCourse").innerHTML = courses.map((c) =>
    `<option value="${c.id}" ${c.id === quiz.course_id ? "selected" : ""}>${c.title}</option>`
  ).join("");

  document.getElementById("questionsList").innerHTML = "";
  questionCounter = 0;
  (quiz.questions || []).forEach((q) => addQuestion(q));

  new bootstrap.Modal(document.getElementById("quizModal")).show();
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
        <i class="bi bi-trash"></i>
      </button>
    </div>
    <div class="mb-2">
      <input type="text" class="form-control form-control-sm q-text" value="${escapeHtml(q.text || '')}" placeholder="نص السؤال">
    </div>
    <div class="row g-2 mb-2">
      <div class="col-md-6">
        <select class="form-select form-select-sm q-type">
          <option value="mcq" ${q.type === "mcq" ? "selected" : ""}>اختيار من متعدد</option>
          <option value="tf" ${q.type === "tf" ? "selected" : ""}>صح / خطأ</option>
        </select>
      </div>
      <div class="col-md-6">
        <input type="number" class="form-control form-control-sm q-points" value="${q.points || 5}" min="1">
      </div>
    </div>
    <div class="q-options-mcq" ${q.type !== "mcq" ? 'style="display:none"' : ""}>
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
      <div class="form-check form-check-inline">
        <input class="form-check-input" type="radio" name="tf_${id}" value="true" ${q.correct_answer === true ? "checked" : ""}>
        <label class="form-check-label">صح</label>
      </div>
      <div class="form-check form-check-inline">
        <input class="form-check-input" type="radio" name="tf_${id}" value="false" ${q.correct_answer === false ? "checked" : ""}>
        <label class="form-check-label">خطأ</label>
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
      type, text, options, correct_answer,
      points: Number(card.querySelector(".q-points").value) || 5,
      position: qIndex,
    });
  });
  return questions;
}

async function saveQuiz(e) {
  e.preventDefault();
  const id = document.getElementById("quizId").value;
  const courseId = Number(document.getElementById("quizCourse").value);
  const questions = collectQuestions();

  if (questions.length === 0) {
    return showAlertModal("warning", "أضف سؤال واحد على الأقل");
  }

  const quizData = {
    course_id: courseId,
    title: document.getElementById("quizTitle").value.trim(),
    time_limit_min: Number(document.getElementById("quizDuration").value) || 15,
    pass_score: Number(document.getElementById("quizPassScore").value) || 60,
  };

  let quizId = id;

  if (id) {
    const { error } = await sb.from("quizzes").update(quizData).eq("id", Number(id));
    if (error) return showAlertModal("danger", error.message);
    await sb.from("questions").delete().eq("quiz_id", Number(id));
  } else {
    const { data, error } = await sb.from("quizzes").insert(quizData).select().single();
    if (error) return showAlertModal("danger", error.message);
    quizId = data.id;
  }

  const questionsData = questions.map((q) => ({ ...q, quiz_id: quizId }));
  const { error: qErr } = await sb.from("questions").insert(questionsData);
  if (qErr) return showAlertModal("danger", qErr.message);

  bootstrap.Modal.getInstance(document.getElementById("quizModal")).hide();
  showAlertModal("success", "تم حفظ الاختبار بنجاح");
  renderQuizzes();
  renderDashboard();
}
async function deleteQuiz(id) {
  confirmAdmin("هل تريد حذف هذا الاختبار؟", async () => {
    try {
      await sb.from("quizzes").delete().eq("id", id);
      showAlertModal("success", "تم حذف الاختبار بنجاح");
      renderQuizzes();
      renderDashboard();
    } catch (err) {
      showAlertModal("danger", err.message);
    }
  });
}



// ==========================================================
// Enrollments — الطلاب المسجلين في الدورات
// ==========================================================
async function renderEnrollments() {
  const tbody = document.getElementById("enrollmentsTableBody");
  const statsEl = document.getElementById("enrollmentsStats");
  const courseFilter = document.getElementById("enrollCourseFilter");

  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4">
    <div class="spinner-border spinner-border-sm text-primary"></div>
    جاري التحميل...
  </td></tr>`;

  try {
    // ✅ جيب كل التسجيلات مع بيانات الطالب والدورة
    const { data: enrollments, error } = await sb
      .from("enrollments")
      .select(`
        id, user_id, course_id, progress_pct, enrolled_at, completed_at,
        course:courses(id, title, thumbnail_url)
      `)
      .order("enrolled_at", { ascending: false });

    if (error) throw error;

    // ✅ جيب بيانات المستخدمين
    const users = await getUsers();
    const userMap = {};
    users.forEach(u => { userMap[u.id] = u; });

    // ✅ جيب الدورات للفلتر
    const courses = await getCourses({ limit: 999 });
    if (courseFilter && courseFilter.options.length <= 1) {
      courseFilter.innerHTML = '<option value="">كل الدورات</option>' +
        courses.map(c => `<option value="${c.id}">${escapeHtml(c.title)}</option>`).join("");
    }

    // ✅ الفلتر الحالي
    const selectedCourseId = courseFilter?.value || "";
    let filtered = enrollments || [];
    if (selectedCourseId) {
      filtered = filtered.filter(e => e.course_id === Number(selectedCourseId));
    }

    // ✅ الإحصائيات
    const totalEnrollments = filtered.length;
    const uniqueStudents = new Set(filtered.map(e => e.user_id)).size;
    const completed = filtered.filter(e => e.progress_pct === 100).length;
    const avgProgress = totalEnrollments > 0
      ? Math.round(filtered.reduce((s, e) => s + (e.progress_pct || 0), 0) / totalEnrollments)
      : 0;

    statsEl.innerHTML = `
      <div class="col-md-3">
        <div class="stat-card">
          <div class="card-body d-flex align-items-center gap-3">
            <div class="icon bg-primary-subtle text-primary"><i class="bi bi-person-check"></i></div>
            <div>
              <div class="fs-3 fw-bold">${totalEnrollments}</div>
              <small class="text-muted">تسجيل</small>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card">
          <div class="card-body d-flex align-items-center gap-3">
            <div class="icon bg-info-subtle text-info"><i class="bi bi-people"></i></div>
            <div>
              <div class="fs-3 fw-bold">${uniqueStudents}</div>
              <small class="text-muted">طالب</small>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card">
          <div class="card-body d-flex align-items-center gap-3">
            <div class="icon bg-success-subtle text-success"><i class="bi bi-trophy"></i></div>
            <div>
              <div class="fs-3 fw-bold">${completed}</div>
              <small class="text-muted">مكتمل</small>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card">
          <div class="card-body d-flex align-items-center gap-3">
            <div class="icon bg-warning-subtle text-warning"><i class="bi bi-graph-up"></i></div>
            <div>
              <div class="fs-3 fw-bold">${avgProgress}%</div>
              <small class="text-muted">متوسط</small>
            </div>
          </div>
        </div>
      </div>
    `;

    // ✅ اعرض الجدول
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">
        <i class="bi bi-inbox fs-3 d-block mb-2"></i>
        لا يوجد طلاب مسجلين
      </td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(enroll => {
      const user = userMap[enroll.user_id];
      const course = enroll.course;
      const progress = enroll.progress_pct || 0;

      return `
        <tr>
          <td>
            <strong>${escapeHtml(user?.full_name || "—")}</strong>
          </td>
          <td class="small text-muted">${escapeHtml(user?.email || "—")}</td>
          <td>
            <span class="badge bg-primary-subtle text-primary">
              ${getGradeName(user?.grade)}
            </span>
          </td>
          <td>
            <div class="d-flex align-items-center gap-2">
              ${course?.thumbnail_url ? 
                `<img src="${course.thumbnail_url}" 
                      style="width: 40px; height: 30px; object-fit: cover; border-radius: 4px;">` : ""}
              <span>${escapeHtml(course?.title || "—")}</span>
            </div>
          </td>
          <td class="text-center">
            <div class="d-flex align-items-center gap-2" style="min-width: 100px;">
              <div class="progress flex-grow-1" style="height: 6px;">
                <div class="progress-bar ${progress === 100 ? "bg-success" : "bg-primary"}" 
                     style="width: ${progress}%"></div>
              </div>
              <small class="fw-bold">${progress}%</small>
            </div>
          </td>
          <td class="text-center small text-muted">
            ${new Date(enroll.enrolled_at).toLocaleDateString("ar-EG")}
          </td>
          <td class="text-center">
            <button class="btn btn-sm btn-outline-danger" 
                    onclick="deleteEnrollment(${enroll.id})"
                    title="إلغاء التسجيل">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `;
    }).join("");

    // ✅ ربط الفلتر
    if (courseFilter && !courseFilter.dataset.bound) {
      courseFilter.dataset.bound = "true";
      courseFilter.addEventListener("change", renderEnrollments);
    }

  } catch (err) {
    console.error("خطأ في جلب التسجيلات:", err);
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">
      <i class="bi bi-exclamation-triangle fs-3 d-block mb-2"></i>
      فشل تحميل البيانات: ${escapeHtml(err.message)}
    </td></tr>`;
  }
}

async function deleteEnrollment(id) {
  confirmAdmin("هل تريد إلغاء تسجيل هذا الطالب من الدورة؟", async () => {
    try {
      const { error } = await sb.from("enrollments").delete().eq("id", id);
      if (error) throw error;

      showAlertModal("success", "تم إلغاء التسجيل بنجاح");
      renderEnrollments();
      renderDashboard();
    } catch (err) {
      showAlertModal("danger", err.message);
    }
  });
}
// ==========================================================
// 7. Results
// ==========================================================
async function renderResults() {
  const attempts = await getAllAttempts();
  const users = await getUsers();

  const totalAttempts = attempts.length;
  const uniqueStudents = new Set(attempts.map((a) => a.user_id)).size;
  const passed = attempts.filter((a) => a.passed).length;
  const avgScore = totalAttempts > 0
    ? Math.round(attempts.reduce((s, a) => s + (a.total_points > 0 ? (a.score / a.total_points) * 100 : 0), 0) / totalAttempts)
    : 0;

  document.getElementById("resultsStats").innerHTML = `
    <div class="col-md-3"><div class="stat-card"><div class="card-body d-flex align-items-center gap-3">
      <div class="icon bg-primary-subtle text-primary"><i class="bi bi-clipboard-check"></i></div>
      <div><div class="fs-3 fw-bold">${totalAttempts}</div><small class="text-muted">محاولة</small></div>
    </div></div></div>
    <div class="col-md-3"><div class="stat-card"><div class="card-body d-flex align-items-center gap-3">
      <div class="icon bg-info-subtle text-info"><i class="bi bi-people"></i></div>
      <div><div class="fs-3 fw-bold">${uniqueStudents}</div><small class="text-muted">طالب</small></div>
    </div></div></div>
    <div class="col-md-3"><div class="stat-card"><div class="card-body d-flex align-items-center gap-3">
      <div class="icon bg-success-subtle text-success"><i class="bi bi-check-circle"></i></div>
      <div><div class="fs-3 fw-bold">${passed}</div><small class="text-muted">ناجح</small></div>
    </div></div></div>
    <div class="col-md-3"><div class="stat-card"><div class="card-body d-flex align-items-center gap-3">
      <div class="icon bg-warning-subtle text-warning"><i class="bi bi-graph-up"></i></div>
      <div><div class="fs-3 fw-bold">${avgScore}%</div><small class="text-muted">متوسط</small></div>
    </div></div></div>
  `;

  const tbody = document.getElementById("resultsTableBody");
  if (attempts.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">لا توجد محاولات</td></tr>`;
    return;
  }

  tbody.innerHTML = attempts.map((a) => {
    const user = users.find((u) => u.id === a.user_id);
    const pct = a.total_points > 0 ? Math.round((a.score / a.total_points) * 100) : 0;
    return `
      <tr>
        <td><strong>${escapeHtml(user?.full_name || "مجهول")}</strong>
            <div class="small text-muted">${escapeHtml(user?.email || "")}</div></td>
        <td>${escapeHtml(a.quiz?.title || "—")}</td>
        <td class="text-center"><span class="badge bg-primary-subtle text-primary">${getGradeName(user?.grade)}</span></td>
        <td class="text-center"><strong>${a.score}</strong> / ${a.total_points}</td>
        <td class="text-center"><span class="badge ${a.passed ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}">${pct}%</span></td>
        <td class="text-center"><span class="badge ${a.passed ? "bg-success" : "bg-danger"}">${a.passed ? "ناجح" : "راسب"}</span></td>
        <td class="text-center text-muted small">${new Date(a.submitted_at).toLocaleDateString("ar-EG")}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-danger" 
                  onclick="deleteAttempt(${a.id})"
                  title="حذف النتيجة">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

// ✅ حذف محاولة واحدة
async function deleteAttempt(id) {
  confirmAdmin("هل تريد حذف هذه النتيجة؟", async () => {
    try {
      const { error } = await sb.from("quiz_attempts").delete().eq("id", id);
      if (error) throw error;

      showAlertModal("success", "تم حذف النتيجة بنجاح");
      renderResults();
      renderDashboard();
    } catch (err) {
      showAlertModal("danger", err.message);
    }
  });
}

// ✅ حذف كل النتائج
async function clearAllResults() {
  confirmAdmin(
    "⚠️ هل تريد حذف كل نتائج الطلاب؟\nهذا الإجراء لا يمكن التراجع عنه!",
    async () => {
      try {
        const { error } = await sb.from("quiz_attempts").delete().neq("id", 0);
        if (error) throw error;

        showAlertModal("success", "تم حذف كل النتائج بنجاح");
        renderResults();
        renderDashboard();
      } catch (err) {
        showAlertModal("danger", err.message);
      }
    },
    "⚠️ تأكيد الحذف"
  );
}
// ==========================================================
// 8. Users
// ==========================================================
async function renderUsers() {
  const users = await getUsers();
  const tbody = document.getElementById("usersTableBody");
  if (users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">لا يوجد مستخدمين</td></tr>`;
    return;
  }
  tbody.innerHTML = users.map((u) => `
    <tr>
      <td><strong>${escapeHtml(u.full_name)}</strong></td>
      <td>${escapeHtml(u.email || "—")}</td>
      <td><span class="badge ${u.role === "admin" ? "bg-danger-subtle text-danger" : "bg-primary-subtle text-primary"}">${u.role === "admin" ? "مشرف" : "طالب"}</span></td>
      <td class="small">${getGradeName(u.grade)}</td>
      <td class="text-muted small">${new Date(u.created_at).toLocaleDateString("ar-EG")}</td>
    </tr>
  `).join("");
}

async function renderStudents() {
  const users = (await getUsers()).filter((u) => u.role === "student");
  const tbody = document.getElementById("studentsTableBody");
  if (users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">لا يوجد طلاب</td></tr>`;
    return;
  }
  tbody.innerHTML = users.map((u) => `
    <tr>
      <td><strong>${escapeHtml(u.full_name)}</strong></td>
      <td><code class="text-primary">${escapeHtml(u.email || "—")}</code></td>
      <td>—</td>
      <td><span class="badge bg-primary-subtle text-primary">${getGradeName(u.grade)}</span></td>
      <td class="small text-muted">${new Date(u.created_at).toLocaleDateString("ar-EG")}</td>
      <td class="text-center">
        <span class="text-muted small">يدير عبر Supabase</span>
      </td>
    </tr>
  `).join("");
}

// ==========================================================
// Students — إضافة طالب جديد
// ==========================================================
function openStudentModal() {
  const form = document.getElementById("studentForm");
  const resultEl = document.getElementById("studentResult");

  if (form) form.reset();
  if (resultEl) {
    resultEl.classList.add("d-none");
    resultEl.innerHTML = "";
  }

  const modal = new bootstrap.Modal(document.getElementById("studentModal"));
  modal.show();
}

async function createStudent(e) {
  e.preventDefault();

  const fullName = document.getElementById("studentName").value.trim();
  const grade = document.getElementById("studentGrade").value;
  const resultEl = document.getElementById("studentResult");

  if (!fullName) return showAdminToast("danger", "اكتب اسم الطالب");
  if (!grade) return showAdminToast("danger", "اختر السنة الدراسية");

  // ✅ 1. ولّد إيميل وكلمة سر تلقائيًا
  const slug = fullName
    .toLowerCase()
    .replace(/\s+/g, ".")
    .replace(/[^\w\.]/g, "");
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const email = `${slug}${randomNum}@student.ta3leem.com`;
  const password = generateRandomPassword(8);

  // ✅ 2. اعرض loading
  resultEl.classList.remove("d-none");
  resultEl.innerHTML = `
    <div class="alert alert-info d-flex align-items-center gap-2">
      <span class="spinner-border spinner-border-sm"></span>
      جاري إنشاء الحساب...
    </div>`;

  try {
    // ✅ 3. أنشئ المستخدم في Supabase Auth
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
    if (!data.user) throw new Error("فشل إنشاء الحساب");

    // ✅ 4. تأكد إن الـ profile اتعمل (trigger) أو أضفه يدويًا
    await new Promise(resolve => setTimeout(resolve, 800));

    const { data: profile } = await sb
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .maybeSingle();

    if (!profile) {
      // لو الـ trigger مش اشتغل، أضف الـ profile يدويًا
      await sb.from("profiles").insert({
        id: data.user.id,
        email: email,
        full_name: fullName,
        role: "student",
        grade: grade,
      });
    }

    // ✅ 5. اعرض البيانات للطالب
    resultEl.innerHTML = `
      <div class="alert alert-success">
        <h6 class="fw-bold mb-3">
          <i class="bi bi-check-circle-fill"></i> تم إنشاء الحساب بنجاح!
        </h6>
        <div class="mb-2">
          <label class="small text-muted d-block">الاسم:</label>
          <strong>${escapeHtml(fullName)}</strong>
        </div>
        <div class="mb-2">
          <label class="small text-muted d-block">البريد الإلكتروني:</label>
          <div class="input-group input-group-sm">
            <input type="text" class="form-control" value="${escapeHtml(email)}" readonly id="studentEmail">
            <button class="btn btn-outline-secondary" onclick="copyToClipboard('${escapeHtml(email)}', this)">
              <i class="bi bi-clipboard"></i>
            </button>
          </div>
        </div>
        <div class="mb-2">
          <label class="small text-muted d-block">كلمة المرور:</label>
          <div class="input-group input-group-sm">
            <input type="text" class="form-control" value="${escapeHtml(password)}" readonly id="studentPassword">
            <button class="btn btn-outline-secondary" onclick="copyToClipboard('${escapeHtml(password)}', this)">
              <i class="bi bi-clipboard"></i>
            </button>
          </div>
        </div>
        <div class="small text-muted mt-3">
          <i class="bi bi-info-circle"></i>
          سلّم البيانات دي للطالب عشان يقدر يسجل دخول.
        </div>
      </div>`;

    // ✅ 6. حدّث القائمة
    renderStudents();

  } catch (err) {
    console.error("خطأ في إنشاء الطالب:", err);
    resultEl.innerHTML = `
      <div class="alert alert-danger">
        <i class="bi bi-x-circle-fill"></i>
        ${escapeHtml(err.message || "فشل إنشاء الحساب")}
      </div>`;
  }
}

// ✅ Helper: توليد كلمة مرور عشوائية
function generateRandomPassword(length = 8) {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let pwd = "";
  for (let i = 0; i < length; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  return pwd;
}

// ✅ Helper: نسخ للنافذة
function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="bi bi-check"></i>';
    btn.classList.add("btn-success");
    setTimeout(() => {
      btn.innerHTML = original;
      btn.classList.remove("btn-success");
    }, 1500);
  });
}

// ==========================================================
// 9. Settings
// ==========================================================
async function renderSettings() {
  const settings = await getSettings();
  const el = (id) => document.getElementById(id);
  if (el("settingPlatformNameAr")) el("settingPlatformNameAr").value = settings.platform_name_ar || "";
  if (el("settingPlatformName")) el("settingPlatformName").value = settings.platform_name || "";
  if (el("settingStampText")) el("settingStampText").value = settings.stamp_text || "";
  if (el("settingManagerName")) el("settingManagerName").value = settings.manager_name || "";
  if (el("settingManagerTitle")) el("settingManagerTitle").value = settings.manager_title || "";
}

async function savePlatformSettings() {
  const settings = {
    platform_name: document.getElementById("settingPlatformName").value.trim() || "Ta3leem",
    platform_name_ar: document.getElementById("settingPlatformNameAr").value.trim() || "تعليم",
    stamp_text: document.getElementById("settingStampText").value.trim() || "معتمد من Ta3leem",
    manager_name: document.getElementById("settingManagerName").value.trim() || "أحمد كرم",
    manager_title: document.getElementById("settingManagerTitle").value.trim() || "مدير المنصة",
  };

  const { error } = await saveSettings(settings);
  if (error) return showAlertModal("danger", error.message);
  showAlertModal("success", "تم حفظ الإعدادات بنجاح");
}

// ==========================================================
// Init + Authentication Guard
// ==========================================================
document.addEventListener("DOMContentLoaded", async () => {
  // ✅ 1. انتظر تحميل Supabase + جيب المستخدم
  const user = await getCurrentUser();

  // لو مفيش مستخدم → وديه login
  if (!user) {
    console.log("⛔ No user found → redirecting to login");
    window.location.href = "login.html?redirect=admin.html";
    return;
  }

  // لو المستخدم مش أدمن → وديه dashboard
  if (user.role !== "admin") {
    console.log("⛔ User is not admin:", user.role);
    alert("⚠️ هذه الصفحة مخصصة للمشرفين فقط");
    window.location.href = "dashboard.html";
    return;
  }

  // ✅ 2. تمام، اعرض لوحة التحكم
  console.log("✅ Admin authenticated:", user.email);
  await renderDashboard();

  // ضيف اسم الأدمن في القائمة
  const nameEl = document.getElementById("userName");
  if (nameEl) nameEl.textContent = user.full_name || user.email;
});