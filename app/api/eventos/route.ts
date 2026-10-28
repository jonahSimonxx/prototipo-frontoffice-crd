import { NextResponse } from 'next/server';
import { getSesion } from '../../../lib/sesion';
import { STRAPI_URL } from '../../../lib/strapi';

// Crear un evento adverso (permiso: Investigador, Coordinador y Administrador).
// El backoffice valida de nuevo el permiso del JWT (defensa en profundidad).
export async function POST(req: Request) {
  const sesion = await getSesion();
  if (!sesion) {
    return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  }

  const cuerpo = await req.json();
  if (!STRAPI_URL || sesion.jwt === 'demo') {
    return NextResponse.json({
      ok: true,
      demo: true,
      mensaje: 'Modo demostración: el evento no se persiste.',
    });
  }

  try {
    // Resolver el documentId del medicamento a partir del nombre.
    const busqueda = await fetch(
      STRAPI_URL +
        '/api/medicamentos?filters[nombre][$eq]=' +
        encodeURIComponent(cuerpo.medicamento) +
        '&pagination[pageSize]=1',
      { headers: { Authorization: 'Bearer ' + sesion.jwt }, cache: 'no-store' }
    );
    const lista = (await busqueda.json())?.data ?? [];

    const data: Record<string, unknown> = {
      descripcion: cuerpo.descripcion,
      tipo: cuerpo.tipo,
      gravedad: cuerpo.gravedad,
      fecha: cuerpo.fecha,
    };
    if (Array.isArray(lista) && lista[0]) {
      data.medicamento = lista[0].documentId;
    }

    const r = await fetch(STRAPI_URL + '/api/evento-adversos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + sesion.jwt },
      body: JSON.stringify({ data }),
    });
    if (!r.ok) {
      return NextResponse.json(
        { error: 'El backend rechazó la operación (verifique los permisos de su rol).' },
        { status: r.status }
      );
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Error de comunicación con el backend.' }, { status: 502 });
  }
}
