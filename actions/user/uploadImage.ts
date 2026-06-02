"use server";

const IMGBB_API_URL = "https://api.imgbb.com/1/upload";

function getApiKey(): string {
  const key = process.env.IMGBB_API_KEY;
  if (!key) {
    throw new Error("IMGBB_API_KEY is not defined in .env.local");
  }
  return key;
}

export async function uploadImage(formData: FormData): Promise<{ url: string }> {
  const key = getApiKey();

  const image = formData.get("image");
  if (!image || !(image instanceof File) || image.size === 0) {
    throw new Error("No image file provided");
  }

  const body = new FormData();
  body.set("key", key);
  body.set("image", image);

  const response = await fetch(`${IMGBB_API_URL}?key=${key}`, {
    method: "POST",
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`ImgBB upload failed (${response.status}): ${text}`);
  }

  const data = await response.json();

  if (!data?.data?.image?.url) {
    throw new Error("ImgBB response missing image URL");
  }

  return { url: data.data.image.url };
}
