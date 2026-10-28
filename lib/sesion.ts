import { cookies } from 'next/headers';
import type { Sesion } from './rbac';

export const COOKIE_SESION = 'crd_sesion';

export function codificarSesion(sesion: Sesion): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(sesion))));
}

export function decodificarSesion(raw: string): Sesion | null {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(raw))));
  } catch {
    return null;
  }
}

export async function getSesion(): Promise<Sesion | null> {
  const guardado = (await cookies()).get(COOKIE_SESION)?.value;
  return guardado ? decodificarSesion(guardado) : null;
}
