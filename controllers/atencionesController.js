const { db } = require("../config/firebase");
const { normalizarDoc } = require("./utils");

const beneficiarios = db.collection("beneficiarios");

const TIPOS_VALIDOS = ["Ayuda", "Atención", "Atencion"];

// POST /api/beneficiarios/:id/atenciones
// Registra algo que YA se entrego o realizo (ver distincion con seguimientos).
async function crear(req, res, next) {
  try {
    const beneficiarioRef = beneficiarios.doc(req.params.id);
    const beneficiarioDoc = await beneficiarioRef.get();
    if (!beneficiarioDoc.exists) {
      return res.status(404).json({ error: "Beneficiario no encontrado" });
    }

    const { tipo, fecha, descripcion, responsable, resultado } = req.body;

    if (!tipo || !TIPOS_VALIDOS.includes(tipo)) {
      return res.status(400).json({ error: 'tipo debe ser "Ayuda" o "Atención"' });
    }
    if (!fecha) {
      return res.status(400).json({ error: "fecha es obligatoria" });
    }
    if (!descripcion) {
      return res.status(400).json({ error: "descripcion es obligatoria" });
    }

    const nueva = {
      tipo,
      fecha,
      descripcion,
      responsable: responsable || null,
      resultado: resultado || null,
    };

    const ref = await beneficiarioRef.collection("atenciones").add(nueva);
    const creada = await ref.get();

    return res.status(201).json({ id: creada.id, ...normalizarDoc(creada.data()) });
  } catch (err) {
    next(err);
  }
}

// GET /api/beneficiarios/:id/atenciones
async function listar(req, res, next) {
  try {
    const beneficiarioRef = beneficiarios.doc(req.params.id);
    const beneficiarioDoc = await beneficiarioRef.get();
    if (!beneficiarioDoc.exists) {
      return res.status(404).json({ error: "Beneficiario no encontrado" });
    }

    const snap = await beneficiarioRef.collection("atenciones").get();
    return res.json(snap.docs.map((d) => ({ id: d.id, ...normalizarDoc(d.data()) })));
  } catch (err) {
    next(err);
  }
}

module.exports = { crear, listar };
