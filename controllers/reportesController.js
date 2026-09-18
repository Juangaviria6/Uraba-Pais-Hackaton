const { db } = require("../config/firebase");

// GET /api/reportes/indicadores (solo administrador)
// Usa count() sobre collectionGroup para no traer documentos completos.
// No se incluyen datos personales identificables, solo agregados.
//
// Todas las consultas son independientes entre si (ninguna depende del
// resultado de otra), asi que se lanzan todas en paralelo con Promise.all en
// vez de una tras otra: antes se esperaba una consulta completa de Firestore
// por cada programa, en secuencia, y con varios programas la suma facilmente
// superaba el limite de espera del frontend (timeout "sin conexion" aunque
// si habia conexion, solo que la respuesta tardaba demasiado en llegar).
async function indicadores(req, res, next) {
  try {
    const programasSnap = await db.collection("programas").get();

    const [beneficiariosCountSnap, atencionesCountSnap, seguimientosPendientesSnap, conteosPorPrograma] =
      await Promise.all([
        db.collection("beneficiarios").count().get(),
        db.collectionGroup("atenciones").count().get(),
        db.collectionGroup("seguimientos").where("accion_pendiente", "!=", null).count().get(),
        Promise.all(
          programasSnap.docs.map(async (programaDoc) => {
            const countSnap = await db
              .collectionGroup("participaciones")
              .where("programa_id", "==", programaDoc.id)
              .count()
              .get();
            return { nombre: programaDoc.data().nombre || programaDoc.id, count: countSnap.data().count };
          }),
        ),
      ]);

    const participaciones_por_programa = {};
    for (const { nombre, count } of conteosPorPrograma) {
      participaciones_por_programa[nombre] = count;
    }

    return res.json({
      beneficiarios_unicos: beneficiariosCountSnap.data().count,
      participaciones_por_programa,
      atenciones_registradas: atencionesCountSnap.data().count,
      seguimientos_pendientes: seguimientosPendientesSnap.data().count,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { indicadores };
