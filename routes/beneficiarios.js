const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/auth");
const beneficiariosController = require("../controllers/beneficiariosController");
const participacionesController = require("../controllers/participacionesController");
const atencionesController = require("../controllers/atencionesController");
const seguimientosController = require("../controllers/seguimientosController");

// Modulo 1 - Beneficiarios y familias
router.get("/tipos-documento", beneficiariosController.tiposDocumento);
router.get("/sin-documento", beneficiariosController.listarSinDocumento);
router.get("/buscar", beneficiariosController.buscar);
router.post("/", requireAuth, beneficiariosController.crear);
router.get("/:id", beneficiariosController.obtener);
router.put("/:id", requireAuth, beneficiariosController.actualizar);
router.post("/:id/familiares", requireAuth, beneficiariosController.agregarFamiliar);
router.get("/:id/familiares", beneficiariosController.listarFamiliares);

// Modulo 2 - Participacion
router.post("/:id/participaciones", requireAuth, participacionesController.crear);
router.put("/:id/participaciones/:participacionId", requireAuth, participacionesController.actualizarEstado);

// Modulo 3 - Atencion y seguimiento
router.post("/:id/atenciones", requireAuth, atencionesController.crear);
router.get("/:id/atenciones", atencionesController.listar);
router.post("/:id/seguimientos", requireAuth, seguimientosController.crear);
router.get("/:id/seguimientos", seguimientosController.listar);

// Modulo 4 - Ficha consolidada
router.get("/:id/ficha", beneficiariosController.ficha);

module.exports = router;
