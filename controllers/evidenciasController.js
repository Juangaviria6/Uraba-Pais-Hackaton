// controllers/evidenciasController.js
//
// Evidencia fotografica de una atencion/ayuda o de un seguimiento
// (componente complementario opcional). El archivo nunca toca disco: llega
// en memoria (middleware/upload.js) y se sube directo a Cloudinary; en
// Firestore solo se guarda la URL resultante, en un arreglo `evidencias`
// para poder adjuntar mas de una foto al mismo registro.
const { db, admin } = require("../config/firebase");
const { cloudinary, cloudinaryConfigurado } = require("../config/cloudinary");
const { normalizarDoc } = require("./utils");

const beneficiarios = db.collection("beneficiarios");

function subirBuffer(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (err, resultado) => (err ? reject(err) : resolve(resultado)),
    );
    stream.end(buffer);
  });
}

// Fabrica un handler para una subcoleccion dada ("atenciones" o
// "seguimientos"): ambas siguen exactamente el mismo patron.
function agregarEvidencia(coleccion) {
  return async function (req, res, next) {
    try {
      if (!cloudinaryConfigurado()) {
        return res.status(500).json({
          error:
            "El servidor no tiene configurado Cloudinary. Define CLOUDINARY_URL " +
            "(o CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET) y reinicia.",
        });
      }
      if (!req.file) {
        return res.status(400).json({ error: "Falta el archivo 'evidencia'." });
      }

      const beneficiarioRef = beneficiarios.doc(req.params.id);
      const itemRef = beneficiarioRef.collection(coleccion).doc(req.params.itemId);
      const itemDoc = await itemRef.get();
      if (!itemDoc.exists) {
        return res.status(404).json({ error: "Registro no encontrado" });
      }

      let resultado;
      try {
        resultado = await subirBuffer(req.file.buffer, `uraba-pais/${coleccion}`);
      } catch (errorCloudinary) {
        // Cloudinary casi siempre trae un mensaje util (credenciales
        // invalidas, cloud_name mal escrito, etc.): se lo mandamos al
        // frontend en vez de que caiga como un 500 generico sin pistas.
        console.error("Error subiendo a Cloudinary:", errorCloudinary);
        return res.status(502).json({
          error: `No se pudo subir la imagen a Cloudinary: ${errorCloudinary.message || "error desconocido"}`,
        });
      }

      await itemRef.update({
        evidencias: admin.firestore.FieldValue.arrayUnion(resultado.secure_url),
      });

      const actualizado = await itemRef.get();
      return res.status(201).json({ id: actualizado.id, ...normalizarDoc(actualizado.data()) });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = {
  agregarEvidenciaAtencion: agregarEvidencia("atenciones"),
  agregarEvidenciaSeguimiento: agregarEvidencia("seguimientos"),
};
