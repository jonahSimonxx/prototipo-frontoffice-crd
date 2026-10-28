import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSesion } from '../../lib/sesion';
import { puede } from '../../lib/rbac';
import { obtenerSenales } from '../../lib/strapi';
import { TIPOS_EVENTO } from '../../lib/demo-data';
import { Nav } from '../../components/nav';
import { Tarjeta } from '../../components/ui';
import { TablaSenal } from '../../components/signal-table';
import { GraficaPrr } from '../../components/charts';

export default async function SenalizacionPage({
  searchParams,
}: {
  searchParams: Promise<{ evento?: string }>;
}) {
  const sesion = await getSesion();
  if (!sesion) redirect('/login');

  // Defensa adicional: el middleware ya filtra por rol.
  if (!puede(sesion.rol, 'ver_analisis')) {
    return (
      <>
        <Nav sesion={sesion} />
        <main className="contenedor">
          <div className="aviso aviso-error" role="alert">
            Su rol no tiene permiso para el análisis estadístico (403).
          </div>
        </main>
      </>
    );
  }

  const { evento } = await searchParams;
  const datos = await obtenerSenales(sesion.jwt, evento || 'Hepatotoxicidad');
  const paraGrafica = datos.resultados
    .filter((f) => f.prr !== null)
    .map((f) => ({ medicamento: f.medicamento, prr: f.prr ?? 0 }));

  return (
    <>
      <Nav sesion={sesion} />
      <main className="contenedor">
        <h1>Señalización farmacológica</h1>
        <p className="subtitulo">
          Detección de señales por análisis de proporcionalidad (PRR, ROR, χ² de Yates) sobre los
          eventos adversos registrados.
        </p>

        <div className="selector" role="navigation">
          {TIPOS_EVENTO.map((t) => (
            <Link
              key={t}
              href={'/senalizacion?evento=' + encodeURIComponent(t)}
              className={t === datos.evento ? 'activo' : ''}
            >
              {t}
            </Link>
          ))}
        </div>

        <Tarjeta titulo={'Tabla 2×2 y métricas — evento: ' + datos.evento}>
          <TablaSenal filas={datos.resultados} />
          <p className="nota" style={{ marginTop: 10 }}>
            Criterio de Evans: PRR ≥ 2, χ² ≥ 4 y al menos 3 casos.
            {datos.criterioEvans ? ' (' + datos.criterioEvans + ')' : ''}
          </p>
        </Tarjeta>

        <Tarjeta titulo="PRR por medicamento frente al umbral de Evans">
          <GraficaPrr datos={paraGrafica} />
        </Tarjeta>
      </main>
    </>
  );
}
