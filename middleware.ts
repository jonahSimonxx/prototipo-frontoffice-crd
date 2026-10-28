import { NextResponse, type NextRequest } from 'next/server';

// RBAC a nivel de rutas: cada sección define qué roles pueden entrar.
// Sin sesión → /login. Con rol insuficiente → panel con aviso.
const RUTAS_POR_ROL: Record<string, string[]> = {
  administrador: ['/dashboard', '/eventos', '/senalizacion', '/tendencia', '/usuarios'],
  coordinador: ['/dashboard', '/eventos', '/senalizacion', '/tendencia'],
  investigador: ['/dashboard', '/eventos'],
};

function decodificar(raw: string): { rol?: string } | null {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(raw))));
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const raw = req.cookies.get('crd_sesion')?.value;

  if (!raw) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  const sesion = decodificar(raw);
  if (!sesion) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  const permitidas = RUTAS_POR_ROL[sesion.rol ?? ''] ?? [];
  if (!permitidas.some((p) => pathname.startsWith(p))) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    url.searchParams.set('denegado', '1');
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/eventos/:path*',
    '/senalizacion/:path*',
    '/tendencia/:path*',
    '/usuarios/:path*',
  ],
};
