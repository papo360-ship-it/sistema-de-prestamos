# Sistema de Prestamos

Aplicacion web para gestionar clientes, prestamos, cuotas, cobros, mora, reportes, configuracion y usuarios con roles de administrador y cobrador.

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- React Router
- Supabase Auth + Database
- TanStack Table
- Recharts

## Ejecutar

```bash
npm install
npm run dev
```

Copia `.env.example` a `.env` y agrega tus credenciales de Supabase si usaras backend real:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

La app tambien funciona con datos demo en `localStorage` cuando Supabase no esta configurado.

## Credenciales demo

- Administrador: `admin@prestamos.com` / `admin123`
- Cobrador: `cobrador@prestamos.com` / `cobrador123`

## Base de datos Supabase

1. Crea un proyecto en Supabase.
2. Ejecuta `supabase/schema.sql` en SQL Editor.
3. Crea dos usuarios desde Supabase Auth.
4. Reemplaza los UUID de `supabase/seed.sql` por los IDs reales de esos usuarios.
5. Ejecuta `supabase/seed.sql`.
6. Copia Project URL y anon public key a `.env`.

## Integracion con Supabase

El proyecto detecta Supabase automaticamente si existen estas variables:

```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

Cuando esas variables estan presentes:

- Login usa Supabase Auth.
- El perfil del usuario se lee desde `profiles`.
- Clientes, prestamos, cuotas, pagos, configuracion y reportes se leen desde Supabase.
- El cobrador puede registrar pagos y actualizar cuotas/saldos visibles por RLS.
- El administrador conserva acceso completo.

Si las variables no existen, la app entra en modo `Demo local` con `localStorage`.

Para crear usuarios reales:

1. Crea el usuario en Supabase Dashboard, Authentication, Users.
2. Copia su UUID.
3. Inserta o actualiza su fila en `profiles` con ese UUID y el rol `admin` o `collector`.

Ejemplo:

```sql
insert into public.profiles (id, full_name, email, role, active)
values ('UUID_DEL_USUARIO', 'Nombre Usuario', 'correo@dominio.com', 'collector', true);
```

## Modulos incluidos

- Login con validacion, mostrar/ocultar contrasena y mensajes de error.
- Dashboard financiero con capital, prestado, recaudado, ganancia, disponible, clientes, prestamos, cuotas y mora.
- CRUD de clientes con detalle e historial.
- Prestamos con calculo automatico de total, cuota, ganancia, fecha final y cronograma.
- Simulador de prestamos.
- Cuotas y cobros con pagos completos, parciales y abonos a capital.
- Mora automatica configurable fija o porcentual.
- Reportes por rango de fechas.
- Configuracion global del negocio.
- Usuarios y control por roles.

## Roles

- Administrador: acceso completo, configuracion, usuarios, prestamos, clientes, cobros y reportes.
- Cobrador: consulta clientes visibles/asignados, prestamos activos, cuotas pendientes y registra cobros.

## Estructura

```text
src/
  components/      Componentes UI, layout y dashboard
  context/         Auth y estado de datos
  data/            Seed local demo
  hooks/           Resumen financiero
  lib/             Supabase, utilidades y calculos financieros
  pages/           Pantallas principales
  services/        Store local y operaciones de negocio
  styles/          Tailwind global
  types/           Tipos TypeScript
supabase/
  schema.sql
  seed.sql
```

## Nota de integracion

La base funcional esta preparada para Supabase y actualmente usa una capa local realista para permitir navegar y probar la logica sin bloquearse por credenciales. Para produccion, conecta los metodos de `src/services/store.ts` a consultas Supabase usando las mismas tablas del SQL.
