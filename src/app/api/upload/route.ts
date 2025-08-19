
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import formidable, { File } from 'formidable';

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
    // If directory doesn't exist, create it
    await fs.mkdir(userUploadDir, { recursive: true });
  }
  return userUploadDir;
}

export async function POST(req: NextRequest) {
  try {
    const form = formidable({});
    
    // Use a Promise to handle the asynchronous parsing
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

    // 1. Ensure user-specific upload directory exists
    const userUploadDir = await ensureUploadDirExists(cnpj);

    // 2. Define the new path for the file
    const newFilename = `${Date.now()}-${file.originalFilename}`;
    const newPath = path.join(userUploadDir, newFilename);

    // 3. Move the file from its temporary location to the new path
    await fs.rename(file.filepath, newPath);

    // 4. Construct the public URL for the file
    const filePath = `/uploads/${cnpj}/${newFilename}`;

    return NextResponse.json({ filePath });
  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json({ error: 'Erro ao fazer upload do arquivo.' }, { status: 500 });
  }
}
