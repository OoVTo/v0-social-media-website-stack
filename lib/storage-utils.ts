import { put } from "@vercel/blob";

export async function uploadFile(
  file: File,
  path: string
): Promise<{ url: string } | { error: string }> {
  try {
    const token = process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN;
    
    console.log("🔍 Blob token exists:", !!token);
    console.log("📁 Uploading file:", file.name, "to path:", path);

    if (!token) {
      const error = "Blob token not configured. Set BLOB_READ_WRITE_TOKEN in Vercel environment variables.";
      console.error("❌ " + error);
      return { error };
    }

    const blob = await put(path, file, {
      access: "public",
      token: token,
    });

    console.log("✅ Upload successful:", blob.url);
    return { url: blob.url };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("❌ Upload error:", errorMsg);
    return { error: errorMsg };
  }
}