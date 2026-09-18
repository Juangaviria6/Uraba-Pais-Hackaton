// Convierte cualquier Timestamp de Firestore que aparezca en los campos de un
// documento a un string de fecha (YYYY-MM-DD), antes de mandarlo al frontend.
//
// Los formularios de la app siempre guardan las fechas como texto (vienen de
// <input type="date">), pero si un documento se crea o edita de otra forma
// (consola de Firestore, importaciones, datos de prueba) el campo puede
// quedar como Timestamp. React no puede renderizar ese objeto directamente
// ({_seconds, _nanoseconds}) y la pagina se queda en blanco, asi que se
// normaliza aqui, en el unico lugar por donde pasan todas las respuestas.
function normalizarDoc(data) {
  if (!data || typeof data !== "object") return data;

  const resultado = {};
  for (const [clave, valor] of Object.entries(data)) {
    if (valor && typeof valor.toDate === "function") {
      resultado[clave] = valor.toDate().toISOString().slice(0, 10);
    } else {
      resultado[clave] = valor;
    }
  }
  return resultado;
}

module.exports = { normalizarDoc };
