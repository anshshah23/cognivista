import { NextRequest, NextResponse } from "next/server";
import formidable from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false, // Disable default bodyParser
  },
};

export async function POST(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({
      multiples: false,
      maxFileSize: 200 * 1024 * 1024, // ✅ Set 200MB file size limit
      uploadDir: path.join(process.cwd(), "public/uploads/videos"),
      keepExtensions: true,
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Upload Error:", err);
        return reject(new NextResponse("File upload error", { status: 500 }));
      }

      const file = files.file?.[0]; // Get uploaded file
      if (!file) {
        return resolve(new NextResponse("No file uploaded", { status: 400 }));
      }

      const filePath = `/uploads/videos/${path.basename(file.filepath)}`;

      resolve(
        NextResponse.json({ filePath }, { status: 200 })
      );
    });
  });
}
