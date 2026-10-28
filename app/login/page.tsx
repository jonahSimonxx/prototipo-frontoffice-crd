'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const USUARIOS_RAPIDOS = [
  { etiqueta: 'Investigador', email: 'investigador@crd.cu', password: 'Invest123!' },
  { etiqueta: 'Coordinador', email: 'coordinador@crd.cu', password: 'Coord123!' },
  { etiqueta: 'Administrador', email: 'admin@crd.cu', password: 'Admin123!' },
];

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function entrar(email: string, pass: string) {
    setCargando(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: email, password: pass }),
      });
      if (!res.ok) {
        const datos = await res.json().catch(() => ({}));
        setError(datos.error ?? 'No se pudo iniciar sesión.');
        return;
      }
      router.replace('/dashboard');
      router.refresh();
    } catch {
      setError('Error de conexión con el servidor.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="login-vista">
      <div className="login-caja">
        <h1>CRD · Farmacovigilancia</h1>
        <p className="sub">Inicie sesión con su usuario institucional.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            entrar(identifier, password);
          }}
        >
          <div className="campo">
            <label htmlFor="usuario">Usuario o correo</label>
            <input
              id="usuario"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="investigador@crd.cu"
              required
            />
          </div>
          <div className="campo">
            <label htmlFor="clave">Contraseña</label>
            <input
              id="clave"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error ? (
            <p className="aviso aviso-error" role="alert">
              {error}
            </p>
          ) : null}
          <button className="boton" type="submit" disabled={cargando}>
            {cargando ? 'Ingresando…' : 'Iniciar sesión'}
          </button>
        </form>
        <div className="rapidos">
          <span>Usuarios de prueba (acceso rápido):</span>
          {USUARIOS_RAPIDOS.map((u) => (
            <button
              key={u.email}
              type="button"
              className="boton boton-secundario boton-pequeno"
              onClick={() => entrar(u.email, u.password)}
            >
              {u.etiqueta}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
