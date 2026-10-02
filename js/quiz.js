/* ==========================================================
   Ta3leem — Quiz Engine (with Sidebar + Auto-Save)
   ========================================================== */

let quizState = {
  quiz: null,
  user: null,
  questions: [],
  answers: {},
  currentIndex: 0,
  timeLeft: 0,
  timer: null,
  startedAt: null,
};

// ==========================================================
// بدء الاختبار
// ==========================================================
async function initQuiz() {
  const container = document.getElementById("quizContainer");
  if (!container) return;

  const user = await requireAuth();
  if (!user) return;
  quizState.user = user;

  const quizId = Number(new URLSearchParams(window.location.search).get("id"));
  if (!quizId) {
    container.innerHTML = `<div class="alert alert-danger">لم يتم تحديد اختبار</div>`;
    return;
  }

  const quizzes = JSON.parse(localStorage.getItem("ta3leem_admin_quizzes") || "[]");
  const quiz = quizzes.find(q => q.id === quizId);

  if (!quiz) {
    container.innerHTML = `<div class="alert alert-danger">الاختبار غير موجود</div>`;
    return;
  }

  if (!quiz.questions || quiz.questions.length === 0) {
    container.innerHTML = `<div class="alert alert-warning">لا توجد أسئلة في هذا الاختبار</div>`;
    return;
  }

  quizState.quiz = quiz;
  // ✅ ضمان IDs فريدة لكل سؤال
  quizState.questions = quiz.questions.map((q, i) => ({
    ...q,
    id: q.id !== undefined && q.id !== null ? q.id : (i + 1)
  }));
  quizState.answers = {};
  quizState.currentIndex = 0;
  quizState.timeLeft = (quiz.time_limit_min || 15) * 50;
  quizState.startedAt = new Date();

  renderQuizStart();
}

// ==========================================================
// شاشة البداية
// ==========================================================
function renderQuizStart() {
  const q = quizState.quiz;
  const container = document.getElementById("quizContainer");
  container.innerHTML = `
    <div class="card border-0 shadow-sm rounded-4 mx-auto" style="max-width: 600px;">
      <div class="card-body p-5 text-center">
        <div class="icon-circle icon-primary mx-auto mb-4" style="width: 100px; height: 100px; display:flex; align-items:center; justify-content:center; background:#e0f2fe; border-radius:50%;">
          <i class="bi bi-clipboard-check fs-1 text-primary"></i>
        </div>
        <h2 class="fw-bold mb-2">${escapeHtml(q.title)}</h2>
        <p class="text-muted mb-4">اقرأ التعليمات قبل البدء</p>

        <div class="row g-3 mb-4 text-start">
          <div class="col-6">
            <div class="p-3 bg-light rounded-3">
              <small class="text-muted d-block">عدد الأسئلة</small>
              <strong class="fs-5">${quizState.questions.length}</strong>
            </div>
          </div>
          <div class="col-6">
            <div class="p-3 bg-light rounded-3">
              <small class="text-muted d-block">المدة</small>
              <strong class="fs-5">${q.time_limit_min} دقيقة</strong>
            </div>
          </div>
          <div class="col-6">
            <div class="p-3 bg-light rounded-3">
              <small class="text-muted d-block">درجة النجاح</small>
              <strong class="fs-5">${q.pass_score}%</strong>
            </div>
          </div>
          <div class="col-6">
            <div class="p-3 bg-light rounded-3">
              <small class="text-muted d-block">المجموع</small>
              <strong class="fs-5">${quizState.questions.reduce((s,q) => s + q.points, 0)} نقطة</strong>
            </div>
          </div>
        </div>

        <div class="alert alert-info small text-start">
          <i class="bi bi-info-circle"></i>
          <ul class="mb-0 mt-2 ps-3">
            <li>سيتم تسليم الاختبار تلقائيًا عند انتهاء الوقت</li>
            <li>يمكنك التنقل بين الأسئلة من الشريط الجانبي</li>
            <li>تأكد من اتصالك بالإنترنت</li>
          </ul>
        </div>

        <button class="btn btn-primary btn-lg w-100" onclick="startQuiz()">
          <i class="bi bi-play-circle"></i> ابدأ الاختبار
        </button>
      </div>
    </div>
  `;
}

// ==========================================================
// بدء
// ==========================================================
function startQuiz() {
  quizState.timer = setInterval(() => {
    quizState.timeLeft--;
    updateTimerDisplay();
    if (quizState.timeLeft <= 0) {
      clearInterval(quizState.timer);
      submitQuiz(true);
    }
  }, 1000);
  renderQuizUI();
}

// ==========================================================
// الـ UI الكامل
// ==========================================================
function renderQuizUI() {
  const container = document.getElementById("quizContainer");

  container.innerHTML = `
    <div class="row g-3 quiz-layout">
      <div class="col-lg-3 col-md-4 order-lg-2 order-md-2 order-1">
        <div class="quiz-sidebar card border-0 shadow-sm rounded-4 sticky-top" style="top: 80px;">
          <div class="card-body pb-2">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="badge bg-primary-subtle text-primary">
                <i class="bi bi-list-check"></i> ${quizState.questions.length} سؤال
              </span>
              <div class="text-danger fw-bold" id="timerDisplay">
                <i class="bi bi-clock"></i> <span id="timerText">--:--</span>
              </div>
            </div>
            <div class="progress mb-3" style="height: 6px;">
              <div class="progress-bar gradient-brand" id="quizProgress" style="width: 0%"></div>
            </div>
          </div>

          <div class="card-body pt-0">
            <h6 class="fw-bold small text-muted mb-2">الأسئلة:</h6>
            <div class="questions-grid" id="questionsGrid"></div>

            <div class="quiz-legend mt-3">
              <div class="legend-item"><span class="legend-dot current"></span> الحالي</div>
              <div class="legend-item"><span class="legend-dot answered"></span> تم الإجابة</div>
              <div class="legend-item"><span class="legend-dot empty"></span> لم يُجب</div>
            </div>
          </div>

          <div class="card-footer bg-white border-0 p-3 pt-0">
            <button class="btn btn-success w-100" onclick="submitQuiz(false)">
              <i class="bi bi-send-check"></i> إنهاء وتسليم
            </button>
          </div>
        </div>
      </div>

      <div class="col-lg-9 col-md-8 order-lg-1 order-md-1 order-2">
        <div class="card border-0 shadow-sm rounded-4">
          <div class="card-header bg-white border-0 p-4 pb-2">
            <div class="d-flex justify-content-between align-items-center">
              <span class="badge bg-primary-subtle text-primary fs-6" id="qNumber">سؤال 1 من ${quizState.questions.length}</span>
              <small class="text-muted"><i class="bi bi-star"></i> <span id="qPoints"></span> نقطة</small>
            </div>
          </div>

          <div class="card-body p-4" id="questionBody"></div>

          <div class="card-footer bg-white border-0 p-4 pt-0">
            <div class="d-flex justify-content-between gap-2">
              <button class="btn btn-outline-secondary" onclick="prevQuestion()" id="prevBtn">
                <i class="bi bi-chevron-right"></i> السابق
              </button>
              <button class="btn btn-primary" onclick="nextQuestion()" id="nextBtn">
                التالي <i class="bi bi-chevron-left"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  addQuizStyles();
  renderQuestionsGrid();
  renderQuestion();
  updateTimerDisplay();
}

// ==========================================================
// CSS
// ==========================================================
function addQuizStyles() {
  if (document.getElementById("quiz-custom-styles")) return;
  const style = document.createElement("style");
  style.id = "quiz-custom-styles";
  style.textContent = `
    .questions-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
    .q-btn { aspect-ratio: 1; border-radius: 8px; border: 2px solid #e2e8f0; background: #fff; color: #475569; font-weight: 700; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; padding: 0; }
    .q-btn:hover { border-color: #0ea5e9; transform: scale(1.08); }
    .q-btn.current { background: #0ea5e9; border-color: #0ea5e9; color: #fff; box-shadow: 0 0 0 3px rgba(14,165,233,0.25); }
    .q-btn.answered { background: #d1fae5; border-color: #10b981; color: #059669; }
    .q-btn.answered.current { background: #0ea5e9; border-color: #0ea5e9; color: #fff; }
    .quiz-legend { display: flex; gap: 12px; flex-wrap: wrap; font-size: 0.75rem; color: #64748b; }
    .legend-item { display: flex; align-items: center; gap: 4px; }
    .legend-dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
    .legend-dot.current { background: #0ea5e9; }
    .legend-dot.answered { background: #d1fae5; border: 2px solid #10b981; }
    .legend-dot.empty { background: #fff; border: 2px solid #e2e8f0; }
    .answer-option { display: block; padding: 14px 16px; margin-bottom: 10px; border-radius: 12px; border: 2px solid #e2e8f0; cursor: pointer; transition: all 0.2s; background: #fff; }
    .answer-option:hover { border-color: #7dd3fc; background: #f0f9ff; }
    .answer-option.selected { border-color: #0ea5e9; background: #e0f2fe; box-shadow: 0 0 0 3px rgba(14,165,233,0.15); }
    .answer-option input[type="radio"] { margin-inline-end: 8px; }
    @media (max-width: 992px) {
      .quiz-sidebar { position: static !important; }
      .questions-grid { grid-template-columns: repeat(8, 1fr); }
    }
    @media (max-width: 576px) {
      .questions-grid { grid-template-columns: repeat(6, 1fr); }
    }
  `;
  document.head.appendChild(style);
}

// ==========================================================
// شبكة الأسئلة
// ==========================================================
function renderQuestionsGrid() {
  const grid = document.getElementById("questionsGrid");
  if (!grid) return;
  grid.innerHTML = quizState.questions.map((q, i) => {
    const isCurrent = i === quizState.currentIndex;
    const ans = quizState.answers[q.id];
    const isAnswered = ans !== undefined && ans !== null;
    const cls = `q-btn ${isCurrent ? "current" : ""} ${isAnswered ? "answered" : ""}`;
    return `<button type="button" class="${cls}" onclick="goToQuestion(${i})">${i + 1}</button>`;
  }).join("");
}

function goToQuestion(index) {
  if (index < 0 || index >= quizState.questions.length) return;
  quizState.currentIndex = index;
  renderQuestionsGrid();
  renderQuestion();
}

// ==========================================================
// رسم السؤال
// ==========================================================
function renderQuestion() {
  const idx = quizState.currentIndex;
  const q = quizState.questions[idx];
  const total = quizState.questions.length;

  document.getElementById("qNumber").textContent = `سؤال ${idx + 1} من ${total}`;
  document.getElementById("qPoints").textContent = q.points;

  updateProgressBar();

  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  prevBtn.disabled = idx === 0;
  nextBtn.disabled = idx === total - 1;

  // ✅ اقرأ الإجابة الخاصة بالسؤال ده بس
  const savedAnswer = quizState.answers[q.id];
  const hasAnswer = savedAnswer !== undefined && savedAnswer !== null;

  const body = document.getElementById("questionBody");
  let answersHTML = "";

  if (q.type === "mcq") {
    answersHTML = (q.options || []).map((opt, i) => {
      const isSelected = hasAnswer && savedAnswer === i;
      return `
        <label class="answer-option ${isSelected ? "selected" : ""}">
          <input type="radio" name="q_${q.id}" value="${i}" ${isSelected ? "checked" : ""}
                 onchange="selectAnswer(${q.id}, ${i})">
          <strong>${String.fromCharCode(1571 + i)}.</strong> ${escapeHtml(opt)}
        </label>
      `;
    }).join("");
  } else if (q.type === "tf") {
    const isTrue = hasAnswer && savedAnswer === true;
    const isFalse = hasAnswer && savedAnswer === false;
    answersHTML = `
      <label class="answer-option ${isTrue ? "selected" : ""}">
        <input type="radio" name="q_${q.id}" value="true" ${isTrue ? "checked" : ""}
               onchange="selectAnswer(${q.id}, true)">
        <i class="bi bi-check-circle text-success"></i> صح
      </label>
      <label class="answer-option ${isFalse ? "selected" : ""}">
        <input type="radio" name="q_${q.id}" value="false" ${isFalse ? "checked" : ""}
               onchange="selectAnswer(${q.id}, false)">
        <i class="bi bi-x-circle text-danger"></i> خطأ
      </label>
    `;
  }

  body.innerHTML = `
    <h5 class="fw-bold mb-4 lh-base">${escapeHtml(q.text)}</h5>
    <div class="answers">${answersHTML}</div>
  `;
}

// ==========================================================
// حفظ الإجابة
// ==========================================================
function selectAnswer(questionId, value) {
  quizState.answers[questionId] = value;
  renderQuestionsGrid();
  updateProgressBar();

  const body = document.getElementById("questionBody");
  body.querySelectorAll(".answer-option").forEach(el => el.classList.remove("selected"));
  body.querySelectorAll("input[type='radio']").forEach(el => {
    const isMatch = (el.value === String(value)) ||
                    (value === true && el.value === "true") ||
                    (value === false && el.value === "false");
    if (isMatch) {
      el.checked = true;
      el.closest(".answer-option").classList.add("selected");
    }
  });
}

function updateProgressBar() {
  const total = quizState.questions.length;
  const answeredCount = quizState.questions.filter(x => {
    const a = quizState.answers[x.id];
    return a !== undefined && a !== null;
  }).length;
  const progressPct = Math.round((answeredCount / total) * 100);
  const progressBar = document.getElementById("quizProgress");
  if (progressBar) progressBar.style.width = progressPct + "%";
}

function nextQuestion() {
  if (quizState.currentIndex < quizState.questions.length - 1) {
    quizState.currentIndex++;
    renderQuestionsGrid();
    renderQuestion();
  }
}

function prevQuestion() {
  if (quizState.currentIndex > 0) {
    quizState.currentIndex--;
    renderQuestionsGrid();
    renderQuestion();
  }
}

function updateTimerDisplay() {
  const el = document.getElementById("timerText");
  if (!el) return;
  const m = Math.floor(quizState.timeLeft / 60);
  const s = quizState.timeLeft % 60;
  el.textContent = `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

// ==========================================================
// التسليم
// ==========================================================
async function submitQuiz(auto = false) {
  if (!auto) {
    const unanswered = quizState.questions.filter(q => {
      const a = quizState.answers[q.id];
      return a === undefined || a === null;
    }).length;
    const msg = unanswered > 0
      ? `لديك ${unanswered} سؤال بدون إجابة. تسليم؟`
      : "تسليم الاختبار؟";
    if (!confirm(msg)) return;
  }

  clearInterval(quizState.timer);

  let score = 0, total = 0;
  quizState.questions.forEach(q => {
    total += q.points;
    const userAns = quizState.answers[q.id];
    if (q.type === "mcq") {
      if (userAns === q.correct_answer) score += q.points;
    } else if (q.type === "tf") {
      if (userAns === q.correct_answer) score += q.points;
    }
  });

  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const passed = pct >= (quizState.quiz.pass_score || 60);

  addAttempt({
  user_id: quizState.user.id,
  quiz_id: quizState.quiz.id,
  quiz_title: quizState.quiz.title,
  course_id: quizState.quiz.course_id,
  course_title: quizState.quiz.course_title,
  score, total_points: total,
  pass_score: quizState.quiz.pass_score || 60,
  answers: quizState.answers,
  passed,
});

  sessionStorage.setItem("lastQuizResult", JSON.stringify({
    quizId: quizState.quiz.id,
    quizTitle: quizState.quiz.title,
    courseId: quizState.quiz.course_id,
    courseTitle: quizState.quiz.course_title,
    score, totalPoints: total, percent: pct, passed,
    questions: quizState.questions,
    answers: quizState.answers,
  }));

  window.location.href = "quiz-result.html";
}

document.addEventListener("DOMContentLoaded", initQuiz);