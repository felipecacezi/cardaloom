
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'public', 'uploads');

async function ensureUploadDirExists() {
  try {
    await fs.access(uploadDir);
  } catch (error) {
    await fs.mkdir(uploadDir, { recursive: true });
  }
}

export async function POST(req: NextRequest) {
  await ensureUploadDirExists();

  const form = formidable({
      uploadDir: uploadDir,
      keepExtensions: true,
      filename: (name, ext, part, form) => {
        return `${Date.now()}-${part.originalFilename}`;
      }
  });

  try {
    const [fields, files] = await form.parse(req as any);
    
    if (!files.file || files.file.length === 0) {
        return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    const file = files.file[0];
    const filePath = `/uploads/${file.newFilename}`;

    return NextResponse.json({ filePath });
  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json({ error: 'Erro ao fazer upload do arquivo.' }, { status: 500 });
  }
}
