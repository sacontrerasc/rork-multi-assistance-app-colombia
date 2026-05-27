import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import createContextHook from '@nkzw/create-context-hook';
import { User } from '@/types';

const AUTH_URL = process.env.EXPO_PUBLIC_RORK_AUTH_URL ?? '';
const APP_KEY = process.env.EXPO_PUBLIC_RORK_APP_KEY ?? '';
const PROJECT_ID = process.env.EXPO_PUBLIC_PROJECT_ID ?? '';

const STORAGE_USER = 'auth_user';
const STORAGE_PROFILE = 'auth_user_profile';
const SECURE_ACCESS = 'access_token';
const SECURE_REFRESH = 'refresh_token';

/** SecureStore is unavailable on web; fall back to AsyncStorage there. */
async function secureSet(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function secureGet(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return AsyncStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function secureDelete(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

function base64UrlEncode(bytes: Uint8Array): string {
  let str = '';
  for (let i = 0; i < bytes.length; i += 1) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function generateCodeVerifier(): string {
  const bytes = new Uint8Array(32);
  // eslint-disable-next-line no-undef
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  // eslint-disable-next-line no-undef
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(hash));
}

interface RorkUser {
  id?: string;
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
}

function decodeJwtUser(token: string): RorkUser | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return {
      id: payload.sub,
      sub: payload.sub,
      email: payload.email ?? '',
      name: payload.name,
      picture: payload.picture,
    };
  } catch {
    return null;
  }
}

function mapRorkUserToAppUser(rork: RorkUser, existing?: User | null): User {
  return {
    id: rork.id ?? rork.sub ?? existing?.id ?? 'u_' + Date.now(),
    name: rork.name ?? existing?.name ?? (rork.email ? rork.email.split('@')[0] : 'Usuario'),
    email: rork.email ?? existing?.email ?? '',
    phone: existing?.phone ?? '',
    documentType: existing?.documentType ?? 'CC',
    documentNumber: existing?.documentNumber ?? '',
    avatar: rork.picture ?? existing?.avatar,
    role: existing?.role ?? 'user',
    planId: existing?.planId ?? '',
    companyId: existing?.companyId,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const codeVerifierRef = useRef<string | null>(null);

  const persistUser = useCallback(async (u: User) => {
    await AsyncStorage.setItem(STORAGE_USER, JSON.stringify(u));
    await AsyncStorage.setItem(STORAGE_PROFILE, JSON.stringify(u));
    setUser(u);
    setIsAuthenticated(true);
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    const rt = await secureGet(SECURE_REFRESH);
    if (!rt || !AUTH_URL || !APP_KEY) return null;
    try {
      const res = await fetch(`${AUTH_URL}/oauth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_key: APP_KEY, refresh_token: rt }),
      });
      if (!res.ok) return null;
      const { access_token } = await res.json();
      await secureSet(SECURE_ACCESS, access_token);
      return access_token as string;
    } catch (e) {
      console.log('[Auth] refresh failed', e);
      return null;
    }
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_USER);
        if (stored) {
          setUser(JSON.parse(stored));
          setIsAuthenticated(true);
        }
        const accessToken = await secureGet(SECURE_ACCESS);
        if (accessToken) {
          const decoded = decodeJwtUser(accessToken);
          if (!decoded) {
            await refreshAccessToken();
          }
        }
      } catch (e) {
        console.log('[Auth] bootstrap error', e);
      } finally {
        setIsLoading(false);
      }
    };
    void bootstrap();
  }, [refreshAccessToken]);

  const exchangeCode = useCallback(async (code: string): Promise<void> => {
    const verifier = codeVerifierRef.current;
    if (!verifier) {
      setAuthError('Sesión de autenticación inválida');
      return;
    }
    codeVerifierRef.current = null;

    const res = await fetch(`${AUTH_URL}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_key: APP_KEY, code, code_verifier: verifier }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const message = body.error || `Error de autenticación (${res.status})`;
      console.log('[Auth] token exchange failed', body);
      setAuthError(message);
      return;
    }
    const { access_token, refresh_token, user: rorkUser } = await res.json();
    await secureSet(SECURE_ACCESS, access_token);
    if (refresh_token) await secureSet(SECURE_REFRESH, refresh_token);

    const decoded = decodeJwtUser(access_token);
    const merged = mapRorkUserToAppUser({ ...(decoded ?? {}), ...(rorkUser ?? {}) }, user);
    await persistUser(merged);
  }, [persistUser, user]);

  useEffect(() => {
    const sub = Linking.addEventListener('url', async (event: { url: string }) => {
      try {
        const u = new URL(event.url);
        if (u.pathname === '/auth/callback') {
          const code = u.searchParams.get('code');
          if (code) await exchangeCode(code);
        }
      } catch (e) {
        console.log('[Auth] deep link error', e);
      }
    });
    return () => sub.remove();
  }, [exchangeCode]);

  const signInWithGoogle = useCallback(async (): Promise<void> => {
    if (!AUTH_URL || !APP_KEY) {
      setAuthError('Autenticación no configurada');
      return;
    }
    setAuthError(null);
    setIsSigningIn(true);
    try {
      const verifier = generateCodeVerifier();
      const challenge = await generateCodeChallenge(verifier);
      codeVerifierRef.current = verifier;

      const isWeb = Platform.OS === 'web';
      const env = isWeb ? 'preview' : 'native';

      const res = await fetch(`${AUTH_URL}/oauth/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app_key: APP_KEY,
          provider: 'google',
          code_challenge: challenge,
          target: 'rn',
          env,
        }),
      });
      if (!res.ok) {
        codeVerifierRef.current = null;
        const body = await res.json().catch(() => ({}));
        const msg = body.error || `No se pudo iniciar el login (${res.status})`;
        console.log('[Auth] initiate failed', body);
        setAuthError(msg);
        return;
      }
      const { auth_url } = await res.json();

      if (isWeb) {
        // eslint-disable-next-line no-undef
        const popup = window.open(auth_url, '_blank', 'width=500,height=650');
        await new Promise<void>((resolve, reject) => {
          // eslint-disable-next-line no-undef
          const onMessage = (event: MessageEvent) => {
            if (event.data?.type !== 'rork_auth_callback') return;
            // eslint-disable-next-line no-undef
            window.removeEventListener('message', onMessage);
            clearInterval(pollTimer);
            const code = event.data.code;
            if (code) exchangeCode(code).then(resolve, reject);
            else resolve();
          };
          // eslint-disable-next-line no-undef
          window.addEventListener('message', onMessage);
          const pollTimer = setInterval(() => {
            if (popup?.closed) {
              clearInterval(pollTimer);
              // eslint-disable-next-line no-undef
              window.removeEventListener('message', onMessage);
              codeVerifierRef.current = null;
              resolve();
            }
          }, 500);
        });
      } else {
        const result = await WebBrowser.openAuthSessionAsync(
          auth_url,
          `rork-${PROJECT_ID}://auth/callback`,
        );
        if (result.type === 'success') {
          const u = new URL(result.url);
          const code = u.searchParams.get('code');
          if (code) await exchangeCode(code);
        } else if (result.type === 'cancel' || result.type === 'dismiss') {
          codeVerifierRef.current = null;
        }
      }
    } catch (e) {
      console.log('[Auth] signInWithGoogle error', e);
      setAuthError(e instanceof Error ? e.message : 'Error iniciando sesión con Google');
    } finally {
      setIsSigningIn(false);
    }
  }, [exchangeCode]);

  const login = useCallback(async (email: string, _password: string) => {
    const storedUser = await AsyncStorage.getItem(STORAGE_PROFILE);
    let loggedInUser: User;
    if (storedUser) {
      loggedInUser = JSON.parse(storedUser);
    } else {
      loggedInUser = {
        id: 'u_' + Date.now(),
        name: email.split('@')[0] ?? 'Usuario',
        email,
        phone: '',
        documentType: 'CC',
        documentNumber: '',
        role: 'user',
        planId: '',
        createdAt: new Date().toISOString(),
      };
    }
    await persistUser(loggedInUser);
  }, [persistUser]);

  const register = useCallback(async (name: string, email: string, _password: string) => {
    const newUser: User = {
      id: 'u_' + Date.now(),
      name,
      email,
      phone: '',
      documentType: 'CC',
      documentNumber: '',
      role: 'user',
      planId: '',
      createdAt: new Date().toISOString(),
    };
    await persistUser(newUser);
  }, [persistUser]);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_USER);
    await secureDelete(SECURE_ACCESS);
    await secureDelete(SECURE_REFRESH);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  return {
    user,
    isLoading,
    isAuthenticated,
    isSigningIn,
    authError,
    login,
    register,
    logout,
    signInWithGoogle,
    clearAuthError,
  };
});
