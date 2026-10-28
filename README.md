# Prototipo Frontoffice — CRD de Farmacovigilancia (Next.js 16)

Prototipo frontoffice **generado con IA** para el sistema CRD de farmacovigilancia. Implementa las tareas del plan individual (Anexo A):

1. **Control de acceso por roles (RBAC):** login con roles de prueba, middleware de rutas protegidas por rol, navegación y botones condicionados por permisos, sesión en cookie httpOnly.
2. **Análisis estadístico (minería de datos) visualizado:** señalización farmacológica con PRR, ROR, chi-cuadrado de Yates y criterios de Evans; tendencia temporal por gravedad.

> Prototipo con fines educativos. Generado con asistencia de IA (agente Vibe, modelo GLM — Mistral AI) a partir del dominio del sistema CRD real.

## Dos modos de ejecución

- **Modo Strapi (recomendado para la demostración completa):** configura STRAPI_URL y usa el backoffice [prototipo-backoffice-crd](https://github.com/jonahSimonxx/prototipo-backoffice-crd).
- **Modo demostración:** sin STRAPI_URL, el frontoffice arranca con datos embebidos (mismos números que el backoffice) — ideal para enseñar el RBAC y el análisis sin instalar nada más. No se persisten cambios.

## Instalación y arranque

```bash
git clone https://github.com/jonahSimonxx/prototipo-frontoffice-crd.git
cd prototipo-frontoffice-crd
npm install

# Modo demostración (sin backend):
npm run dev

# Modo Strapi: crear .env con la URL del backoffice:
echo "STRAPI_URL=http://localhost:1337" > .env
npm run dev
```

Abrir http://localhost:3000

## Usuarios de prueba

| Correo | Contraseña | Rol | Qué ve en el frontoffice |
| --- | --- | --- | --- |
| investigador@crd.cu | Invest123! | Investigador | Panel y eventos adversos. Registra eventos. **No** ve Señalización ni Tendencia. |
| coordinador@crd.cu | Coord123! | Coordinador | Añade Señalización y Tendencia. **No** ve Usuarios y roles ni el botón Eliminar. |
| admin@crd.cu | Admin123! | Administrador | Acceso total: todas las secciones, eliminar eventos y matriz de permisos. |

Los mismos usuarios crea automáticamente el backoffice (prototipo-backoffice-crd).

## Secciones

| Ruta | Sección | Roles con acceso |
| --- | --- | --- |
| /dashboard | Panel general con estadísticas y aviso de señal | Todos |
| /eventos | Listado y registro de eventos adversos | Todos (eliminar: Administrador) |
| /senalizacion | Tabla 2×2, PRR, ROR, χ² y señal (Evans) | Coordinador y Administrador |
| /tendencia | Serie temporal mensual por gravedad | Coordinador y Administrador |
| /usuarios | Matriz de permisos RBAC y usuarios | Administrador |

## Cómo se aplica el RBAC (defensa en profundidad)

1. **Middleware de rutas (Next.js):** sin sesión redirige a /login; con rol insuficiente redirige al panel con aviso 403.
2. **UI condicionada:** la navegación y los botones se filtran con la misma matriz de permisos (lib/rbac.ts).
3. **Backend (Strapi):** aunque alguien llame a la API directamente, el JWT de un rol sin permiso recibe 403 (política es-analista y solo-admin del backoffice).

## Estructura del proyecto

```
app/
  login/               Login con acceso rápido por rol
  dashboard/           Panel general (estadísticas, señal activa)
  eventos/             Listado + registro de eventos adversos
  senalizacion/        Señalización farmacológica (PRR, ROR, χ², Evans)
  tendencia/           Serie temporal mensual
  usuarios/            Matriz de permisos RBAC (solo Administrador)
  api/
    auth/              Login/logout contra Strapi (o modo demo)
    eventos/           Proxy de creación/eliminación con el JWT en cookie
components/            Navegación, gráficas (recharts), tabla de señales, formularios
lib/
  rbac.ts              Matriz de permisos por rol
  sesion.ts            Cookie httpOnly de sesión
  estadistica.ts       Motor estadístico (misma formulación que el backoffice)
  demo-data.ts         Datos embebidos del modo demostración
  strapi.ts            Cliente de la API del backoffice
middleware.ts          Rutas protegidas por rol
```

## Prueba rápida del RBAC (guion de demostración)

1. Entre como **Investigador**: note que no existen las secciones Señalización ni Tendencia.
2. Entre como **Coordinador**: vea Señalización → Hepatotoxicidad: **FármacoX 200 con PRR 13,0 [3,9–43,8], señal activa** (criterios de Evans).
3. Entre como **Administrador**: vea Usuarios y roles con la matriz completa; en Eventos aparece el botón Eliminar.
4. Fuerce la URL /senalizacion con sesión de Investigador: el middleware lo devuelve al panel con aviso de 403.

---

Jonathan Simón — Práctica Profesional y Tesis (sistema CRD de farmacovigilancia).
