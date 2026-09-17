const { admin, db } = require("../config/firebase");

// Exige un ID token de Firebase Authentication valido en:
//   Authorization: Bearer <token>
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Falta el header Authorization: Bearer <token>" });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token invalido o expirado" });
  }
}

// Exige que el usuario autenticado tenga rol "administrador" en usuarios/{uid}.
// Debe usarse siempre despues de requireAuth.
async function requireAdmin(req, res, next) {
  try {
    const uid = req.user && req.user.uid;
    if (!uid) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const snap = await db.collection("usuarios").doc(uid).get();
    const rol = snap.exists ? snap.data().rol : null;

    if (rol !== "administrador") {
      return res.status(403).json({ error: "Se requiere rol de administrador" });
    }

    next();
  } catch (err) {
    return res.status(500).json({ error: "Error verificando el rol del usuario" });
  }
}

module.exports = { requireAuth, requireAdmin };
