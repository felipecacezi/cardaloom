
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { ref, push, set } from 'firebase/database';
import { realtimeDb } from '@/lib/firebase';

const baseUploadDir = path.join(process.cwd(), 'public', 'uploads');

async function ensureUploadDirExists(cnpj: string) {
  const userUploadDir = path.join(baseUploadDir, cnpj);
  try {
    await fs.access(userUploadDir);
  } catch (error) {
    await fs.mkdir(userUploadDir, { recursive: true });
  }
  return userUploadDir;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const cnpj = formData.get('cnpj') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }
    if (!cnpj) {
      return NextResponse.json({ error: 'CNPJ não fornecido.' }, { status: 400 });
    }

    const userUploadDir = await ensureUploadDirExists(cnpj);
    
    const buffer = Buffer.from(await file.arrayBuffer());
    const newFilename = `${Date.now()}-${file.name}`;
    const newPath = path.join(userUploadDir, newFilename);
    
    await fs.writeFile(newPath, buffer);

    const filePath = `/uploads/${cnpj}/${newFilename}`;

    // Save image metadata to Firebase
    const imagesRef = ref(realtimeDb, `images/${cnpj}`);
    const newImageRef = push(imagesRef);
    const imageId = newImageRef.key;

    if (!imageId) {
        throw new Error("Failed to generate image ID.");
    }
    
    await set(newImageRef, {
      filePath: filePath,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ imageId: imageId, filePath: filePath });
  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json({ error: 'Erro ao fazer upload do arquivo.' }, { status: 500 });
  }
}
