import { supabase } from "@/lib/supabaseClient";

export const MAX_ATTACHMENT_SIZE_BYTES = 5 * 1024 * 1024;

export async function uploadImageToSupabase(file: File, bucketName = "images"): Promise<string> {
  if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
    throw new Error("첨부 파일은 최대 5MB까지만 업로드할 수 있습니다.");
  }

  const extension = file.name.substring(file.name.lastIndexOf(".")) || "";
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}${extension}`;

  const { data, error } = await supabase.storage.from(bucketName).upload(fileName, file);

  if (error) {
    console.error("Image upload error:", error);
    throw error;
  }

  const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(data.path);
  return publicUrlData.publicUrl;
}