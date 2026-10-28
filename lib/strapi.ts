import {
  calcularSenales,
  tendenciaDe,
  tipoMasFrecuente,
  type EventoRegistro,
  type FilaSenal,
  type PuntoTendencia,
} from './estadistica';
import { DEMO_EVENTOS } from './demo-data';

// URL del backoffice Strapi. Si no está definida, el frontoffice
// funciona en MODO DEMOSTRACIÓN con los datos embebidos (lib/demo-data.ts).
export const STRAPI_URL = process.env.STRAPI_URL ?? '';
export const MODO_DEMO = !STRAPI_URL;

async function pedir(ruta: string, jwt: string, init: RequestInit = {}): Promise<any> {
  const res = await fetch(STRAPI_URL + '/api' + ruta, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + jwt,
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error('Strapi respondió ' + res.status);
  }
  return res.json();
}

export async function obtenerEventos(jwt: string): Promise<EventoRegistro[]> {
  if (MODO_DEMO || jwt === 'demo') return DEMO_EVENTOS;
  const datos = await pedir('/evento-adversos?populate=medicamento&pagination[pageSize]=500', jwt);
  const lista = Array.isArray(datos?.data) ? datos.data : [];
  return lista.map((e: any) => ({
    tipo: e.tipo,
    gravedad: e.gravedad,
    fecha: e.fecha,
    medicamento: e.medicamento?.nombre ?? 'Sin medicamento',
    documentId: e.documentId,
  }));
}

export interface DatosSenal {
  evento: string;
  criterioEvans?: string;
  resultados: FilaSenal[];
}

export async function obtenerSenales(jwt: string, evento?: string): Promise<DatosSenal> {
  if (MODO_DEMO || jwt === 'demo') {
    const tipo = evento || tipoMasFrecuente(DEMO_EVENTOS);
    return { evento: tipo, resultados: calcularSenales(DEMO_EVENTOS, tipo) };
  }
  const q = evento ? '?evento=' + encodeURIComponent(evento) : '';
  const r = await pedir('/analisis/senales' + q, jwt);
  return { evento: r.evento, criterioEvans: r.criterioEvans, resultados: r.resultados ?? [] };
}

export async function obtenerTendencia(jwt: string): Promise<PuntoTendencia[]> {
  if (MODO_DEMO || jwt === 'demo') return tendenciaDe(DEMO_EVENTOS);
  return pedir('/analisis/tendencia', jwt);
}
