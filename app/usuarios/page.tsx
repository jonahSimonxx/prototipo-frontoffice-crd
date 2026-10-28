import { redirect } from 'next/navigation';
import { getSesion } from '../../lib/sesion';
import { puede, ROLES, SECCIONES, type Permiso, type Rol } from '../../lib/rbac';
import { Nav } from '../../components/nav';
import { Tarjeta } from '../../components/ui';

const USUARIOS: { usuario: string; correo: string; rol: Rol }[] = [
  { usuario: 'investigador', correo: 'investigador@crd.cu', rol: 'investigador' },
  { usuario: 'coordinador', correo: 'coordinador@crd.cu', rol: 'coordinador' },
  { usuario: 'admin', correo: 'admin@crd.cu', rol: 'administrador' },
];

const FILAS_ADICIONALES: { etiqueta: string; permiso: Permiso }[] = [
  { etiqueta: 'Registrar eventos', permiso: 'crear_evento' },
  { etiqueta: 'Eliminar registros', permiso: 'eliminar_evento' },
];

export default async function UsuariosPage() {
  const sesion = await getSesion();
  if (!sesion) redirect('/login');

  if (!puede(sesion.rol, 'gestionar_usuarios')) {
    return (
      <>
        <Nav sesion={sesion} />
        <main className="contenedor">
          <div className="aviso aviso-error" role="alert">
            Su rol no tiene permiso para la gestión de usuarios (403).
          </div>
        </main>
      </>
    );
  }

  const roles = Object.keys(ROLES) as Rol[];

  return (
    <>
      <Nav sesion={sesion} />
      <main className="contenedor">
        <h1>Usuarios y roles</h1>
        <p className="subtitulo">Administración del control de acceso por roles (RBAC) del sistema CRD.</p>

        <Tarjeta titulo="Matriz de permisos por rol">
          <table className="tabla">
            <thead>
              <tr>
                <th>Sección / permiso</th>
                {roles.map((r) => (
                  <th key={r}>{ROLES[r]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SECCIONES.map((s) => (
                <tr key={s.ruta}>
                  <td>
                    {s.etiqueta} <span className="nota">({s.permiso})</span>
                  </td>
                  {roles.map((r) => (
                    <td key={r}>{puede(r, s.permiso) ? '✔' : '✖'}</td>
                  ))}
                </tr>
              ))}
              {FILAS_ADICIONALES.map((f) => (
                <tr key={f.permiso}>
                  <td>
                    {f.etiqueta} <span className="nota">({f.permiso})</span>
                  </td>
                  {roles.map((r) => (
                    <td key={r}>{puede(r, f.permiso) ? '✔' : '✖'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Tarjeta>

        <Tarjeta titulo="Usuarios del sistema (creados por el bootstrap del backoffice)">
          <table className="tabla">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Correo</th>
                <th>Rol</th>
              </tr>
            </thead>
            <tbody>
              {USUARIOS.map((u) => (
                <tr key={u.correo}>
                  <td>{u.usuario}</td>
                  <td>{u.correo}</td>
                  <td>
                    <span className={'rol rol-' + u.rol}>{ROLES[u.rol]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="nota" style={{ marginTop: 10 }}>
            La gestión completa de usuarios (crear, editar, reasignar roles) se realiza en el
            backoffice: panel de administración de Strapi → Content Manager → Users.
          </p>
        </Tarjeta>
      </main>
    </>
  );
}
