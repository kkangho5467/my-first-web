import { supabase } from "@/lib/supabaseClient";

export async function uploadImageToSupabase(file: File, bucketName = "images"): Promise<string> {
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