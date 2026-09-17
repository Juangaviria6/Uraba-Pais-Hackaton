const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/auth");
const programasController = require("../controllers/programasController");

router.get("/", programasController.listar);
router.post("/", requireAuth, programasController.crear);

module.exports = router;
