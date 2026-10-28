import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CRD Farmacovigilancia — Frontoffice',
  description:
    'Prototipo frontoffice del sistema CRD de farmacovigilancia: RBAC y visualización del análisis estadístico (PRR, ROR, chi-cuadrado).',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
