const { db } = require("../config/firebase");
const { normalizarDoc } = require("./utils");

const programas = db.collection("programas");

// GET /api/programas
async function listar(req, res, next) {
  try {
    const snap = await programas.get();
    const lista = snap.docs.map((d) => ({ id: d.id, ...normalizarDoc(d.data()) }));
    return res.json(lista);
  } catch (err) {
    next(err);
  }
}

// POST /api/programas
async function crear(req, res, next) {
  try {
    const { nombre, linea_trabajo } = req.body;
    if (!nombre) {
      return res.status(400).json({ error: 'El campo "nombre" es obligatorio' });
    }

    const nuevo = { nombre, linea_trabajo: linea_trabajo || null };
    const ref = await programas.add(nuevo);
    const creado = await ref.get();

    return res.status(201).json({ id: creado.id, ...normalizarDoc(creado.data()) });
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, crear };
