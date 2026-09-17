# URABA-PAIS - Backend (prototipo)

Backend Node.js + Express + Firestore para el prototipo de URABA-PAIS. Sigue el
flujo: Registro -> Vinculacion -> Atencion/Ayuda -> Seguimiento -> Reporte.

## Requisitos

- Node.js 18+
- Autenticacion con Application Default Credentials ya configurada en esta maquina:

  ```
  gcloud auth application-default login
  ```

  No se usa `serviceAccountKey.json`.

## Instalacion

```
npm install
```

## Variable de entorno

El proyecto de Google Cloud/Firebase se toma de una de estas variables (define
al menos una antes de arrancar):

```
# PowerShell
$env:GOOGLE_CLOUD_PROJECT = "tu-proyecto-id"
# o
$env:FIREBASE_PROJECT_ID = "tu-proyecto-id"
```

Opcional: `PORT` (por defecto `3000`).

## Correr el servidor

```
npm start
```

El servidor queda disponible en `http://localhost:3000`. La pagina de prueba
esta en `http://localhost:3000/` (formularios simples, sin diseno).

## Autenticacion

Los endpoints de escritura (POST/PUT) exigen un ID token de Firebase
Authentication valido:

```
Authorization: Bearer <ID_TOKEN>
```

Los indicadores agregados (`GET /api/reportes/indicadores`) ademas exigen que
el documento `usuarios/{uid}` tenga `rol: "administrador"`.

**El frontend de prueba (`public/index.html`) obtiene y renueva el token
automaticamente** usando el SDK cliente de Firebase Auth (login con
email/password) — nadie copia ni pega tokens a mano. Al iniciar sesion o
registrarse:

1. El navegador llama a `firebase.auth().signInWithEmailAndPassword(...)` y
   Firebase le entrega un ID token que se renueva solo mientras la sesion
   siga activa (`user.getIdToken()` en cada llamada).
2. El frontend llama a `POST /api/usuarios/registrar`, que crea
   `usuarios/{uid}` con `rol: "encuestador"` si el usuario es nuevo (nunca
   se auto-asigna `"administrador"`: ese rol solo se otorga a mano desde la
   consola de Firestore, editando el documento `usuarios/{uid}` del usuario
   correspondiente, por seguridad).
3. El frontend llama a `GET /api/usuarios/me` para saber su rol y mostrar u
   ocultar la seccion de indicadores segun corresponda (RF-19).

Para pruebas por terminal (curl/Postman) sin abrir el navegador, sigue
existiendo el script que genera un token via linea de comandos:

```
$env:FIREBASE_WEB_API_KEY = "tu-web-api-key"   # Firebase Console > Configuracion del proyecto > General > apiKey
npm run token administrador
# o: npm run token encuestador
```

## Identificadores de un beneficiario

Un beneficiario tiene tres identificadores con proposito distinto — no se
deben confundir:

- **`numero_documento` + `tipo_documento`**: como el encuestador identifica a
  la persona en campo. Es lo unico que se escribe a mano, y es obligatorio
  buscarlo antes de crear (RF-01/RF-02).
- **`id` del documento de Firestore** (ej. `Mm5ADuY1GXFGBEDZ4A4h`): id tecnico
  interno usado en las URLs de la API. Nunca se le pide al usuario que lo
  escriba: el frontend lo guarda en memoria despues de buscar o crear, y lo
  reutiliza solo para las llamadas siguientes (familiares, participaciones,
  atenciones, seguimientos, ficha).
- **`codigo_interno`** (ej. `BEN-4F91A2`, RF-03): codigo legible generado
  automaticamente al crear el beneficiario, unico e inmutable, que se le
  puede mostrar al encuestador como referencia del caso sin exponer el id
  tecnico de la base de datos.

## Estructura

```
config/firebase.js        inicializacion de firebase-admin (ADC)
middleware/auth.js         requireAuth, requireAdmin
controllers/                logica por modulo
routes/                     rutas Express por modulo
public/index.html           frontend minimo de prueba
server.js                   punto de entrada
```

## Ejemplos con curl

Reemplaza `$TOKEN` por un ID token valido y `$ID` por un id de beneficiario.

### Modulo 1 - Beneficiarios y familias

Buscar antes de crear (obligatorio):

```
curl "http://localhost:3000/api/beneficiarios/buscar?tipo_documento=CC&numero_documento=123456"
```

Crear beneficiario:

```
curl -X POST http://localhost:3000/api/beneficiarios \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo_documento": "CC",
    "numero_documento": "123456",
    "nombres": "Maria Perez",
    "sexo": "F",
    "edad": 34,
    "municipio": "Apartado",
    "zona": "Urbana",
    "nacionalidad": "Colombia",
    "tipo_poblacion": "Desplazada",
    "autorizacion_datos": true,
    "fecha_autorizacion": "2026-01-10"
  }'
```

Obtener beneficiario:

```
curl http://localhost:3000/api/beneficiarios/$ID
```

Actualizar beneficiario:

```
curl -X PUT http://localhost:3000/api/beneficiarios/$ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"municipio": "Turbo"}'
```

Agregar familiar:

```
curl -X POST http://localhost:3000/api/beneficiarios/$ID/familiares \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nombres": "Juan Perez", "parentesco": "Hijo", "fecha_nacimiento": "2015-04-02"}'
```

Listar familiares:

```
curl http://localhost:3000/api/beneficiarios/$ID/familiares
```

### Modulo 2 - Programas y participacion

Listar programas:

```
curl http://localhost:3000/api/programas
```

Crear programa:

```
curl -X POST http://localhost:3000/api/programas \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Apoyo alimentario", "linea_trabajo": "Seguridad alimentaria"}'
```

Vincular beneficiario a programa:

```
curl -X POST http://localhost:3000/api/beneficiarios/$ID/participaciones \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"programa_id": "PROGRAMA_ID", "organizacion": "ONG X", "fecha_vinculacion": "2026-02-01", "estado": "inscrito"}'
```

Actualizar estado de participacion:

```
curl -X PUT http://localhost:3000/api/beneficiarios/$ID/participaciones/PARTICIPACION_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"estado": "en_proceso"}'
```

### Modulo 3 - Atencion y seguimiento

Registrar atencion/ayuda (algo YA entregado o realizado):

```
curl -X POST http://localhost:3000/api/beneficiarios/$ID/atenciones \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tipo": "Ayuda", "fecha": "2026-03-05", "descripcion": "Kit de higiene", "responsable": "Encuestador 1", "resultado": "Entregado"}'
```

Listar atenciones:

```
curl http://localhost:3000/api/beneficiarios/$ID/atenciones
```

Registrar seguimiento (como va el caso):

```
curl -X POST http://localhost:3000/api/beneficiarios/$ID/seguimientos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fecha": "2026-03-10", "avance_novedad": "Familia reubicada", "observacion": "Requiere documentos", "accion_pendiente": "Tramitar registro civil", "proximo_contacto": "2026-03-20"}'
```

Listar seguimientos:

```
curl http://localhost:3000/api/beneficiarios/$ID/seguimientos
```

### Modulo 4 - Consultas y reportes

Ficha consolidada:

```
curl http://localhost:3000/api/beneficiarios/$ID/ficha
```

Indicadores agregados (solo administrador):

```
curl http://localhost:3000/api/reportes/indicadores \
  -H "Authorization: Bearer $TOKEN"
```

### Usuarios y roles

Auto-provisionar el rol del usuario autenticado (idempotente, siempre asigna
`encuestador` la primera vez):

```
curl -X POST http://localhost:3000/api/usuarios/registrar \
  -H "Authorization: Bearer $TOKEN"
```

Consultar el rol propio:

```
curl http://localhost:3000/api/usuarios/me \
  -H "Authorization: Bearer $TOKEN"
```

## Notas

- Ningun endpoint de indicadores devuelve datos personales identificables,
  solo conteos agregados.
- Los errores nunca exponen stack traces al cliente.
