// Núcleo puro del chat de sala.

export const CHAT_MAX = 60;
export const CHAT_MAX_LEN = 240;

// Limpia un texto: recorta, quita saltos de línea y limita la longitud.
export function sanitizeText(text) {
  if (typeof text !== "string") return "";
  return text
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, CHAT_MAX_LEN);
}

// Crea un mensaje de chat válido.
export function createChatMessage({ user, text, type = "message", time }) {
  const clean = sanitizeText(text);
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    user: sanitizeText(user || "Anónimo") || "Anónimo",
    text: clean,
    type: type === "system" ? "system" : "message",
    time: time || Date.now(),
  };
}

// Empuja mensaje al historial, manteniendo como mucho CHAT_MAX.
export function pushMessage(history, message) {
  if (!message || !message.text) return history;
  return [...history, message].slice(-CHAT_MAX);
}

// Mensaje del sistema.
export function systemMessage(text, time) {
  return createChatMessage({ user: "System", text, type: "system", time });
}