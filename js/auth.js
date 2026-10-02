/* ==========================================================
   Ta3leem — Auth
   ========================================================== */

async function updateNavbar() {
  const user = getCurrentUser();
  const guest = document.getElementById("guestButtons");
  const menu = document.getElementById("userMenu");
  const nameEl = document.getElementById("userName");
  const adminLink = document.getElementById("adminLink");

  if (!guest && !menu) return;

  if (user) {
    if (guest) guest.classList.add("d-none");
    if (menu) menu.classList.remove("d-none");
    if (nameEl) nameEl.textContent = user.full_name || user.email;

    if (adminLink) {
      if (user.role === "admin") adminLink.classList.remove("d-none");
      else adminLink.classList.add("d-none");
    }
  } else {
    if (guest) guest.classList.remove("d-none");
    if (menu) menu.classList.add("d-none");
    if (adminLink) adminLink.classList.add("d-none");
  }
}

async function registerUser(e) {
  e.preventDefault();
  const form = e.target;
  const fullName = form.fullName.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value;
  const confirm = form.confirmPassword.value;
  const grade = form.grade ? form.grade.value : null;
  const alertBox = document.getElementById("alertBox");

  if (fullName.length < 3) return showAlert(alertBox, "danger", "الاسم 3 حروف على الأقل");
  if (!email.includes("@")) return showAlert(alertBox, "danger", "البريد غير صحيح");
  if (password.length < 6) return showAlert(alertBox, "danger", "كلمة المرور 6 أحرف على الأقل");
  if (password !== confirm) return showAlert(alertBox, "danger", "كلمتا المرور غير متطابقتين");
  if (!grade) return showAlert(alertBox, "danger", "اختر سنتك الدراسية");

  const btn = form.querySelector("button[type='submit']");
  setLoading(btn, true, "جاري التسجيل...");

  const { error } = await DB.register(fullName, email, password, grade);

  setLoading(btn, false);

  if (error) return showAlert(alertBox, "danger", error);

  showAlert(alertBox, "success", "✅ تم إنشاء حسابك! جاري التحويل...");
  setTimeout(() => window.location.href = "dashboard.html", 1200);
}

async function loginUser(e) {
  e.preventDefault();
  const form = e.target;
  const email = form.email.value.trim();
  const password = form.password.value;
  const alertBox = document.getElementById("alertBox");

  if (!email || !password) return showAlert(alertBox, "danger", "أدخل البريد وكلمة المرور");

  const btn = form.querySelector("button[type='submit']");
  setLoading(btn, true, "جاري التحقق...");

  const { error } = await DB.login(email, password);

  setLoading(btn, false);

  if (error) return showAlert(alertBox, "danger", error);

  showAlert(alertBox, "success", "✅ تم تسجيل الدخول! جاري التحويل...");

  const user = getCurrentUser();
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect");

  let destination = "dashboard.html";
  if (redirect) {
    destination = redirect;
  } else if (user && user.role === "admin") {
    destination = "admin.html";
  }

  setTimeout(() => window.location.href = destination, 800);
}

async function logout(e) {
  if (e) e.preventDefault();
  if (!confirm("هل تريد تسجيل الخروج؟")) return;
  await DB.logout();
  window.location.href = "index.html";
}

async function requireAuth() {
  const user = getCurrentUser();
  if (!user) {
    const cur = window.location.pathname.split("/").pop();
    window.location.href = `login.html?redirect=${cur}`;
    return null;
  }
  return user;
}

function showAlert(box, type, msg) {
  if (!box) return alert(msg);
  box.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show">${msg}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
  box.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function setLoading(btn, loading, text = "جاري...") {
  if (!btn) return;
  if (loading) {
    btn.dataset.originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>${text}`;
  } else {
    btn.disabled = false;
    btn.innerHTML = btn.dataset.originalText || btn.innerHTML;
  }
}

document.addEventListener("DOMContentLoaded", updateNavbar);