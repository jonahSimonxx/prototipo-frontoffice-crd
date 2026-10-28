'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { MEDICAMENTOS_DEMO, TIPOS_EVENTO } from '../lib/demo-data';

// Formulario de registro de eventos adversos.
// El frontoffice lo muestra según el rol (crear_evento); el backoffice
// vuelve a validar el permiso del JWT al recibir la petición.
export function EventoForm() {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [tipo, setTipo] = useState(TIPOS_EVENTO[0]);
  const [gravedad, setGravedad] = useState('leve');
  const [medicamento, setMedicamento] = useState(MEDICAMENTOS_DEMO[0]);
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [descripcion, setDescripcion] = useState('');

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setMensaje('');
    try {
      const res = await fetch('/api/eventos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descripcion,
          tipo,
          gravedad,
          fecha: new Date(fecha).toISOString(),
          medicamento,
        }),
      });
      const datos = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMensaje(datos.error ?? 'No se pudo registrar el evento.');
        return;
      }
      setMensaje(datos.demo ? 'Modo demostración: el evento no se persiste.' : 'Evento registrado correctamente.');
      setAbierto(false);
      setDescripcion('');
      router.refresh();
    } catch {
      setMensaje('Error de conexión con el servidor.');
    }
  }

  if (!abierto) {
    return (
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
        <button type="button" className="boton" onClick={() => setAbierto(true)}>
          + Registrar evento adverso
        </button>
        {mensaje ? <span className="nota">{mensaje}</span> : null}
      </div>
    );
  }

  return (
    <form onSubmit={guardar} className="tarjeta" style={{ maxWidth: 620 }}>
      <h3>Nuevo evento adverso</h3>
      <div className="malla-2">
        <div className="campo">
          <label htmlFor="tipo">Tipo de evento</label>
          <select id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            {TIPOS_EVENTO.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="campo">
          <label htmlFor="gravedad">Gravedad</label>
          <select id="gravedad" value={gravedad} onChange={(e) => setGravedad(e.target.value)}>
            <option value="leve">leve</option>
            <option value="moderada">moderada</option>
            <option value="grave">grave</option>
          </select>
        </div>
        <div className="campo">
          <label htmlFor="med">Medicamento</label>
          <select id="med" value={medicamento} onChange={(e) => setMedicamento(e.target.value)}>
            {MEDICAMENTOS_DEMO.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="campo">
          <label htmlFor="fecha">Fecha</label>
          <input id="fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
        </div>
      </div>
      <div className="campo">
        <label htmlFor="desc">Descripción</label>
        <textarea
          id="desc"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required
          placeholder="Describa el evento observado…"
        />
      </div>
      {mensaje ? <p className="aviso aviso-info">{mensaje}</p> : null}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" className="boton">
          Guardar
        </button>
        <button type="button" className="boton boton-secundario" onClick={() => setAbierto(false)}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
