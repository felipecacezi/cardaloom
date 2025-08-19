
import { NextResponse } from 'next/server';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, realtimeDb } from '../../../lib/firebase';

export async function POST(req: Request) {
  try {
    const { email, password, restaurantName, ownerName, cnpj, street, number, complement, neighborhood, city, state, zipCode } = await req.json();

    // 1. Validar dados (Opcional, mas recomendado para segurança)
    if (!email || !password || !restaurantName || !ownerName || !cnpj) {
      return NextResponse.json({ error: 'Dados obrigatórios faltando' }, { status: 400 });
    }

    // Limpar o CNPJ: remover pontos, traço e barra
    const cleanedCnpj = cnpj.replace(/[.\-/]/g, '');

    // 2. Verificar se o CNPJ limpo já existe no banco de dados
    const cnpjRef = ref(realtimeDb, `users/${cleanedCnpj}`);
    const snapshot = await get(cnpjRef);
    if (snapshot.exists()) {
      return NextResponse.json({ error: 'CNPJ já cadastrado.' }, { status: 400 });
    }

    // 2. Criar usuário no Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 3. Obter o UID do usuário criado
    const uid = user.uid;

    // 4. Salvar dados adicionais no Firebase Realtime Database
    const userRef = ref(realtimeDb, `users/${cleanedCnpj}`); // Usando o CNPJ limpo como chave
    await set(userRef, {
      authUid: uid, // Salvando o UID do Auth para referência
      restaurantName,
      ownerName,
      cnpj, // Salvando o CNPJ original
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

    console.log('Usuário criado e dados salvos com CNPJ limpo como ID:', { id: cleanedCnpj, email: user.email });

    // 5. Retornar resposta de sucesso
    return NextResponse.json({ message: 'Usuário criado com sucesso!', id: cleanedCnpj }, { status: 201 });

  } catch (error: any) {
    console.error('Erro no BFF ao criar usuário:', error);

    // Tratar erros específicos do Firebase Authentication
    if (error.code === 'auth/email-already-in-use') {
      return NextResponse.json({ error: 'Este email já está em uso.' }, { status: 400 });
    }
    if (error.code === 'auth/weak-password') {
        return NextResponse.json({ error: 'A senha é muito fraca.' }, { status: 400 });
    }
    if (error.code === 'auth/invalid-email') {
        return NextResponse.json({ error: 'O formato do email é inválido.' }, { status: 400 });
    }

    return NextResponse.json({ error: error.message || 'Erro interno do servidor' }, { status: 500 });
  }
}
