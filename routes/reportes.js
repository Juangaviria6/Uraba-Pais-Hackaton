const express = require("express");
const router = express.Router();

const { requireAuth, requireAdmin } = require("../middleware/auth");
const reportesController = require("../controllers/reportesController");

router.get("/indicadores", requireAuth, requireAdmin, reportesController.indicadores);

module.exports = router;
