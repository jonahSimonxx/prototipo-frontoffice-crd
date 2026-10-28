import { redirect } from 'next/navigation';
import { getSesion } from '../../lib/sesion';
import { puede } from '../../lib/rbac';
import { obtenerEventos } from '../../lib/strapi';
import { resumenDe, senalesActivas } from '../../lib/estadistica';
import { Nav } from '../../components/nav';
import { StatCard, Tarjeta, InsigniaGravedad } from '../../components/ui';
import { GraficaGravedad, GraficaTipos } from '../../components/charts';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ denegado?: string }>;
}) {
  const sesion = await getSesion();
  if (!sesion) redirect('/login');

  const { denegado } = await searchParams;
  const eventos = await obtenerEventos(sesion.jwt);
  const r = resumenDe(eventos);

  // El aviso de señal solo se muestra a roles con acceso al análisis.
  const activas = puede(sesion.rol, 'ver_analisis') ? senalesActivas(eventos) : [];
  const ultimos = [...eventos].sort((x, y) => (x.fecha < y.fecha ? 1 : -1)).slice(0, 8);

  return (
    <>
      <Nav sesion={sesion} />
      <main className="contenedor">
        <h1>Panel general</h1>
        <p className="subtitulo">Resumen del estudio de farmacovigilancia · rol: {sesion.rol}</p>

        {denegado ? (
          <div className="aviso aviso-error" role="alert">
            Su rol no tiene permiso para acceder a esa sección (403).
          </div>
        ) : null}

        {activas.length > 0 ? (
          <div className="aviso aviso-senal">
            ⚠ Señal farmacológica activa: <strong>{activas[0].fila.medicamento}</strong> —{' '}
            {activas[0].tipo} (PRR {activas[0].fila.prr?.toFixed(2)}, criterios de Evans cumplidos).
          </div>
        ) : null}

        <div className="tarjetas">
          <StatCard titulo="Eventos adversos" valor={r.total} />
          <StatCard titulo="Eventos graves" valor={r.graves} resaltada />
          <StatCard titulo="% de eventos graves" valor={r.pctGraves + '%'} />
          <StatCard titulo="Medicamentos vigilados" valor={r.medicamentos} />
        </div>

        <div className="malla-2">
          <Tarjeta titulo="Distribución por tipo de evento">
            <GraficaTipos datos={r.porTipo} />
          </Tarjeta>
          <Tarjeta titulo="Eventos por gravedad">
            <GraficaGravedad datos={r.porGravedad} />
          </Tarjeta>
        </div>

        <Tarjeta titulo="Últimos eventos adversos">
          <table className="tabla">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Medicamento</th>
                <th>Tipo</th>
                <th>Gravedad</th>
              </tr>
            </thead>
            <tbody>
              {ultimos.map((e, i) => (
                <tr key={i}>
                  <td>{new Date(e.fecha).toLocaleDateString('es-ES')}</td>
                  <td>{e.medicamento}</td>
                  <td>{e.tipo}</td>
                  <td>
                    <InsigniaGravedad gravedad={e.gravedad} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Tarjeta>
      </main>
    </>
  );
}
