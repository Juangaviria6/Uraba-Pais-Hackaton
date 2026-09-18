const { db } = require("../config/firebase");
const { normalizarDoc } = require("./utils");

const usuarios = db.collection("usuarios");

// GET /api/usuarios/me
// Permite al frontend saber el rol del usuario autenticado (para
// mostrar/ocultar secciones segun RF-19) sin exponer la coleccion completa.
async function me(req, res, next) {
  try {
    const uid = req.user.uid;
    const doc = await usuarios.doc(uid).get();
    const rol = doc.exists ? doc.data().rol : null;

    return res.json({ uid, email: req.user.email || null, rol });
  } catch (err) {
    next(err);
  }
}

// POST /api/usuarios/registrar
// Auto-provisiona el documento de rol la primera vez que un usuario inicia
// sesion. Nunca asigna "administrador": ese rol solo se otorga a mano desde
// la consola de Firestore, para que nadie se auto-promueva.
async function registrar(req, res, next) {
  try {
    const uid = req.user.uid;
    const ref = usuarios.doc(uid);
    const doc = await ref.get();

    if (!doc.exists) {
      await ref.set({ rol: "encuestador", email: req.user.email || null });
    }

    const actualizado = await ref.get();
    return res.json({ uid, ...normalizarDoc(actualizado.data()) });
  } catch (err) {
    next(err);
  }
}

module.exports = { me, registrar };
