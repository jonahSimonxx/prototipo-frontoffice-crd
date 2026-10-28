import type { EventoRegistro } from './estadistica';

// Mismos datos de demostración que siembra el backoffice (prototipo-backoffice-crd):
// 75 eventos adversos, 5 medicamentos y una señal intencional de
// FármacoX 200 / Hepatotoxicidad que el análisis debe detectar.

export const TIPOS_EVENTO = [
  'Hepatotoxicidad',
  'Reacción cutánea',
  'Trastorno gastrointestinal',
  'Cefalea',
  'Reacción anafiláctica',
];

export const MEDICAMENTOS_DEMO = [
  'Paracetamol 500',
  'Ibuprofeno 400',
  'Amoxicilina 500',
  'Metformina 850',
  'FármacoX 200',
];

// [medicamento, tipo de evento, cantidad, gravedades por unidad]
const DISTRIBUCION: Array<[string, string, number, string[]]> = [
  ['FármacoX 200', 'Hepatotoxicidad', 6, ['grave', 'grave', 'grave', 'grave', 'grave', 'moderada']],
  ['FármacoX 200', 'Reacción cutánea', 2, ['leve', 'leve']],
  ['FármacoX 200', 'Cefalea', 2, ['leve', 'leve']],
  ['Paracetamol 500', 'Hepatotoxicidad', 2, ['moderada', 'moderada']],
  ['Paracetamol 500', 'Trastorno gastrointestinal', 8, Array(8).fill('leve') as string[]],
  ['Paracetamol 500', 'Cefalea', 7, Array(7).fill('leve') as string[]],
  ['Paracetamol 500', 'Reacción cutánea', 4, Array(4).fill('leve') as string[]],
  ['Paracetamol 500', 'Reacción anafiláctica', 1, ['grave']],
  ['Ibuprofeno 400', 'Hepatotoxicidad', 1, ['moderada']],
  ['Ibuprofeno 400', 'Trastorno gastrointestinal', 7, Array(7).fill('leve') as string[]],
  ['Ibuprofeno 400', 'Reacción cutánea', 5, Array(5).fill('leve') as string[]],
  ['Ibuprofeno 400', 'Cefalea', 4, Array(4).fill('leve') as string[]],
  ['Ibuprofeno 400', 'Reacción anafiláctica', 1, ['grave']],
  ['Amoxicilina 500', 'Reacción cutánea', 5, Array(5).fill('leve') as string[]],
  ['Amoxicilina 500', 'Trastorno gastrointestinal', 4, Array(4).fill('leve') as string[]],
  ['Amoxicilina 500', 'Cefalea', 3, Array(3).fill('leve') as string[]],
  ['Amoxicilina 500', 'Reacción anafiláctica', 3, ['moderada', 'moderada', 'moderada']],
  ['Metformina 850', 'Trastorno gastrointestinal', 6, Array(6).fill('leve') as string[]],
  ['Metformina 850', 'Cefalea', 3, Array(3).fill('leve') as string[]],
  ['Metformina 850', 'Reacción cutánea', 1, ['leve']],
];

export function generarEventosDemo(): EventoRegistro[] {
  const eventos: EventoRegistro[] = [];
  let i = 0;
  for (const [med, tipo, cantidad, gravedades] of DISTRIBUCION) {
    for (let k = 0; k < cantidad; k++) {
      eventos.push({
        tipo,
        gravedad: (gravedades[k] ?? 'leve') as EventoRegistro['gravedad'],
        fecha: new Date(Date.now() - i * 9 * 86400000).toISOString(),
        medicamento: med,
      });
      i += 1;
    }
  }
  return eventos;
}

export const DEMO_EVENTOS = generarEventosDemo();
