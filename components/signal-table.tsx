import type { FilaSenal } from '../lib/estadistica';
import { InsigniaSenal } from './ui';

// Tabla de señales farmacológicas (tabla 2x2 + PRR, ROR, chi-cuadrado).
export function TablaSenal({ filas }: { filas: FilaSenal[] }) {
  return (
    <table className="tabla">
      <thead>
        <tr>
          <th>Medicamento</th>
          <th>a</th>
          <th>b</th>
          <th>c</th>
          <th>d</th>
          <th>PRR [IC 95%]</th>
          <th>ROR</th>
          <th>χ²</th>
          <th>Señal</th>
        </tr>
      </thead>
      <tbody>
        {filas.map((f) => (
          <tr key={f.medicamento} className={f.esSenal ? 'destacada' : ''}>
            <td>{f.medicamento}</td>
            <td>{f.a}</td>
            <td>{f.b}</td>
            <td>{f.c}</td>
            <td>{f.d}</td>
            <td>
              {f.prr === null
                ? 'revisión manual'
                : f.prr.toFixed(2) +
                  ' [' +
                  (f.prrInferior ?? 0).toFixed(2) +
                  ' – ' +
                  (f.prrSuperior ?? 0).toFixed(2) +
                  ']'}
            </td>
            <td>{f.ror === null ? '—' : f.ror.toFixed(2)}</td>
            <td>{f.chi2 === null ? '—' : f.chi2.toFixed(2)}</td>
            <td>
              <InsigniaSenal esSenal={f.esSenal} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
