import Link from 'next/link';
import { puede, ROLES, SECCIONES, type Sesion } from '../lib/rbac';
import { LogoutButton } from './logout-button';

// Navegación condicionada por rol (RBAC): solo se muestran las secciones
// que el rol del usuario tiene permitidas en la matriz de permisos.
export function Nav({ sesion }: { sesion: Sesion }) {
  const visibles = SECCIONES.filter((s) => puede(sesion.rol, s.permiso));
  return (
    <header className="topbar">
      <div className="marca">CRD · Farmacovigilancia</div>
      <nav className="nav-links" aria-label="Secciones disponibles para su rol">
        {visibles.map((s) => (
          <Link key={s.ruta} href={s.ruta}>
            {s.etiqueta}
          </Link>
        ))}
      </nav>
      <div className="sesion">
        <span className={'rol rol-' + sesion.rol}>{ROLES[sesion.rol]}</span>
        <span>{sesion.usuario}</span>
        <LogoutButton />
      </div>
    </header>
  );
}
