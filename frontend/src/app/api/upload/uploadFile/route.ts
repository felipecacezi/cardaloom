import { NextRequest, NextResponse } from "next/server";
import { ref, push, set } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import { UploadService } from "../../../../services/upload.service";
import { MinioAdapter } from "../../../../adapters/upload/minio.adapter";
import { log } from "console";

const uploadService = new UploadService(
  new MinioAdapter({
    endPoint: process.env.MINIO_ENDPOINT || "minio",
    port: parseInt(process.env.MINIO_PORT || "9000"),
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
    secretKey: process.env.MINIO_SECRET_KEY || "minioadmin123",
    bucketName: process.env.MINIO_BUCKET_NAME || "cardaloom",
  }),
);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const cnpj = formData.get("cnpj") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado." },
        { status: 400 },
      );
    }
    if (!cnpj) {
      return NextResponse.json(
        { error: "CNPJ não fornecido." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadResult = await uploadService.uploadFile(
      buffer,
      file.name,
      file.type,
      cnpj,
    );
    const imagesRef = ref(realtimeDb, `images/${cnpj}`);
    const newImageRef = push(imagesRef);
    const imageId = newImageRef.key;

    if (!imageId) {
      throw new Error("Failed to generate image ID.");
    }

    await set(newImageRef, {
      filePath: uploadResult.filePath,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      imageId: imageId,
      filePath: uploadResult.filePath,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Erro ao fazer upload do arquivo." },
      { status: 500 },
    );
  }
}
