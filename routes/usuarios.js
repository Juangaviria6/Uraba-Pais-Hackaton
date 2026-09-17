const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/auth");
const usuariosController = require("../controllers/usuariosController");

router.get("/me", requireAuth, usuariosController.me);
router.post("/registrar", requireAuth, usuariosController.registrar);

module.exports = router;
