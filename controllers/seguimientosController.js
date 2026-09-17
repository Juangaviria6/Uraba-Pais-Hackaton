const { db } = require("../config/firebase");

const beneficiarios = db.collection("beneficiarios");

// POST /api/beneficiarios/:id/seguimientos
// Registra como va el caso: que avanzo/cambio y que accion queda pendiente.
async function crear(req, res, next) {
  try {
    const beneficiarioRef = beneficiarios.doc(req.params.id);
    const beneficiarioDoc = await beneficiarioRef.get();
    if (!beneficiarioDoc.exists) {
      return res.status(404).json({ error: "Beneficiario no encontrado" });
    }

    const { fecha, avance_novedad, observacion, accion_pendiente, proximo_contacto } = req.body;

    if (!fecha) {
      return res.status(400).json({ error: "fecha es obligatoria" });
    }
    if (!avance_novedad) {
      return res.status(400).json({ error: "avance_novedad es obligatorio" });
    }

    const nuevo = {
      fecha,
      avance_novedad,
      observacion: observacion || null,
      accion_pendiente: accion_pendiente || null,
      proximo_contacto: proximo_contacto || null,
    };

    const ref = await beneficiarioRef.collection("seguimientos").add(nuevo);
    const creado = await ref.get();

    return res.status(201).json({ id: creado.id, ...creado.data() });
  } catch (err) {
    next(err);
  }
}

// GET /api/beneficiarios/:id/seguimientos
async function listar(req, res, next) {
  try {
    const beneficiarioRef = beneficiarios.doc(req.params.id);
    const beneficiarioDoc = await beneficiarioRef.get();
    if (!beneficiarioDoc.exists) {
      return res.status(404).json({ error: "Beneficiario no encontrado" });
    }

    const snap = await beneficiarioRef.collection("seguimientos").get();
    return res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch (err) {
    next(err);
  }
}

module.exports = { crear, listar };
