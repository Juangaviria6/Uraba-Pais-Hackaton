// Corrige el campo tipo_documento en beneficiarios sembrados con valores no
// estandar ("CC/Documento", "Sin documento"), que no coinciden con el valor
// exacto que usa el formulario de busqueda ("CC", "SIN_DOCUMENTO") y por eso
// no aparecian al buscar por tipo_documento + numero_documento.
//
// Uso:
//   $env:GOOGLE_CLOUD_PROJECT = "uraba-pais-447f8"
//   node scripts/normalizar-tipo-documento.js

const { db } = require("../config/firebase");

const MAPEO = {
  "CC/Documento": "CC",
  "Sin documento": "SIN_DOCUMENTO",
};

async function main() {
  const snap = await db.collection("beneficiarios").get();
  const porCorregir = snap.docs.filter((doc) => MAPEO[doc.data().tipo_documento]);

  console.log(`Beneficiarios totales: ${snap.size}`);
  console.log(`Registros a corregir: ${porCorregir.length}`);

  if (porCorregir.length === 0) {
    console.log("Nada que corregir.");
    return;
  }

  const batch = db.batch();
  for (const doc of porCorregir) {
    const nuevoValor = MAPEO[doc.data().tipo_documento];
    batch.update(doc.ref, { tipo_documento: nuevoValor });
  }
  await batch.commit();

  console.log("Listo. Valores corregidos:");
  const conteo = {};
  for (const doc of porCorregir) {
    const anterior = doc.data().tipo_documento;
    conteo[`${anterior} -> ${MAPEO[anterior]}`] = (conteo[`${anterior} -> ${MAPEO[anterior]}`] || 0) + 1;
  }
  console.log(conteo);
}

main().catch((err) => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
