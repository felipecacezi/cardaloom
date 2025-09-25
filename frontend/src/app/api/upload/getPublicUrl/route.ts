
import { NextRequest, NextResponse } from 'next/server';
import { ref, push, set } from 'firebase/database';
import { realtimeDb } from '@/lib/firebase';
import { UploadService } from "@/services/upload.service";
import { MinioAdapter } from "@/adapters/upload/minio.adapter";

const uploadService = new UploadService(
  new MinioAdapter({
    endPoint: process.env.MINIO_ENDPOINT || 'minio',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123',
    bucketName: process.env.MINIO_BUCKET_NAME || 'cardaloom'
  })
);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('filePath') as string | null;
    const cnpj = formData.get('cnpj') as string | null;
    console.log('cnpj', cnpj, 'file', file);
    const filePath = uploadService.getPublicLink('', '', '',`${file}`);    

    

    return NextResponse.json({ filePath });
  } catch(error: any) {
    return NextResponse.json(
      { error: 'Arquivo não encontrado, favor acionar o suporte.' },
      { status: 500 }
    );
  }
}
