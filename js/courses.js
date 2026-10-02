/* ==========================================================
   Ta3leem — Courses
   ========================================================== */

function renderStars(rating) {
  let html = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) html += '<i class="bi bi-star-fill"></i>';
    else if (i - 0.5 <= rating) html += '<i class="bi bi-star-half"></i>';
    else html += '<i class="bi bi-star"></i>';
  }
  return html;
}

function courseCardHTML(course) {
  const levels = {
    beginner: { text: "مبتدئ", cls: "level-beginner" },
    intermediate: { text: "متوسط", cls: "level-intermediate" },
    advanced: { text: "متقدم", cls: "level-advanced" },
  };
  const lvl = levels[course.level] || levels.beginner;
  const stars = renderStars(course.rating_avg || 0);
  const thumb = course.thumbnail_url || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600";

  return `
    <div class="col-md-6 col-lg-4">
      <a href="course.html?slug=${course.slug}" class="text-decoration-none text-dark">
        <div class="course-card">
          <div class="position-relative">
            <img src="${thumb}" alt="${escapeHtml(course.title)}" class="course-thumbnail" loading="lazy">
            <span class="course-badge ${lvl.cls}">${lvl.text}</span>
          </div>
          <div class="p-3">
            ${course.category ? `<small class="text-primary fw-semibold d-block mb-1">
              <i class="bi ${course.category.icon || "bi-book"}"></i> ${escapeHtml(course.category.name_ar)}
            </small>` : ""}
            <h6 class="fw-bold mb-2 lh-base" style="min-height: 44px;">${escapeHtml(course.title)}</h6>
            <div class="d-flex justify-content-between align-items-center mb-2">
              <div class="course-rating">${stars} <span class="text-muted small ms-1">(${course.rating_count || 0})</span></div>
              <small class="text-muted"><i class="bi bi-clock"></i> ${course.duration_hours || 0} ساعة</small>
            </div>
            <div class="d-flex justify-content-between align-items-center pt-2 border-top">
              <small class="text-muted"><i class="bi bi-people"></i> ${(course.students_count || 0).toLocaleString("ar-EG")} طالب</small>
              <span class="text-success fw-bold small"><i class="bi bi-check-circle-fill"></i> مجاني</span>
            </div>
          </div>
        </div>
      </a>
    </div>
  `;
}

// ==========================================================
// الرئيسية — 6 دورات
// ==========================================================
async function initHomeCoursesGrid() {
  const grid = document.getElementById("coursesGrid");
  if (!grid) return;
  const courses = await DB.getCourses({ limit: 6 });
  if (courses.length === 0) {
    grid.innerHTML = `<div class="col-12 text-center py-5"><p class="text-muted">لا توجد دورات</p></div>`;
    return;
  }
  grid.innerHTML = courses.map(courseCardHTML).join("");
}

// ==========================================================
// courses.html
// ==========================================================
async function initCoursesPage() {
  const grid = document.getElementById("allCoursesGrid");
  if (!grid) return;

  const cats = await DB.getCategories();
  const catFilter = document.getElementById("categoryFilter");
  if (catFilter) {
    catFilter.innerHTML = '<option value="">كل التصنيفات</option>' +
      cats.map(c => `<option value="${c.id}">${escapeHtml(c.name_ar)}</option>`).join("");
  }

  const state = { categoryId: null, level: null, search: "", sortBy: "newest" };

  async function render() {
    grid.innerHTML = `<div class="col-12 text-center py-5"><div class="spinner-border text-primary"></div></div>`;
    const courses = await DB.getCourses({ ...state, limit: 50 });

    if (courses.length === 0) {
      grid.innerHTML = `<div class="col-12 text-center py-5"><i class="bi bi-search fs-1 text-muted"></i><p class="text-muted mt-2">لا توجد نتائج</p></div>`;
      return;
    }
    grid.innerHTML = courses.map(courseCardHTML).join("");
    const c = document.getElementById("resultsCount");
    if (c) c.textContent = `${courses.length} دورة`;
  }

  document.getElementById("categoryFilter")?.addEventListener("change", e => {
    state.categoryId = e.target.value || null;
    render();
  });
  document.getElementById("levelFilter")?.addEventListener("change", e => {
    state.level = e.target.value || null;
    render();
  });
  document.getElementById("sortFilter")?.addEventListener("change", e => {
    state.sortBy = e.target.value;
    render();
  });

  let timer;
  document.getElementById("searchInput")?.addEventListener("input", e => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      state.search = e.target.value.trim();
      render();
    }, 300);
  });

  render();
}

// ==========================================================
// course.html
// ==========================================================
async function initCourseDetail() {
  const container = document.getElementById("courseDetail");
  if (!container) return;

  const slug = new URLSearchParams(window.location.search).get("slug");
  if (!slug) {
    container.innerHTML = `<div class="alert alert-danger">لم يتم تحديد دورة</div>`;
    return;
  }

  const course = await DB.getCourseBySlug(slug);
  if (!course) {
    container.innerHTML = `<div class="alert alert-danger">الدورة غير موجودة</div>`;
    return;
  }

  const stars = renderStars(course.rating_avg || 0);
  const totalLessons = course.sections?.reduce((s, sec) => s + (sec.lessons?.length || 0), 0) || 0;

  const lessonsHTML = (course.sections || []).map((section, idx) => `
    <div class="accordion-item border-0 mb-3 rounded-3 shadow-sm">
      <h2 class="accordion-header">
        <button class="accordion-button ${idx > 0 ? "collapsed" : ""} fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#sec${section.id}">
          <i class="bi bi-folder2-open me-2 text-primary"></i>${escapeHtml(section.title)}
          <span class="badge bg-primary-subtle text-primary ms-2">${section.lessons?.length || 0} درس</span>
        </button>
      </h2>
      <div id="sec${section.id}" class="accordion-collapse collapse ${idx === 0 ? "show" : ""}" data-bs-parent="#sectionsAcc">
        <div class="accordion-body p-0">
          ${(section.lessons || []).map(l => `
            <div class="d-flex align-items-center justify-content-between p-3 border-bottom">
              <div class="d-flex align-items-center gap-3">
                <i class="bi bi-file-text text-primary fs-4"></i>
                <div>
                  <a href="lesson.html?id=${l.id}" class="fw-semibold text-decoration-none text-dark">${escapeHtml(l.title)}</a>
                  <small class="text-muted d-block">${l.duration_min} دقيقة</small>
                </div>
              </div>
              ${l.is_free_preview ? '<span class="badge bg-success-subtle text-success">معاينة</span>' : ""}
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `).join("");

  container.innerHTML = `
    <nav aria-label="breadcrumb" class="mb-3">
      <ol class="breadcrumb small">
        <li class="breadcrumb-item"><a href="index.html" class="text-decoration-none">الرئيسية</a></li>
        <li class="breadcrumb-item"><a href="courses.html" class="text-decoration-none">الدورات</a></li>
        <li class="breadcrumb-item active">${escapeHtml(course.title)}</li>
      </ol>
    </nav>
    <div class="row g-4">
      <div class="col-lg-8">
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
          <img src="${course.thumbnail_url}" class="w-100" style="max-height: 380px; object-fit: cover;" alt="">
          <div class="card-body p-4">
            ${course.category ? `<span class="badge bg-primary-subtle text-primary mb-2"><i class="bi ${course.category.icon}"></i> ${course.category.name_ar}</span>` : ""}
            <h1 class="h3 fw-bold mb-3">${escapeHtml(course.title)}</h1>
            <div class="d-flex flex-wrap gap-3 mb-3 small">
              <span class="text-warning">${stars} <span class="text-muted ms-1">${course.rating_avg.toFixed(1)} (${course.rating_count} تقييم)</span></span>
              <span class="text-muted"><i class="bi bi-people"></i> ${course.students_count.toLocaleString("ar-EG")} طالب</span>
              <span class="text-muted"><i class="bi bi-collection-play"></i> ${totalLessons} درس</span>
              <span class="text-muted"><i class="bi bi-clock"></i> ${course.duration_hours} ساعة</span>
            </div>
            <h5 class="fw-bold mt-4 mb-2">عن الدورة</h5>
            <p class="text-muted lh-lg">${escapeHtml(course.description)}</p>
          </div>
        </div>
        <div class="card border-0 shadow-sm rounded-4 mb-4">
          <div class="card-body p-4">
            <h5 class="fw-bold mb-4"><i class="bi bi-list-check text-primary"></i> محتوى الدورة</h5>
            <div class="accordion" id="sectionsAcc">${lessonsHTML || '<p class="text-muted text-center py-4">لا توجد دروس بعد</p>'}</div>
          </div>
        </div>
      </div>
      <div class="col-lg-4">
        <div class="card border-0 shadow-sm rounded-4 sticky-top" style="top: 90px;">
          <div class="card-body p-4">
            <div class="text-center mb-3">
              <div class="display-6 fw-bold text-success mb-1">مجاني</div>
              <small class="text-muted">بدون أي رسوم</small>
            </div>
            <button id="enrollBtn" class="btn btn-primary w-100 btn-lg mb-2"><i class="bi bi-person-plus"></i> سجّل في الدورة</button>
            <ul class="list-unstyled small mt-4">
              <li class="d-flex align-items-center gap-2 mb-2"><i class="bi bi-check-circle-fill text-success"></i> وصول كامل مدى الحياة</li>
              <li class="d-flex align-items-center gap-2 mb-2"><i class="bi bi-check-circle-fill text-success"></i> ${totalLessons} درس</li>
              <li class="d-flex align-items-center gap-2 mb-2"><i class="bi bi-check-circle-fill text-success"></i> شهادة إتمام</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;

  const btn = document.getElementById("enrollBtn");
  if (btn) {
    const user = getCurrentUser();
    const enrollments = user ? DB.getEnrollments(user.id) : [];
    const isEnrolled = enrollments.some(e => e.course_id === course.id);

    if (isEnrolled) {
      btn.innerHTML = '<i class="bi bi-play-circle"></i> ابدأ التعلم';
      btn.className = "btn btn-success w-100 btn-lg mb-2";
      btn.onclick = () => { window.location.href = `learn.html?slug=${course.slug}`; };
    } else {
      btn.onclick = () => {
        const u = getCurrentUser();
        if (!u) { window.location.href = "login.html"; return; }
        const ok = DB.enroll(u.id, course.id);
        if (!ok) { alert("انت مسجل في الدورة بالفعل"); return; }
        alert("✅ تم التسجيل بنجاح!");
        window.location.href = "learn.html?slug=" + course.slug;
      };
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initHomeCoursesGrid();
  initCoursesPage();
  initCourseDetail();
});