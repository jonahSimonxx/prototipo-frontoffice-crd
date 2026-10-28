'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Eliminación con confirmación. Visible solo para el rol Administrador;
// el backoffice la revalida con la política solo-admin (Strapi).
export function BotonEliminar({ documentId }: { documentId?: string }) {
  const router = useRouter();
  const [confirmado, setConfirmado] = useState(false);

  async function eliminar() {
    if (!documentId) {
      window.alert('Modo demostración: no se persisten eliminaciones.');
      setConfirmado(false);
      return;
    }
    const res = await fetch('/api/eventos/' + documentId, { method: 'DELETE' });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      window.alert(d.error ?? 'No se pudo eliminar el evento.');
      setConfirmado(false);
      return;
    }
    setConfirmado(false);
    router.refresh();
  }

  if (!confirmado) {
    return (
      <button type="button" className="boton boton-peligro boton-pequeno" onClick={() => setConfirmado(true)}>
        Eliminar
      </button>
    );
  }
  return (
    <span>
      <button type="button" className="boton boton-peligro boton-pequeno" onClick={eliminar}>
        Confirmar
      </button>
      <button
        type="button"
        className="boton boton-secundario boton-pequeno"
        style={{ marginLeft: 4 }}
        onClick={() => setConfirmado(false)}
      >
        No
      </button>
    </span>
  );
}
