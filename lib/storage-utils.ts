import { put } from "@vercel/blob"

export async function uploadFile(file: File, path: string): Promise<{ url: string } | { error: string }> {
  try {
    // Check if the token is available
    if (!process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN) {
      return {
        error: "Image upload is not configured. Please set up Vercel Blob storage to enable media uploads.",
      }
    }

    const blob = await put(path, file, {
      access: "public",
      token: process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN,
    })
    return { url: blob.url }
  } catch (error: any) {
    // Check if it's a token-related error
    if (error.message?.includes("BLOB_READ_WRITE_TOKEN") || error.message?.includes("No token found")) {
      return {
        error: "Image upload is not configured. To enable image uploads, configure Vercel Blob storage with BLOB_READ_WRITE_TOKEN.",
      }
    }
    return { error: error.message || "Failed to upload file" }
  }
}