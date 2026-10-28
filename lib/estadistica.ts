/**
 * Motor de análisis estadístico (minería de datos) — frontoffice.
 * Misma formulación que el backoffice (Strapi) para que los resultados
 * sean verificables en ambos prototipos:
 *   - PRR con IC 95%   - ROR con IC 95%
 *   - Chi-cuadrado con corrección de Yates
 *   - Señal farmacológica por criterios de Evans (PRR>=2, chi2>=4, a>=3)
 */

export type Gravedad = 'leve' | 'moderada' | 'grave';

export interface EventoRegistro {
  tipo: string;
  gravedad: Gravedad;
  fecha: string;
  medicamento: string;
  documentId?: string;
}

export interface FilaSenal {
  medicamento: string;
  evento: string;
  a: number;
  b: number;
  c: number;
  d: number;
  prr: number | null;
  prrInferior: number | null;
  prrSuperior: number | null;
  ror: number | null;
  rorInferior: number | null;
  rorSuperior: number | null;
  chi2: number | null;
  esSenal: boolean;
  revisionManual?: boolean;
}

export interface PuntoTendencia {
  mes: string;
  leve: number;
  moderada: number;
  grave: number;
  total: number;
}

export interface ResumenLocal {
  total: number;
  graves: number;
  pctGraves: number;
  porGravedad: Record<string, number>;
  porTipo: { tipo: string; cantidad: number }[];
  medicamentos: number;
}

const Z_95 = 1.96;

function icPrr(a: number, b: number, c: number, d: number) {
  const se = Math.sqrt(1 / a - 1 / (a + b) + 1 / c - 1 / (c + d));
  const prr = (a / (a + b)) / (c / (c + d));
  return {
    prr,
    inferior: Math.exp(Math.log(prr) - Z_95 * se),
    superior: Math.exp(Math.log(prr) + Z_95 * se),
  };
}

function icRor(a: number, b: number, c: number, d: number) {
  const se = Math.sqrt(1 / a + 1 / b + 1 / c + 1 / d);
  const ror = (a * d) / (b * c);
  return {
    ror,
    inferior: Math.exp(Math.log(ror) - Z_95 * se),
    superior: Math.exp(Math.log(ror) + Z_95 * se),
  };
}

function chiCuadradoYates(a: number, b: number, c: number, d: number): number {
  const n = a + b + c + d;
  const numerador = Math.pow(Math.abs(a * d - b * c) - n / 2, 2) * n;
  const denominador = (a + b) * (c + d) * (a + c) * (b + d);
  return denominador === 0 ? 0 : numerador / denominador;
}

function criteriosEvans(prr: number, chi2: number, casos: number): boolean {
  return prr >= 2 && chi2 >= 4 && casos >= 3;
}

function redondear(x: number | null): number | null {
  return x === null ? null : Math.round(x * 100) / 100;
}

/** Tabla 2x2 por medicamento frente a un evento de interés. */
export function calcularSenales(eventos: EventoRegistro[], tipoObjetivo: string): FilaSenal[] {
  const conteos: Record<string, { total: number; objetivo: number }> = {};
  let objetivoGlobal = 0;

  for (const e of eventos) {
    conteos[e.medicamento] = conteos[e.medicamento] ?? { total: 0, objetivo: 0 };
    conteos[e.medicamento].total += 1;
    if (e.tipo === tipoObjetivo) {
      conteos[e.medicamento].objetivo += 1;
      objetivoGlobal += 1;
    }
  }

  const totalGlobal = eventos.length;
  const resultados: FilaSenal[] = [];

  for (const [medicamento, c] of Object.entries(conteos)) {
    const a = c.objetivo;
    const b = c.total - a;
    const cc = objetivoGlobal - a;
    const d = totalGlobal - objetivoGlobal - b;

    if (a + b === 0 || cc + d === 0) continue;

    const fila: FilaSenal = {
      medicamento, evento: tipoObjetivo, a, b, c: cc, d,
      prr: null, prrInferior: null, prrSuperior: null,
      ror: null, rorInferior: null, rorSuperior: null,
      chi2: null, esSenal: false, revisionManual: false,
    };

    if (cc === 0) {
      fila.revisionManual = true;
    } else {
      const prr = icPrr(a, b, cc, d);
      const ror = icRor(a, b, cc, d);
      const chi2 = chiCuadradoYates(a, b, cc, d);
      fila.prr = redondear(prr.prr);
      fila.prrInferior = redondear(prr.inferior);
      fila.prrSuperior = redondear(prr.superior);
      fila.ror = redondear(ror.ror);
      fila.rorInferior = redondear(ror.inferior);
      fila.rorSuperior = redondear(ror.superior);
      fila.chi2 = redondear(chi2);
      fila.esSenal = criteriosEvans(prr.prr, chi2, a);
    }
    resultados.push(fila);
  }

  resultados.sort((x, y) => {
    if (x.esSenal !== y.esSenal) return x.esSenal ? -1 : 1;
    return (y.prr ?? -1) - (x.prr ?? -1);
  });
  return resultados;
}

export function tipoMasFrecuente(eventos: EventoRegistro[]): string {
  const conteo: Record<string, number> = {};
  for (const e of eventos) conteo[e.tipo] = (conteo[e.tipo] ?? 0) + 1;
  return Object.entries(conteo).sort((x, y) => y[1] - x[1])[0][0];
}

/** Recorre todos los tipos de evento y devuelve las señales activas. */
export function senalesActivas(eventos: EventoRegistro[]): { tipo: string; fila: FilaSenal }[] {
  const tipos = Array.from(new Set(eventos.map((e) => e.tipo)));
  const activas: { tipo: string; fila: FilaSenal }[] = [];
  for (const tipo of tipos) {
    for (const fila of calcularSenales(eventos, tipo)) {
      if (fila.esSenal) activas.push({ tipo, fila });
    }
  }
  return activas.sort((x, y) => (y.fila.prr ?? 0) - (x.fila.prr ?? 0));
}

export function resumenDe(eventos: EventoRegistro[]): ResumenLocal {
  const porGravedad: Record<string, number> = { leve: 0, moderada: 0, grave: 0 };
  const porTipo: Record<string, number> = {};
  const meds = new Set<string>();

  for (const e of eventos) {
    porGravedad[e.gravedad] += 1;
    porTipo[e.tipo] = (porTipo[e.tipo] ?? 0) + 1;
    meds.add(e.medicamento);
  }

  const total = eventos.length;
  return {
    total,
    graves: porGravedad.grave,
    pctGraves: total ? Math.round((100 * porGravedad.grave) / total * 10) / 10 : 0,
    porGravedad,
    porTipo: Object.entries(porTipo)
      .map(([tipo, cantidad]) => ({ tipo, cantidad }))
      .sort((x, y) => y.cantidad - x.cantidad),
    medicamentos: meds.size,
  };
}

export function tendenciaDe(eventos: EventoRegistro[]): PuntoTendencia[] {
  const serie: Record<string, PuntoTendencia> = {};
  for (const e of eventos) {
    const mes = String(e.fecha ?? '').slice(0, 7);
    serie[mes] = serie[mes] ?? { mes, leve: 0, moderada: 0, grave: 0, total: 0 };
    serie[mes][e.gravedad] += 1;
    serie[mes].total += 1;
  }
  return Object.values(serie).sort((x, y) => x.mes.localeCompare(y.mes));
}
