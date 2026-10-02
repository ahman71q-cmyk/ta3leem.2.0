/* ==========================================================
   Ta3leem — File Management (Base64)
   ========================================================== */

// الحد الأقصى لحجم الملف (3 ميجا)
const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3 MB

/**
 * تحويل ملف إلى Base64
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_FILE_SIZE) {
      reject(new Error(`الملف أكبر من 3MB. المسموح: 3 ميجا فقط.`));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("فشل قراءة الملف"));
    reader.readAsDataURL(file);
  });
}

/**
 * إنشاء ملف للعرض
 */
function createPresentation({ course_id, title, description, fileBase64, fileName, fileType, fileSize }) {
  const all = getAllPresentations();
  const newId = all.length > 0 ? Math.max(...all.map(p => p.id)) + 1 : 1;
  const pres = {
    id: newId,
    course_id: Number(course_id),
    title,
    description: description || "",
    file_data: fileBase64,
    file_name: fileName,
    file_type: fileType, // 'pdf' | 'pptx' | 'ppt'
    file_size: fileSize,
    created_at: new Date().toISOString(),
  };
  all.push(pres);
  savePresentations(all);
  return pres;
}

/**
 * حذف ملف
 */
function deletePresentation(id) {
  const all = getAllPresentations().filter(p => p.id !== Number(id));
  savePresentations(all);
}

/**
 * فتح ملف في نافذة جديدة
 */
function openPresentation(id) {
  const pres = getAllPresentations().find(p => p.id === Number(id));
  if (!pres) {
    alert("الملف غير موجود");
    return;
  }
  // افتح في نافذة جديدة
  const w = window.open();
  if (!w) {
    alert("فضلًا اسمح بالنوافذ المنبثقة");
    return;
  }
  if (pres.file_type === "pdf") {
    w.document.write(`
      <html dir="rtl">
      <head><title>${pres.title}</title></head>
      <body style="margin:0;">
        <embed src="${pres.file_data}" type="application/pdf" width="100%" height="100%" style="height:100vh;">
      </body>
      </html>
    `);
  } else {
    // PPTX/PPT — حمل الملف
    const a = w.document.createElement("a");
    a.href = pres.file_data;
    a.download = pres.file_name;
    a.textContent = "تحميل الملف";
    w.document.body.appendChild(a);
    w.document.body.innerHTML = `
      <div style="font-family:sans-serif;text-align:center;padding:3rem;direction:rtl;">
        <h2>${pres.title}</h2>
        <p>ملف PowerPoint — اضغط للتحميل:</p>
        <a href="${pres.file_data}" download="${pres.file_name}"
           style="display:inline-block;padding:12px 24px;background:#0ea5e9;color:#fff;text-decoration:none;border-radius:8px;">
          ⬇️ تحميل ${pres.file_name}
        </a>
      </div>
    `;
  }
}

/**
 * تنسيق حجم الملف
 */
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}