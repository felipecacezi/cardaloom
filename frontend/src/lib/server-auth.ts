
import { headers } from 'next/headers';
import { get, ref } from 'firebase/database';
import { auth as adminAuth } from 'firebase-admin';
import { initializeAdminApp } from '@/lib/firebase-admin';
import { realtimeDb } from '@/lib/firebase';

initializeAdminApp();

type AuthenticatedUser = {
    uid: string;
    cnpj: string;
};

/**
 * Verifies the Firebase ID token from the request headers and returns the user's UID and CNPJ.
 * This is the secure way to identify a user on the server.
 * @returns {Promise<AuthenticatedUser>} An object containing the authenticated user's UID and CNPJ.
 * @throws {Error} If the token is missing, invalid, or the user is not found in the database.
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser> {
    const authorization = headers().get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
        throw new Error('Missing or invalid Authorization header.');
    }

    const idToken = authorization.split('Bearer ')[1];
    if (!idToken) {
        throw new Error('Missing ID token.');
    }

    try {
        const decodedToken = await adminAuth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        const usersRef = ref(realtimeDb, 'users');
        const snapshot = await get(usersRef);

        if (snapshot.exists()) {
            const usersData = snapshot.val();
            const userEntry = Object.entries(usersData).find(
                ([, data]) => (data as any).authUid === uid
            );

            if (userEntry) {
                const [cnpj] = userEntry;
                return { uid, cnpj };
            }
        }

        throw new Error('User not found in the database.');

    } catch (error) {
        console.error('Authentication error:', error);
        throw new Error('Invalid authentication token.');
    }
}
