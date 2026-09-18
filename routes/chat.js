// routes/chat.js
const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { requireAuth, requireAdmin } = require("../middleware/auth");

// Solo administradores: el asistente puede leer indicadores y fichas
// completas, asi que se protege igual que el resto de vistas de admin.
router.post("/", requireAuth, requireAdmin, chatController.chat);

module.exports = router;