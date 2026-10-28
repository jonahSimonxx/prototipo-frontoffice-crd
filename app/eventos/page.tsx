import { redirect } from 'next/navigation';
import { getSesion } from '../../lib/sesion';
import { puede } from '../../lib/rbac';
import { obtenerEventos } from '../../lib/strapi';
import { Nav } from '../../components/nav';
import { Tarjeta, InsigniaGravedad } from '../../components/ui';
import { EventoForm } from '../../components/evento-form';
import { BotonEliminar } from '../../components/boton-eliminar';

export default async function EventosPage() {
  const sesion = await getSesion();
  if (!sesion) redirect('/login');

  const eventos = await obtenerEventos(sesion.jwt);
  const ordenados = [...eventos].sort((x, y) => (x.fecha < y.fecha ? 1 : -1));
  const puedeCrear = puede(sesion.rol, 'crear_evento');
  const puedeEliminar = puede(sesion.rol, 'eliminar_evento');

  return (
    <>
      <Nav sesion={sesion} />
      <main className="contenedor">
        <h1>Eventos adversos</h1>
        <p className="subtitulo">{eventos.length} eventos registrados en el estudio</p>

        {puedeCrear ? <EventoForm /> : <p className="nota">Su rol no permite registrar eventos.</p>}

        <Tarjeta>
          <table className="tabla">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Medicamento</th>
                <th>Tipo</th>
                <th>Gravedad</th>
                {puedeEliminar ? <th>Acción</th> : null}
              </tr>
            </thead>
            <tbody>
              {ordenados.map((e, i) => (
                <tr key={e.documentId ?? 'demo-' + i}>
                  <td>{new Date(e.fecha).toLocaleDateString('es-ES')}</td>
                  <td>{e.medicamento}</td>
                  <td>{e.tipo}</td>
                  <td>
                    <InsigniaGravedad gravedad={e.gravedad} />
                  </td>
                  {puedeEliminar ? (
                    <td>
                      <BotonEliminar documentId={e.documentId} />
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </Tarjeta>
      </main>
    </>
  );
}
