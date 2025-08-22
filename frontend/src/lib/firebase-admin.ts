import admin from 'firebase-admin';

let serviceAccount: any = null;

// Função para obter e validar as credenciais
const getServiceAccount = () => {
  if (serviceAccount) return serviceAccount;
  
  const serviceAccountKeyBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  
  if (!serviceAccountKeyBase64) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY não está definida');
  }

  try {
    // Decodifica Base64 para string JSON
    const decodedKey = Buffer.from(serviceAccountKeyBase64, 'base64').toString('utf8');
    
    // Faz parse do JSON
    serviceAccount = JSON.parse(decodedKey);
    return serviceAccount;
  } catch (error) {
    console.error('Erro ao decodificar/parsear FIREBASE_SERVICE_ACCOUNT_KEY:', error);
    console.error('Certifique-se que a variável está em formato Base64 válido');
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY não é um Base64/JSON válido');
  }
};

export const initializeAdminApp = () => {
  // Evita inicialização durante build time
  if (typeof window !== 'undefined') {
    throw new Error('Firebase Admin não deve ser usado no cliente');
  }

  // Se já existe uma instância, retorna ela
  if (admin.apps.length > 0) {
    return admin;
  }

  try {
    const credentials = getServiceAccount();
    const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;

    if (!databaseURL) {
      throw new Error('NEXT_PUBLIC_FIREBASE_DATABASE_URL não está definida');
    }

    admin.initializeApp({
      credential: admin.credential.cert(credentials),
      databaseURL: databaseURL,
    });

    console.log('Firebase Admin inicializado com sucesso');
    return admin;
  } catch (error) {
    console.error('Erro ao inicializar Firebase Admin:', error);
    throw error;
  }
};