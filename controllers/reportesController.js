const { db } = require("../config/firebase");

// GET /api/reportes/indicadores (solo administrador)
// Usa count() sobre collectionGroup para no traer documentos completos.
// No se incluyen datos personales identificables, solo agregados.
async function indicadores(req, res, next) {
  try {
    const beneficiariosCountSnap = await db.collection("beneficiarios").count().get();
    const beneficiarios_unicos = beneficiariosCountSnap.data().count;

    const atencionesCountSnap = await db.collectionGroup("atenciones").count().get();
    const atenciones_registradas = atencionesCountSnap.data().count;

    const seguimientosPendientesSnap = await db
      .collectionGroup("seguimientos")
      .where("accion_pendiente", "!=", null)
      .count()
      .get();
    const seguimientos_pendientes = seguimientosPendientesSnap.data().count;

    const programasSnap = await db.collection("programas").get();
    const participaciones_por_programa = {};

    for (const programaDoc of programasSnap.docs) {
      const countSnap = await db
        .collectionGroup("participaciones")
        .where("programa_id", "==", programaDoc.id)
        .count()
        .get();
      participaciones_por_programa[programaDoc.data().nombre || programaDoc.id] = countSnap.data().count;
    }

    return res.json({
      beneficiarios_unicos,
      participaciones_por_programa,
      atenciones_registradas,
      seguimientos_pendientes,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { indicadores };
