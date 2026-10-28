import { redirect } from 'next/navigation';
import { getSesion } from '../../lib/sesion';
import { puede } from '../../lib/rbac';
import { obtenerTendencia } from '../../lib/strapi';
import { Nav } from '../../components/nav';
import { Tarjeta } from '../../components/ui';
import { GraficaTendencia } from '../../components/charts';

export default async function TendenciaPage() {
  const sesion = await getSesion();
  if (!sesion) redirect('/login');

  if (!puede(sesion.rol, 'ver_tendencia')) {
    return (
      <>
        <Nav sesion={sesion} />
        <main className="contenedor">
          <div className="aviso aviso-error" role="alert">
            Su rol no tiene permiso para ver la tendencia temporal (403).
          </div>
        </main>
      </>
    );
  }

  const datos = await obtenerTendencia(sesion.jwt);

  return (
    <>
      <Nav sesion={sesion} />
      <main className="contenedor">
        <h1>Tendencia temporal</h1>
        <p className="subtitulo">Eventos adversos por mes y gravedad (serie temporal del estudio).</p>
        <Tarjeta titulo="Eventos adversos por mes y gravedad">
          <GraficaTendencia datos={datos} />
        </Tarjeta>
        <Tarjeta titulo="Datos mensuales">
          <table className="tabla">
            <thead>
              <tr>
                <th>Mes</th>
                <th>Leves</th>
                <th>Moderados</th>
                <th>Graves</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((p) => (
                <tr key={p.mes}>
                  <td>{p.mes}</td>
                  <td>{p.leve}</td>
                  <td>{p.moderada}</td>
                  <td>{p.grave}</td>
                  <td>
                    <strong>{p.total}</strong>
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
