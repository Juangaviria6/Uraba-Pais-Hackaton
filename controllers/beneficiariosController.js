const crypto = require("crypto");
const { db, admin } = require("../config/firebase");

const beneficiarios = db.collection("beneficiarios");

const CAMPOS_REQUERIDOS = ["tipo_documento", "numero_documento", "nombres"];

// RF-03: codigo interno unico e inmutable por beneficiario, distinto del
// documento de identidad y del id tecnico de Firestore. Sirve para que un
// encuestador identifique un caso sin exponer el id interno de la base de
// datos ni depender de que la persona tenga documento.
async function generarCodigoInterno() {
  for (let intento = 0; intento < 5; intento++) {
    const codigo = `BEN-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const choque = await beneficiarios.where("codigo_interno", "==", codigo).limit(1).get();
    if (choque.empty) {
      return codigo;
    }
  }
  throw new Error("No se pudo generar un codigo interno unico");
}

function validarBeneficiario(body) {
  for (const campo of CAMPOS_REQUERIDOS) {
    if (!body[campo] || String(body[campo]).trim() === "") {
      return `El campo "${campo}" es obligatorio`;
    }
  }
  if (body.edad !== undefined && body.edad !== null && typeof body.edad !== "number") {
    return 'El campo "edad" debe ser numerico';
  }
  if (body.autorizacion_datos !== undefined && typeof body.autorizacion_datos !== "boolean") {
    return 'El campo "autorizacion_datos" debe ser booleano';
  }
  return null;
}

// GET /api/beneficiarios/buscar?tipo_documento=&numero_documento=
async function buscar(req, res, next) {
  try {
    const { tipo_documento, numero_documento } = req.query;

    if (!tipo_documento || !numero_documento) {
      return res.status(400).json({ error: "tipo_documento y numero_documento son obligatorios" });
    }

    const snap = await beneficiarios
      .where("tipo_documento", "==", tipo_documento)
      .where("numero_documento", "==", numero_documento)
      .limit(1)
      .get();

    if (snap.empty) {
      return res.json({ encontrado: false });
    }

    const doc = snap.docs[0];
    return res.json({ encontrado: true, beneficiario: { id: doc.id, ...doc.data() } });
  } catch (err) {
    next(err);
  }
}

// POST /api/beneficiarios
async function crear(req, res, next) {
  try {
    const errorValidacion = validarBeneficiario(req.body);
    if (errorValidacion) {
      return res.status(400).json({ error: errorValidacion });
    }

    const { tipo_documento, numero_documento } = req.body;

    const existente = await beneficiarios
      .where("tipo_documento", "==", tipo_documento)
      .where("numero_documento", "==", numero_documento)
      .limit(1)
      .get();

    if (!existente.empty) {
      const doc = existente.docs[0];
      return res.status(409).json({
        error: "Ya existe un beneficiario con ese tipo y numero de documento",
        beneficiario: { id: doc.id, ...doc.data() },
      });
    }

    const codigo_interno = await generarCodigoInterno();

    const nuevo = {
      codigo_interno,
      tipo_documento: req.body.tipo_documento,
      numero_documento: req.body.numero_documento,
      nombres: req.body.nombres,
      sexo: req.body.sexo || null,
      edad: req.body.edad ?? null,
      municipio: req.body.municipio || null,
      zona: req.body.zona || null,
      nacionalidad: req.body.nacionalidad || null,
      tipo_poblacion: req.body.tipo_poblacion || null,
      autorizacion_datos: req.body.autorizacion_datos ?? false,
      fecha_autorizacion: req.body.fecha_autorizacion || null,
      creado_en: admin.firestore.FieldValue.serverTimestamp(),
    };

    const ref = await beneficiarios.add(nuevo);
    const creado = await ref.get();

    return res.status(201).json({ id: creado.id, ...creado.data() });
  } catch (err) {
    next(err);
  }
}

// GET /api/beneficiarios/:id
async function obtener(req, res, next) {
  try {
    const doc = await beneficiarios.doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Beneficiario no encontrado" });
    }
    return res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    next(err);
  }
}

// PUT /api/beneficiarios/:id
async function actualizar(req, res, next) {
  try {
    const ref = beneficiarios.doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Beneficiario no encontrado" });
    }

    const camposPermitidos = [
      "tipo_documento",
      "numero_documento",
      "nombres",
      "sexo",
      "edad",
      "municipio",
      "zona",
      "nacionalidad",
      "tipo_poblacion",
      "autorizacion_datos",
      "fecha_autorizacion",
    ];

    const actualizacion = {};
    for (const campo of camposPermitidos) {
      if (req.body[campo] !== undefined) {
        actualizacion[campo] = req.body[campo];
      }
    }

    if (actualizacion.edad !== undefined && typeof actualizacion.edad !== "number") {
      return res.status(400).json({ error: 'El campo "edad" debe ser numerico' });
    }

    await ref.update(actualizacion);
    const actualizado = await ref.get();

    return res.json({ id: actualizado.id, ...actualizado.data() });
  } catch (err) {
    next(err);
  }
}

// POST /api/beneficiarios/:id/familiares
async function agregarFamiliar(req, res, next) {
  try {
    const ref = beneficiarios.doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Beneficiario no encontrado" });
    }

    const { nombres, parentesco, fecha_nacimiento } = req.body;
    if (!nombres || !parentesco) {
      return res.status(400).json({ error: "nombres y parentesco son obligatorios" });
    }

    const familiar = {
      nombres,
      parentesco,
      fecha_nacimiento: fecha_nacimiento || null,
    };

    const familiarRef = await ref.collection("familiares").add(familiar);
    const creado = await familiarRef.get();

    return res.status(201).json({ id: creado.id, ...creado.data() });
  } catch (err) {
    next(err);
  }
}

// GET /api/beneficiarios/:id/familiares
async function listarFamiliares(req, res, next) {
  try {
    const ref = beneficiarios.doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Beneficiario no encontrado" });
    }

    const snap = await ref.collection("familiares").get();
    const familiares = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return res.json(familiares);
  } catch (err) {
    next(err);
  }
}

// GET /api/beneficiarios/:id/ficha
async function ficha(req, res, next) {
  try {
    const ref = beneficiarios.doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Beneficiario no encontrado" });
    }

    const [familiaresSnap, participacionesSnap, atencionesSnap, seguimientosSnap] = await Promise.all([
      ref.collection("familiares").get(),
      ref.collection("participaciones").get(),
      ref.collection("atenciones").get(),
      ref.collection("seguimientos").get(),
    ]);

    return res.json({
      id: doc.id,
      ...doc.data(),
      familiares: familiaresSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
      participaciones: participacionesSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
      atenciones: atencionesSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
      seguimientos: seguimientosSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  buscar,
  crear,
  obtener,
  actualizar,
  agregarFamiliar,
  listarFamiliares,
  ficha,
};
