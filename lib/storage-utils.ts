import { put } from "@vercel/blob"

export async function uploadFile(file: File, path: string): Promise<{ url: string } | { error: string }> {
  try {
    const blob = await put(path, file, { access: "public" })
    return { url: blob.url }
  } catch (error: any) {
    return { error: error.message }
  }
}
