// Control de acceso por roles (RBAC) — frontoffice.
// La misma matriz se aplica en el middleware de rutas, en la navegación
// y en los botones de acción. Coincide con la matriz del backoffice.

export type Rol = 'administrador' | 'coordinador' | 'investigador';

export interface Sesion {
  usuario: string;
  rol: Rol;
  jwt: string;
}

export const ROLES: Record<Rol, string> = {
  administrador: 'Administrador',
  coordinador: 'Coordinador',
  investigador: 'Investigador',
};

export type Permiso =
  | 'ver_dashboard'
  | 'ver_eventos'
  | 'crear_evento'
  | 'eliminar_evento'
  | 'ver_analisis'
  | 'ver_tendencia'
  | 'gestionar_usuarios';

// Matriz de permisos por rol (igual que la aplicada en el bootstrap de Strapi).
export const PERMISOS: Record<Rol, Permiso[]> = {
  administrador: [
    'ver_dashboard', 'ver_eventos', 'crear_evento', 'eliminar_evento',
    'ver_analisis', 'ver_tendencia', 'gestionar_usuarios',
  ],
  coordinador: ['ver_dashboard', 'ver_eventos', 'crear_evento', 'ver_analisis', 'ver_tendencia'],
  investigador: ['ver_dashboard', 'ver_eventos', 'crear_evento'],
};

export const SECCIONES: { ruta: string; etiqueta: string; permiso: Permiso }[] = [
  { ruta: '/dashboard', etiqueta: 'Panel', permiso: 'ver_dashboard' },
  { ruta: '/eventos', etiqueta: 'Eventos adversos', permiso: 'ver_eventos' },
  { ruta: '/senalizacion', etiqueta: 'Señalización', permiso: 'ver_analisis' },
  { ruta: '/tendencia', etiqueta: 'Tendencia', permiso: 'ver_tendencia' },
  { ruta: '/usuarios', etiqueta: 'Usuarios y roles', permiso: 'gestionar_usuarios' },
];

export function puede(rol: Rol, permiso: Permiso): boolean {
  return (PERMISOS[rol] ?? []).includes(permiso);
}
