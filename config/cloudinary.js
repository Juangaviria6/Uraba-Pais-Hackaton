// Configura el SDK de Cloudinary para subir evidencia fotografica de
// atenciones y seguimientos (RF opcional: adjuntar evidencia).
//

const cloudinary = require("cloudinary").v2;

if (!process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Util para que el resto del backend pueda preguntar si ya hay credenciales,
// y devolver un error claro en vez de un fallo raro de Cloudinary.
function cloudinaryConfigurado() {
  const cfg = cloudinary.config();
  return Boolean(cfg.cloud_name && cfg.api_key && cfg.api_secret);
}

module.exports = { cloudinary, cloudinaryConfigurado };
