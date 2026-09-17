const express = require("express");
const cors = require("cors");
const path = require("path");

const beneficiariosRoutes = require("./routes/beneficiarios");
const programasRoutes = require("./routes/programas");
const reportesRoutes = require("./routes/reportes");
const usuariosRoutes = require("./routes/usuarios");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/beneficiarios", beneficiariosRoutes);
app.use("/api/programas", programasRoutes);
app.use("/api/reportes", reportesRoutes);
app.use("/api/usuarios", usuariosRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

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
