/* ==========================================================
   Ta3leem — File Management (Supabase Storage)
   ========================================================== */

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

async function uploadFile(file, folder = "misc") {
  try {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("الملف أكبر من 20MB");
    }

    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const path = `${folder}/${fileName}`;

    const { data, error } = await sb.storage
      .from("presentations")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    const { data: { publicUrl } } = sb.storage
      .from("presentations")
      .getPublicUrl(path);

    return { url: publicUrl, path: data.path, error: null };
  } catch (err) {
    return { url: null, path: null, error: err.message };
  }
}

async function deleteFile(path) {
  try {
    const { error } = await sb.storage.from("presentations").remove([path]);
    if (error) throw error;
    return { error: null };
  } catch (err) {
    return { error: err.message };
  }
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}