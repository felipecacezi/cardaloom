
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { initializeAdminApp } from '@/lib/firebase-admin';
import { getDatabase, ref, set, get } from 'firebase/database';
import '@/lib/firebase-client';

const admin = initializeAdminApp();
const adminAuth = admin.auth();
const realtimeDb = getDatabase();

const signUpSchema = z.object({
  restaurantName: z.string().min(2),
  ownerName: z.string().min(2),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'Invalid CNPJ format'),
  email: z.string().email(),
  password: z.string().min(8),
  zipCode: z.string().regex(/^\d{5}-\d{3}$/, 'Invalid ZIP code format'),
  street: z.string().min(2),
  number: z.string().min(1),
  complement: z.string().optional(),
  neighborhood: z.string().min(2),
  city: z.string().min(2),
  state: z.string().min(2),
});


export async function POST(req: Request) {
  try {
    const rawData = await req.json();
    const validatedData = signUpSchema.safeParse(rawData);

    if (!validatedData.success) {
      return NextResponse.json({ error: 'Invalid input data', details: validatedData.error.flatten() }, { status: 400 });
    }
    
    const { email, password, restaurantName, ownerName, cnpj, street, number, complement, neighborhood, city, state, zipCode } = validatedData.data;
    
    const cleanedCnpj = cnpj.replace(/[.\-/]/g, '');

    const cnpjRef = ref(realtimeDb, `users/${cleanedCnpj}`);
    const snapshot = await get(cnpjRef);
    if (snapshot.exists()) {
      return NextResponse.json({ error: 'CNPJ já cadastrado.' }, { status: 409 });
    }

    const userRecord = await adminAuth.createUser({
        email,
        password,
        displayName: ownerName,
    });
    const uid = userRecord.uid;

    const userRef = ref(realtimeDb, `users/${cleanedCnpj}`);
    await set(userRef, {
      authUid: uid,
      restaurantName,
      ownerName,
      cnpj,
      email,
      createdAt: new Date().toISOString(),
      address: {
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
        zipCode
      }
    });

    return NextResponse.json({ message: 'Usuário criado com sucesso!', id: cleanedCnpj }, { status: 201 });

  } catch (error: any) {
    console.error('Erro no BFF ao criar usuário:', error);
    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json({ error: 'Este email já está em uso.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message || 'Erro interno do servidor' }, { status: 500 });
  }
}
