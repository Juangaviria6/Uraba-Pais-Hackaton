// Genera un ID token de Firebase Auth para pruebas, sin necesidad de un
// frontend de login. Crea (o reutiliza) un usuario de prueba, le asigna un
// rol en usuarios/{uid}, y lo intercambia por un ID token via la API REST
// de Identity Toolkit.
//
// Uso:
//   $env:FIREBASE_WEB_API_KEY = "tu-web-api-key"
//   node scripts/generar-token.js encuestador
//   node scripts/generar-token.js administrador
//
// El Web API key NO es secreto (es el mismo que va en el frontend). Se
// consigue en: Firebase Console -> Configuracion del proyecto -> General ->
// "Tus apps" -> SDK setup and configuration -> apiKey.

const { admin, db } = require("../config/firebase");

const WEB_API_KEY = process.env.FIREBASE_WEB_API_KEY;
const rol = process.argv[2] === "administrador" ? "administrador" : "encuestador";
const email = process.env.TEST_USER_EMAIL || `prueba.${rol}@uraba-pais.test`;
const password = process.env.TEST_USER_PASSWORD || "PruebaSegura123!";

async function main() {
  if (!WEB_API_KEY) {
    console.error("Falta la variable de entorno FIREBASE_WEB_API_KEY.");
    console.error("Consiguela en: Firebase Console > Configuracion del proyecto > General > Tus apps > apiKey");
    process.exit(1);
  }

  let user;
  try {
    user = await admin.auth().getUserByEmail(email);
  } catch (err) {
    user = await admin.auth().createUser({ email, password });
    console.log(`Usuario de prueba creado: ${email}`);
  }

  await db.collection("usuarios").doc(user.uid).set({ rol }, { merge: true });

  // Login directo por email/password via la API REST de Identity Toolkit.
  // Evita createCustomToken(), que requiere una clave de service account o
  // permisos IAM de firma que esta cuenta no tiene disponibles.
  const resp = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${WEB_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );

  const data = await resp.json();
  if (!resp.ok) {
    console.error("Error iniciando sesion con email/password:");
    console.error(data);
    process.exit(1);
  }

  console.log(`\nUsuario: ${email} (uid: ${user.uid}, rol: ${rol})`);
  console.log("Token valido por 1 hora. Vuelve a correr este script cuando expire.\n");
  console.log(data.idToken);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
