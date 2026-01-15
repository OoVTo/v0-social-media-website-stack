import { put } from "@vercel/blob";

export async function uploadFile(
  file: File,
  path: string
): Promise<{ url: string } | { error: string }> {
  try {
    const token = process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN;
    
    if (!token) {
      return {
        error: "Blob token not configured",
      };
    }

    const blob = await put(path, file, {
      access: "public",
      token: token,
    });

    return { url: blob.url };
  } catch (error) {
    console.error("Upload error:", error);
    return { error: "Failed to upload file" };
  }
}