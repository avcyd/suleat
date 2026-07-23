import { mkdir, writeFile } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

/**
 * Save an uploaded image under public/uploads/{folder} and return its public path.
 */
export async function saveUploadedImage(
  file: File,
  folder: string,
): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error("No image file provided.");
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Image must be JPEG, PNG, WebP, or GIF.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image must be 5MB or smaller.");
  }

  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : file.type === "image/gif"
          ? "gif"
          : "jpg";

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return `/uploads/${folder}/${filename}`;
}
