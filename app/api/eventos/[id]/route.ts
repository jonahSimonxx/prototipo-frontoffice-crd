import { NextResponse } from 'next/server';
import { getSesion } from '../../../../lib/sesion';
import { STRAPI_URL } from '../../../../lib/strapi';

// Eliminar un evento adverso. El frontoffice solo lo muestra para el rol
// Administrador y el backoffice lo vuelve a validar con la política solo-admin.
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const sesion = await getSesion();
  if (!sesion) {
    return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  }
  if (!STRAPI_URL || sesion.jwt === 'demo') {
    return NextResponse.json({ ok: true, demo: true });
  }
  const r = await fetch(STRAPI_URL + '/api/evento-adversos/' + id, {
    method: 'DELETE',
    headers: { Authorization: 'Bearer ' + sesion.jwt },
  });
  if (!r.ok) {
    return NextResponse.json(
      { error: 'El backend rechazó la operación (solo el rol Administrador puede eliminar).' },
      { status: r.status }
    );
  }
  return NextResponse.json({ ok: true });
}
