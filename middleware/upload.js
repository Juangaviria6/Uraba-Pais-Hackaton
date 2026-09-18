const multer = require("multer");

// Guarda el archivo en memoria (nunca en disco): se sube directo a
// Cloudinary y se descarta. Limite razonable para una foto de evidencia
// (10 MB) y solo se aceptan imagenes.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Solo se permiten archivos de imagen"));
    }
    cb(null, true);
  },
});

// Envuelve upload.single(campo) para responder 400 con un mensaje claro en
// vez de dejar que el error (archivo muy grande, tipo invalido, etc.) caiga
// al manejador generico de errores como un 500 confuso.
function imagenUnica(campo) {
  const middleware = upload.single(campo);
  return (req, res, next) => {
    middleware(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message || "No se pudo procesar el archivo" });
      }
      next();
    });
  };
}

module.exports = upload;
module.exports.imagenUnica = imagenUnica;
