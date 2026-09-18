// Carga las variables de entorno de un archivo .env en la raiz del proyecto
// (si existe). Debe ser lo primero que corre el archivo: config/firebase.js,
// config/cloudinary.js y controllers/chatController.js leen process.env en
// cuanto se importan, asi que si esto corriera despues, ya seria tarde.
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const beneficiariosRoutes = require("./routes/beneficiarios");
const programasRoutes = require("./routes/programas");
const reportesRoutes = require("./routes/reportes");
const usuariosRoutes = require("./routes/usuarios");
const chatRoutes = require("./routes/chat");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/beneficiarios", beneficiariosRoutes);
app.use("/api/programas", programasRoutes);
app.use("/api/reportes", reportesRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/chat", chatRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Config publica del SDK cliente de Firebase para la pagina de prueba
// (public/index.html). No son datos sensibles (el apiKey de Firebase es
// publico por diseno), pero viven en variables de entorno para no
// hardcodearlas en el HTML.
app.get("/api/config", (req, res) => {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID;
  res.json({
    apiKey: process.env.FIREBASE_WEB_API_KEY || null,
    authDomain: projectId ? `${projectId}.firebaseapp.com` : null,
    projectId: projectId || null,
  });
});

// 404 para rutas de API no encontradas
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Manejador de errores: nunca expone stack traces al cliente
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`URABA-PAIS backend escuchando en http://localhost:${PORT}`);
});
