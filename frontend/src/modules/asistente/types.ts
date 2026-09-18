export type RolMensaje = "user" | "assistant";

export type MensajeChat = {
  role: RolMensaje;
  content: string;
};
