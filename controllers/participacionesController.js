const { db } = require("../config/firebase");

const beneficiarios = db.collection("beneficiarios");
const programas = db.collection("programas");

const ESTADOS_VALIDOS = ["inscrito", "en_proceso", "finalizado", "retirado"];

// POST /api/beneficiarios/:id/participaciones
async function crear(req, res, next) {
  try {
    const beneficiarioRef = beneficiarios.doc(req.params.id);
    const beneficiarioDoc = await beneficiarioRef.get();
    if (!beneficiarioDoc.exists) {
      return res.status(404).json({ error: "Beneficiario no encontrado" });
    }

    const { programa_id, organizacion, fecha_vinculacion } = req.body;
    if (!programa_id) {
      return res.status(400).json({ error: "programa_id es obligatorio" });
    }

    const programaDoc = await programas.doc(programa_id).get();
    if (!programaDoc.exists) {
      return res.status(400).json({ error: "El programa indicado no existe" });
    }

    const estado = req.body.estado || "inscrito";
    if (!ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).json({
        error: `estado invalido. Valores permitidos: ${ESTADOS_VALIDOS.join(", ")}`,
      });
    }

    const nueva = {
      programa_id,
      organizacion: organizacion || null,
      fecha_vinculacion: fecha_vinculacion || null,
      estado,
    };

    const ref = await beneficiarioRef.collection("participaciones").add(nueva);
    const creada = await ref.get();

    return res.status(201).json({ id: creada.id, ...creada.data() });
  } catch (err) {
    next(err);
  }
}

// PUT /api/beneficiarios/:id/participaciones/:participacionId
async function actualizarEstado(req, res, next) {
  try {
    const beneficiarioRef = beneficiarios.doc(req.params.id);
    const participacionRef = beneficiarioRef.collection("participaciones").doc(req.params.participacionId);

    const doc = await participacionRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Participacion no encontrada" });
    }

    const { estado } = req.body;
    if (!estado || !ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).json({
        error: `estado invalido. Valores permitidos: ${ESTADOS_VALIDOS.join(", ")}`,
      });
    }

    await participacionRef.update({ estado });
    const actualizada = await participacionRef.get();

    return res.json({ id: actualizada.id, ...actualizada.data() });
  } catch (err) {
    next(err);
  }
}

module.exports = { crear, actualizarEstado, ESTADOS_VALIDOS };
