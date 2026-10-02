/* ==========================================================
   Ta3leem — Dashboard (Supabase)
   ========================================================== */

async function initDashboard() {
  const user = await requireAuth();
  if (!user) return;

  document.getElementById("studentName").textContent = user.full_name || user.email;

  const enrollments = await getEnrollments(user.id);
  const attempts = await getAttemptsByUser(user.id);
  const quizzes = await getQuizzes();

  // ==========================================================
  // احسب تقدم كل دورة
  // ==========================================================
  const enrichedEnrollments = [];

  for (const e of enrollments) {
    const course = e.course;
    if (!course) continue;

    // احسب الدروس
    const courseData = await getCourseBySlug(course.slug);
    let totalLessons = 0;
    if (courseData?.sections) {
      courseData.sections.forEach(s => {
        totalLessons += s.lessons?.length || 0;
      });
    }

    const progress = await getLessonProgress(user.id, course.id);
    const completed = progress.filter(p => p.completed).length;
    const progressPct = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;

    // الاختبار
    const courseQuiz = quizzes.find(q => q.course_id === course.id);
    let quizPassed = false;
    let quizAttempts = 0;
    let bestScore = 0;

    if (courseQuiz) {
      const quizAttemptsList = attempts.filter(a => a.quiz_id === courseQuiz.id);
      quizAttempts = quizAttemptsList.length;
      bestScore = quizAttemptsList.length > 0
        ? Math.max(...quizAttemptsList.map(a => a.total_points > 0 ? Math.round((a.score / a.total_points) * 100) : 0))
        : 0;
      quizPassed = bestScore >= (courseQuiz.pass_score || 60);
    }

    const isFullyCompleted = (progressPct === 100) && (courseQuiz ? quizPassed : true);

    enrichedEnrollments.push({
      enrollment: e,
      course,
      totalLessons,
      completed,
      progressPct,
      quiz: courseQuiz,
      quizPassed,
      quizAttempts,
      bestScore,
      isFullyCompleted,
    });
  }

  // ==========================================================
  // الإحصائيات
  // ==========================================================
  const totalCourses = enrichedEnrollments.length;
  const completedCourses = enrichedEnrollments.filter(x => x.isFullyCompleted).length;
  const inProgressCourses = enrichedEnrollments.filter(x => x.progressPct > 0 && !x.isFullyCompleted).length;

  document.getElementById("statCourses").textContent = totalCourses;
  document.getElementById("statCompleted").textContent = completedCourses;
  document.getElementById("statInProgress").textContent = inProgressCourses;

  // ==========================================================
  // دوراتي
  // ==========================================================
  const container = document.getElementById("enrolledCourses");
  if (enrichedEnrollments.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="bi bi-journal-x fs-1 text-muted"></i>
        <p class="text-muted mt-2">لم تسجل في أي دورة بعد</p>
        <a href="courses.html" class="btn btn-primary btn-sm"><i class="bi bi-plus-circle"></i> تصفح الدورات</a>
      </div>`;
  } else {
    container.innerHTML = enrichedEnrollments.map((x) => {
      const { course, progressPct, isFullyCompleted, quiz, quizPassed, bestScore } = x;

      let statusBadge = "";
      if (isFullyCompleted) {
        statusBadge = `<span class="badge bg-success position-absolute top-0 start-0 m-2">
          <i class="bi bi-trophy-fill"></i> مكتملة
        </span>`;
      }

      let buttonHTML = "";
      if (isFullyCompleted) {
        buttonHTML = `<a href="course.html?slug=${course.slug}" class="btn btn-sm btn-success w-100 mt-3">
          <i class="bi bi-book"></i> افتح الدورة
        </a>`;
      } else {
        buttonHTML = `<a href="learn.html?slug=${course.slug}" class="btn btn-sm btn-primary w-100 mt-3">
          <i class="bi bi-play-circle"></i> ${progressPct > 0 ? "استكمل التعلم" : "ابدأ التعلم"}
        </a>`;
      }

      let quizNote = "";
      if (quiz) {
        if (quizPassed) {
          quizNote = `<div class="small text-success mt-1">
            <i class="bi bi-check-circle-fill"></i> نجحت في الاختبار (${bestScore}%)
          </div>`;
        } else if (x.quizAttempts > 0) {
          quizNote = `<div class="small text-danger mt-1">
            <i class="bi bi-x-circle-fill"></i> لم تنجح (${bestScore}%)
          </div>`;
        } else {
          quizNote = `<div class="small text-muted mt-1">
            <i class="bi bi-clipboard-check"></i> لم تحل الاختبار بعد
          </div>`;
        }
      }

      return `
        <div class="col-md-6 col-lg-4">
          <div class="card border-0 shadow-sm rounded-4 h-100 position-relative">
            ${statusBadge}
            <img src="${course.thumbnail_url}" class="card-img-top course-thumbnail" style="height: 160px; object-fit: cover;" alt="">
            <div class="card-body">
              <h6 class="fw-bold mb-2 lh-base">${escapeHtml(course.title)}</h6>
              <div class="d-flex justify-content-between small text-muted mb-1">
                <span>التقدم</span>
                <strong class="${progressPct === 100 ? "text-success" : "text-primary"}">${progressPct}%</strong>
              </div>
              <div class="progress" style="height: 6px;">
                <div class="progress-bar ${progressPct === 100 ? "bg-success" : "gradient-brand"}" style="width: ${progressPct}%"></div>
              </div>
              <div class="small text-muted mt-2">
                <i class="bi bi-list-check"></i> ${x.completed} / ${x.totalLessons} درس
              </div>
              ${quizNote}
              ${buttonHTML}
            </div>
          </div>
        </div>`;
    }).join("");
  }

  // ==========================================================
  // نتائج الاختبارات
  // ==========================================================
  const attemptsEl = document.getElementById("quizAttempts");
  if (attempts.length === 0) {
    attemptsEl.innerHTML = `
      <div class="text-center py-4 text-muted small">
        <i class="bi bi-clipboard-x fs-3 d-block mb-2"></i>
        لم تجرِ أي اختبار بعد
      </div>`;
  } else {
    attemptsEl.innerHTML = `
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>الاختبار</th>
              <th class="text-center">النسبة</th>
              <th class="text-center">الحالة</th>
              <th class="text-center">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            ${attempts.map((a) => {
              const pct = a.total_points > 0 ? Math.round((a.score / a.total_points) * 100) : 0;
              const passed = a.passed;
              return `
                <tr>
                  <td><strong>${escapeHtml(a.quiz?.title || "اختبار")}</strong></td>
                  <td class="text-center fw-bold">${pct}%</td>
                  <td class="text-center">
                    <span class="badge ${passed ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}">
                      ${passed ? "ناجح" : "راسب"}
                    </span>
                  </td>
                  <td class="text-center text-muted small">
                    ${new Date(a.submitted_at).toLocaleDateString("ar-EG")}
                  </td>
                </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>`;
  }

  // ==========================================================
  // شهاداتي
  // ==========================================================
  const certificatesEl = document.getElementById("certificatesList");
  const completedCoursesList = enrichedEnrollments.filter(x => x.isFullyCompleted);

  if (completedCoursesList.length === 0) {
    certificatesEl.innerHTML = `
      <div class="text-center py-4 text-muted small">
        <i class="bi bi-award fs-3 d-block mb-2"></i>
        لم تحصل على شهادة بعد. أكمل دورة للحصول على أول شهادة!
      </div>`;
  } else {
    certificatesEl.innerHTML = `
      <div class="row g-3">
        ${completedCoursesList.map((x) => `
          <div class="col-md-6">
            <div class="border rounded-3 p-3 d-flex align-items-center gap-3">
              <div class="icon-circle icon-brand" style="width: 60px; height: 60px; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg, #38bdf8, #34d399); border-radius:50%; color:#fff;">
                <i class="bi bi-award-fill fs-4"></i>
              </div>
              <div class="flex-grow-1">
                <strong class="d-block lh-base">${escapeHtml(x.course.title)}</strong>
                <small class="text-muted">مكتملة بنسبة 100%</small>
              </div>
              <a href="certificate.html?course=${x.course.slug}" class="btn btn-sm btn-outline-primary">
                <i class="bi bi-eye"></i> عرض
              </a>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("studentName")) initDashboard();
});