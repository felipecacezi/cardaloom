
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import formidable from 'formidable';

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
  const form = formidable({});
  
  try {
    const [fields, files] = await form.parse(req as any);
    
    const cnpjField = fields.cnpj;
    if (!cnpjField || typeof cnpjField[0] !== 'string') {
        return NextResponse.json({ error: 'CNPJ não fornecido.' }, { status: 400 });
    }
    const cnpj = cnpjField[0];
    
    if (!files.file || files.file.length === 0) {
        return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    const userUploadDir = await ensureUploadDirExists(cnpj);

    const formWithUploadDir = formidable({
        uploadDir: userUploadDir,
        keepExtensions: true,
        filename: (name, ext, part, form) => {
            return `${Date.now()}-${part.originalFilename}`;
        }
    });

    // We need to re-parse with the correct upload directory
    // This is not ideal, but formidable doesn't easily support dynamic upload directories based on fields.
    // A more robust solution might involve a different library or handling streams manually.
    // For this use case, re-parsing is acceptable.
     const [reparsedFields, reparsedFiles] = await form.parse(req as any);
     const file = reparsedFiles.file![0];

     const tempPath = file.filepath;
     const newFilename = `${Date.now()}-${file.originalFilename}`;
     const newPath = path.join(userUploadDir, newFilename);

     await fs.rename(tempPath, newPath);

    const filePath = `/uploads/${cnpj}/${newFilename}`;

    return NextResponse.json({ filePath });
  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json({ error: 'Erro ao fazer upload do arquivo.' }, { status: 500 });
  }
}
