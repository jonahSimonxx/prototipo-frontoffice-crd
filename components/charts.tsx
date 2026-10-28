'use client';

// Gráficas del análisis (recharts) — se renderizan en el cliente.
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const COLORES: Record<string, string> = {
  leve: '#1e9e63',
  moderada: '#e2a03f',
  grave: '#d64550',
};

export function GraficaTipos({ datos }: { datos: { tipo: string; cantidad: number }[] }) {
  return (
    <div className="grafica">
      <ResponsiveContainer>
        <BarChart data={datos} layout="vertical" margin={{ left: 20, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" allowDecimals={false} />
          <YAxis type="category" dataKey="tipo" width={140} />
          <Tooltip />
          <Bar dataKey="cantidad" fill="#2563eb" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function GraficaGravedad({ datos }: { datos: Record<string, number> }) {
  const info = Object.entries(datos).map(([nombre, valor]) => ({
    name: nombre,
    value: valor,
  }));
  return (
    <div className="grafica">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={info} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} label>
            {info.map((i) => (
              <Cell key={i.name} fill={COLORES[i.name] ?? '#94a3b8'} />
            ))}
          </Pie>
          <Legend />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function GraficaPrr({ datos }: { datos: { medicamento: string; prr: number }[] }) {
  return (
    <div className="grafica">
      <ResponsiveContainer>
        <BarChart data={datos} margin={{ bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="medicamento" angle={-15} textAnchor="end" interval={0} height={55} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <ReferenceLine y={2} stroke="#d64550" strokeDasharray="6 4" label="Umbral de Evans (PRR = 2)" />
          <Bar dataKey="prr" fill="#2563eb" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function GraficaTendencia({
  datos,
}: {
  datos: { mes: string; leve: number; moderada: number; grave: number }[];
}) {
  return (
    <div className="grafica" style={{ height: 360 }}>
      <ResponsiveContainer>
        <LineChart data={datos} margin={{ bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="leve" stroke={COLORES.leve} strokeWidth={2} />
          <Line type="monotone" dataKey="moderada" stroke={COLORES.moderada} strokeWidth={2} />
          <Line type="monotone" dataKey="grave" stroke={COLORES.grave} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
