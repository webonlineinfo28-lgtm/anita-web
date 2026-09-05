// Núcleo puro de la lista de espera de la cabina (estilo plug.dj).
// Trabaja sobre arrays de userIds, sin efecto ni estado global.

// Añade un usuario a la cola (sin duplicados).
export function joinWaitlist(waitlist, userId) {
  if (!userId) return waitlist;
  return waitlist.includes(userId) ? waitlist : [...waitlist, userId];
}

// Elimina un usuario de la cola.
export function leaveWaitlist(waitlist, userId) {
  return waitlist.filter((u) => u !== userId);
}

// Rota la cabina: el DJ actual pasa al final y devuelve el nuevo DJ.
// Devuelve [nuevaCola, proximoDj].
export function rotateWaitlist(waitlist) {
  if (!waitlist.length) return [waitlist, null];
  const [leader, ...rest] = waitlist;
  return [[...rest, leader], rest[0] || leader];
}

// DJ actual de la cabina (el primero de la cola) o el fallback indicado.
export function currentDj(waitlist, fallback) {
  return waitlist[0] || fallback || null;
}

// Reordena las canciones para que las del siguiente DJ queden al principio.
// El llamador debe haber quitado ya de la lista la canción que acaba de sonar.
export function bumpSongsToFront(songs, userId) {
  if (!userId) return songs;
  const mine = songs.filter((s) => s.addedBy === userId);
  const others = songs.filter((s) => s.addedBy !== userId);
  return [...mine, ...others];
}