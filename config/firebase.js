// Inicializa firebase-admin usando Application Default Credentials.
// En esta maquina las credenciales ya estan configuradas con:
//   gcloud auth application-default login
// No se usa serviceAccountKey.json (bloqueado por politica de la organizacion).

const admin = require("firebase-admin");

const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId,
  });
}

const db = admin.firestore();

module.exports = { admin, db };
