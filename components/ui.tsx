// Componentes de presentación compartidos (renderizados en el servidor).
export function Tarjeta({ titulo, children }: { titulo?: string; children: React.ReactNode }) {
  return (
    <section className="tarjeta">
      {titulo ? <h3>{titulo}</h3> : null}
      {children}
    </section>
  );
}

export function StatCard({
  titulo,
  valor,
  resaltada,
}: {
  titulo: string;
  valor: string | number;
  resaltada?: boolean;
}) {
  return (
    <div className={'estadistica' + (resaltada ? ' resaltada' : '')}>
      <div className="valor">{valor}</div>
      <div className="titulo">{titulo}</div>
    </div>
  );
}

export function InsigniaGravedad({ gravedad }: { gravedad: string }) {
  return <span className={'insignia insignia-' + gravedad}>{gravedad}</span>;
}

export function InsigniaSenal({ esSenal }: { esSenal: boolean }) {
  return esSenal ? (
    <span className="insignia insignia-senal">Señal</span>
  ) : (
    <span className="insignia insignia-ok">Sin señal</span>
  );
}
