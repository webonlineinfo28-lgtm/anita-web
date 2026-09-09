// Núcleo puro de la lista de espera de la cabina (estilo plug.dj).
// Trabaja sobre arrays de userIds, sin efecto ni estado global.

function asList(v){return Array.isArray(v)?v:[];}
function cleanId(id){if(typeof id!=='string')return null;const t=id.trim().slice(0,40);return t||null;}

// Añade un usuario a la cola (sin duplicados).
export function joinWaitlist(_waitlist,_userId){const waitlist=asList(_waitlist);const userId=cleanId(_userId);if(!userId)return waitlist;return waitlist.includes(userId)?waitlist:[...waitlist,userId];}

// Elimina un usuario de la cola.
export function leaveWaitlist(_waitlist,_userId){const waitlist=asList(_waitlist);const userId=cleanId(_userId);if(!userId)return waitlist;return waitlist.filter((u)=>u!==userId);}

// Rota la cabina: el DJ actual pasa al final y devuelve el nuevo DJ.
// Devuelve [nuevaCola, próximoDj].
export function rotateWaitlist(_waitlist){const waitlist=asList(_waitlist);if(!waitlist.length)return [waitlist,null];const [leader,...rest]=waitlist;return [[...rest,leader],rest[0]||leader];}

// DJ actual de la cabina (el primero de la cola) o el fallback indicado.
export function currentDj(waitlist,fallback){const l=asList(waitlist);return l[0]||fallback||null;}

// Reordena las canciones para que las del siguiente DJ queden al principio.
// El llamador debe haber quitado ya de la lista la canción que acaba de sonar.
export function bumpSongsToFront(_songs,_userId){const songs=asList(_songs);const userId=cleanId(_userId);if(!userId)return songs;const mine=songs.filter((s)=>s&&s.addedBy===userId);const others=songs.filter((s)=>!s||s.addedBy!==userId);return [...mine,...others];}
