import { NextResponse } from 'next/server';
import { COOKIE_SESION, codificarSesion } from '../../../lib/sesion';
import type { Rol } from '../../../lib/rbac';
import { STRAPI_URL } from '../../../lib/strapi';

const OPCIONES_COOKIE = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
};

const USUARIOS_DEMO = [
  { email: 'admin@crd.cu', password: 'Admin123!', rol: 'administrador', usuario: 'admin' },
  { email: 'coordinador@crd.cu', password: 'Coord123!', rol: 'coordinador', usuario: 'coordinador' },
  { email: 'investigador@crd.cu', password: 'Invest123!', rol: 'investigador', usuario: 'investigador' },
];

export async function POST(req: Request) {
  const cuerpo = await req.json();
  const identifier = String(cuerpo.identifier ?? '');
  const password = String(cuerpo.password ?? '');

  // Modo demostración (sin STRAPI_URL configurada).
  if (!STRAPI_URL) {
    const u = USUARIOS_DEMO.find(
      (x) => (x.email === identifier || x.usuario === identifier) && x.password === password
    );
    if (!u) {
      return NextResponse.json({ error: 'Credenciales incorrectas.' }, { status: 401 });
    }
    const res = NextResponse.json({ ok: true, rol: u.rol, usuario: u.usuario, demo: true });
    res.cookies.set(
      COOKIE_SESION,
      codificarSesion({ usuario: u.usuario, rol: u.rol as Rol, jwt: 'demo' }),
      OPCIONES_COOKIE
    );
    return res;
  }

  // Modo Strapi: autenticación real contra el backoffice (users-permissions).
  const r = await fetch(STRAPI_URL + '/api/auth/local', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });
  if (!r.ok) {
    return NextResponse.json({ error: 'Credenciales incorrectas.' }, { status: 401 });
  }

  const datos = await r.json();
  let rol = datos.user?.role?.type ?? null;
  if (!rol) {
    try {
      const me = await fetch(STRAPI_URL + '/api/users/me?populate=role', {
        headers: { Authorization: 'Bearer ' + datos.jwt },
      });
      const yo = await me.json();
      rol = yo?.role?.type ?? null;
    } catch {
      rol = null;
    }
  }

  // Ante la duda se asigna el rol de menor privilegio (defensa en profundidad).
  const rolFinal: Rol =
    rol === 'administrador' || rol === 'coordinador' || rol === 'investigador'
      ? (rol as Rol)
      : 'investigador';

  const usuario = datos.user?.username ?? 'usuario';
  const res = NextResponse.json({ ok: true, rol: rolFinal, usuario });
  res.cookies.set(
    COOKIE_SESION,
    codificarSesion({ usuario, rol: rolFinal, jwt: datos.jwt }),
    OPCIONES_COOKIE
  );
  return res;
}
