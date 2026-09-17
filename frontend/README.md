# URABA-PAIS - Frontend (prototipo)

Frontend en React + TypeScript + Vite para el prototipo de URABA-PAIS. Consume
la API del backend (Express + Firestore) que vive en la carpeta raiz del
repositorio — este proyecto no la modifica.

## Requisitos

- Node.js 18+
- El backend corriendo (ver `../README.md`), normalmente en `http://localhost:3000`.
- Un proyecto de Firebase con Authentication (Email/Password) habilitado.

## Instalacion

```
npm install
```

## Variables de entorno

Copia `.env.example` a `.env` y completa los valores:

```
VITE_API_BASE_URL=http://localhost:3000/api

VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
```

Estos valores del SDK cliente de Firebase (`apiKey`, `authDomain`, `projectId`)
se consiguen en Firebase Console -> Configuracion del proyecto -> General ->
"Tus apps" -> SDK setup and configuration. No son secretos: es lo esperado
que viajen con el frontend.

## Correr en desarrollo

```
npm run dev
```

Se sirve en `http://localhost:5173`.

## Build de produccion

```
npm run build
npm run preview
```

## Autenticacion y roles

- Login/registro con correo y contrasena via Firebase Authentication
  (`src/auth/AuthContext.tsx`). El SDK obtiene y renueva el ID token
  automaticamente; nunca se maneja el token a mano.
- Al iniciar sesion, el frontend llama a `POST /api/usuarios/registrar`
  (auto-provisiona el rol `encuestador` la primera vez) y luego a
  `GET /api/usuarios/me` para saber el rol actual.
- El rol `administrador` solo se otorga editando a mano el documento
  `usuarios/{uid}` en la consola de Firestore — nunca desde la app.
- `AdminRoute` bloquea `/indicadores` para cualquier rol distinto de
  `administrador`, y el enlace se oculta del menu para encuestadores.

## Estructura (una carpeta por modulo)

```
src/
  auth/                 Login, contexto de sesion, rutas protegidas
  components/            Layout (encabezado + nav por rol), estados de carga/error
  lib/                    Cliente Firebase y cliente API compartido
  modules/
    beneficiarios/        Modulo 1: buscar/crear, familiares
    participacion/        Modulo 2: vincular a programas, actualizar estado
    atencionSeguimiento/  Modulo 3: atencion/ayuda y seguimiento (formularios separados)
    reportes/             Modulo 4: ficha consolidada e indicadores agregados
```

## Rutas

| Ruta | Modulo | Acceso |
|---|---|---|
| `/login` | - | publico |
| `/beneficiarios` | 1 | autenticado |
| `/beneficiarios/:id` | 4 (ficha) | autenticado |
| `/beneficiarios/:id/participacion` | 2 | autenticado |
| `/beneficiarios/:id/seguimiento` | 3 | autenticado |
| `/indicadores` | 4 (reportes) | solo administrador |

## Identificadores de un beneficiario

La app nunca pide escribir a mano el id tecnico de Firestore. El flujo es
siempre: buscar por documento (o registrar) -> la app guarda el id en la URL
(`/beneficiarios/:id`) y lo reutiliza en los enlaces internos. El
`codigo_interno` (ej. `BEN-4F91A2`) se muestra en la ficha como referencia
legible del caso, distinto del documento de identidad y del id tecnico.
