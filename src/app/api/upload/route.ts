
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import formidable, { File } from 'formidable';
import { ref, push, set } from 'firebase/database';
import { realtimeDb } from '@/lib/firebase';

export const config = {
  api: {
    bodyParser: false,
  },
};

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
    const form = formidable({});
    
    const [fields, files] = await new Promise<[formidable.Fields<string>, formidable.Files<string>]>((resolve, reject) => {
        form.parse(req as any, (err, fields, files) => {
            if (err) {
                reject(err);
                return;
            }
            resolve([fields, files]);
        });
    });

    const cnpjField = fields.cnpj;
    if (!cnpjField || typeof cnpjField[0] !== 'string') {
      return NextResponse.json({ error: 'CNPJ não fornecido.' }, { status: 400 });
    }
    const cnpj = cnpjField[0];

    const fileArray = files.file;
    if (!fileArray || fileArray.length === 0) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }
    
    const file = fileArray[0] as File;

    const userUploadDir = await ensureUploadDirExists(cnpj);

    const newFilename = `${Date.now()}-${file.originalFilename}`;
    const newPath = path.join(userUploadDir, newFilename);

    await fs.rename(file.filepath, newPath);

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
      fileName: file.originalFilename,
      fileType: file.mimetype,
      fileSize: file.size,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ imageId: imageId, filePath: filePath });
  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json({ error: 'Erro ao fazer upload do arquivo.' }, { status: 500 });
  }
}
