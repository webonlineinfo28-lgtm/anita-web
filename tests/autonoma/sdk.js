/**
 * Autonoma SDK Integration for Anita Festival
 * 
 * This module provides factories for seeding test data into localStorage
 * and an Express server that Playwright can use to interact with the app.
 */

import { STORAGE_KEYS } from  ../../src/lib/constants.js;

// Storage keys used by the app
export const STORAGE_KEYS_AUTONOMA = STORAGE_KEYS;

/**
 * Clears all app storage for a clean test state
 */
export async function clearStorage(page) {
  const keys = Object.values(STORAGE_KEYS);
  for (const key of keys) {
    await page.evaluate((k) => localStorage.removeItem(k), key);
  }
  await page.evaluate(() => localStorage.removeItem(anita_room_state));
}

/**
 * Seeds a session into localStorage
 */
export async function seedSession(page, { user, role = user }) {
  const session = { user, role, storage_key: STORAGE_KEYS.session };
  await page.evaluate(
    (s) => localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(s)),
    session
  );
  return session;
}

/**
 * Seeds festival state (root synchronization state)
 */
export async function seedFestivalState(page, { room = festival-test, active = true }) {
  const state = { room, active };
  await page.evaluate(
    (s) => localStorage.setItem(bingo_shared_state, JSON.stringify(s)),
    state
  );
  return state;
}

/**
 * Seeds playlist/songs into localStorage
 */
export async function seedPlaylist(page, songs = []) {
  const playlist = songs.map(s => ({
    id: s.id || song--,
    url: s.url,
    title: s.title || s.url,
    addedBy: s.addedBy
  }));
  await page.evaluate(
    (p) => localStorage.setItem(STORAGE_KEYS.playlist, JSON.stringify(p)),
    playlist
  );
  return playlist;
}

/**
 * Seeds history/recently played tracks
 */
export async function seedHistory(page, tracks = []) {
  const history = tracks.map(t => ({
    id: t.id || hist-,
    url: t.url,
    title: t.title || t.url,
    addedBy: t.addedBy
  }));
  await page.evaluate(
    (h) => localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(h)),
    history
  );
  return history;
}

/**
 * Seeds bingo shared state
 */
export async function seedBingoSharedState(page, { drawnNumbers = [], isBomboRunning = true, winStatus = null }) {
  const state = { drawnNumbers, isBomboRunning, winStatus };
  await page.evaluate(
    (s) => localStorage.setItem(STORAGE_KEYS.sharedState, JSON.stringify(s)),
    state
  );
  return state;
}

/**
 * Seeds bingo winners
 */
export async function seedBingoWinners(page, winners = []) {
  const formatted = winners.map(w => ({
    user: w.user,
    winType: w.winType,
    gameId: w.gameId,
    timestamp: w.timestamp || Date.now(),
    id: w.id || winner-
  }));
  await page.evaluate(
    (w) => localStorage.setItem(STORAGE_KEYS.winners, JSON.stringify(w)),
    formatted
  );
  return formatted;
}

/**
 * Seeds bingo user cards
 */
export async function seedBingoUserCards(page, cards = []) {
  const userCards = {};
  for (const c of cards) {
    userCards[c.user] = {
      card: c.card,
      createdAt: c.createdAt || Date.now() - 1800000, // 30 min ago
      lastUsed: Date.now()
    };
  }
  await page.evaluate(
    (uc) => localStorage.setItem(STORAGE_KEYS.userCards, JSON.stringify(uc)),
    userCards
  );
  return userCards;
}

/**
 * Seeds bingo permanent counts
 */
export async function seedBingoPermanentCounts(page, counts = {}) {
  await page.evaluate(
    (c) => localStorage.setItem(STORAGE_KEYS.permanentCounts, JSON.stringify(c)),
    counts
  );
  return counts;
}

/**
 * Seeds bingo current game ID
 */
export async function seedBingoCurrentGame(page, gameId) {
  const id = gameId || game-;
  await page.evaluate(
    (gid) => localStorage.setItem(STORAGE_KEYS.currentGame, JSON.stringify(gid)),
    id
  );
  return { gameId: id, storage_key: STORAGE_KEYS.currentGame };
}

/**
 * Seeds avatars
 */
export async function seedAvatars(page, avatars = {}) {
  await page.evaluate(
    (a) => localStorage.setItem(STORAGE_KEYS.avatars, JSON.stringify(a)),
    avatars
  );
  return avatars;
}

/**
 * Seeds room state (chat, waitlist, DJ, etc.)
 */
export async function seedRoomState(page, state = {}) {
  const defaultState = {
    dj: state.dj || null,
    waitlist: state.waitlist || [],
    currentTrack: state.currentTrack || null,
    isPlaying: state.isPlaying ?? true,
    messages: state.messages || [],
    trackReactions: state.trackReactions || {},
    statsMap: state.statsMap || {},
    playlist: state.playlist || [],
    history: state.history || []
  };
  await page.evaluate(
    (rs) => localStorage.setItem(anita_room_state, JSON.stringify(rs)),
    defaultState
  );
  return defaultState;
}

/**
 * Seeds stats (XP, levels, fame)
 */
export async function seedStats(page, stats = {}) {
  await page.evaluate(
    (s) => localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(s)),
    stats
  );
  return stats;
}

/**
 * Seeds all entities for a standard test scenario
 */
export async function seedStandardScenario(page, testRunId = test) {
  await clearStorage(page);
  
  const shortId = testRunId.slice(0, 8);
  
  // Seed sessions
  const users = [
    { user: Anita_sorrita+, role: admin },
    { user: DJ_Space+, role: user },
    { user: Bingo_King+, role: user },
    { user: Guest_42+, role: user }
  ];
  
  // Seed first user as active session
  await seedSession(page, users[0]);
  
  // Seed playlist
  const songs = [
    { id: song-1-, url: https://www.youtube.com/watch?v=jfKfPfyJRdk, title: Lo-fi Hip Hop Radio, addedBy: users[1].user },
    { id: song-2-, url: https://www.youtube.com/watch?v=5qap5aO4i9A, title: Lofi Girl, addedBy: users[1].user },
    { id: song-3-, url: https://www.youtube.com/watch?v=DWcP7u97K8k, title: Synthwave Mix, addedBy: users[0].user },
    { id: song-4-, url: https://www.youtube.com/watch?v=7NOSDKb0HlU, title: City Pop Essentials, addedBy: users[2].user },
    { id: song-5-, url: https://www.youtube.com/watch?v=kgx4WGK0oNU, title: Jazz Vibes, addedBy: users[3].user }
  ];
  await seedPlaylist(page, songs);
  
  // Seed history
  const history = [
    { id: hist-1-, url: https://www.youtube.com/watch?v=Qt0-9mO-ZXY, title: Opening Track, addedBy: users[0].user },
    { id: hist-2-, url: https://www.youtube.com/watch?v=MCkTebktHVc, title: High Energy Mix, addedBy: users[1].user },
    { id: hist-3-, url: https://www.youtube.com/watch?v=lTRiuFIWV5M, title: Chill Out Sessions, addedBy: users[3].user }
  ];
  await seedHistory(page, history);
  
  // Seed bingo
  await seedBingoSharedState(page, { drawnNumbers: [42, 7, 15, 66, 23, 5, 11], isBomboRunning: true });
  
  const gameId = game-;
  await seedBingoCurrentGame(page, gameId);
  
  // Seed bingo winners
  const winners = [
    { user: users[2].user, winType: line, gameId, timestamp: Date.now() - 300000 },
    { user: users[3].user, winType: line, gameId, timestamp: Date.now() - 180000 },
    { user: users[0].user, winType: bingo, gameId: game-prev-, timestamp: Date.now() - 1200000 }
  ];
  await seedBingoWinners(page, winners);
  
  // Seed bingo cards
  const bingoCards = [
    { user: users[0].user, card: [[7,18,34,51,70],[2,22,40,49,61],[15,25,0,55,66],[11,30,38,58,72],[5,21,44,52,69]] },
    { user: users[1].user, card: [[1,16,31,46,61],[2,17,32,47,62],[3,18,0,48,63],[4,19,34,49,64],[5,20,35,50,65]] },
    { user: users[2].user, card: [[10,25,40,55,70],[11,26,41,56,71],[12,27,0,57,72],[13,28,43,58,73],[14,29,44,59,74]] },
    { user: users[3].user, card: [[5,20,35,50,65],[6,21,36,51,66],[7,22,0,52,67],[8,23,38,53,68],[9,24,39,54,69]] }
  ];
  await seedBingoUserCards(page, bingoCards);
  
  // Seed permanent counts
  const counts = {
    [users[0].user]: 12,
    [users[2].user]: 45,
    [users[3].user]: 2
  };
  await seedBingoPermanentCounts(page, counts);
  
  // Seed avatars
  const avatars = {
    [users[0].user]: { skin: alien, eyes: glow, accessory: crown },
    [users[1].user]: { skin: human, eyes: shades, accessory: headphones }
  };
  await seedAvatars(page, avatars);
  
  // Seed room state
  const roomState = {
    dj: users[1].user,
    waitlist: [users[1].user, users[2].user, users[3].user],
    currentTrack: songs[0],
    isPlaying: true,
    messages: [
      { user: users[0].user, text: Bienvenidos al festival!, type: chat },
      { user: system, text: ${users[1].user} ha comenzado su set, type: system }
    ],
    trackReactions: {
      ❤️: [users[0].user, users[3].user],
      🔥: [users[2].user]
    },
    statsMap: {
      [users[0].user]: { xp: 1200, level: 15, fama: 500 },
      [users[1].user]: { xp: 850, level: 10, fama: 200 },
      [users[2].user]: { xp: 5000, level: 42, fama: 1500 }
    }
  };
  await seedRoomState(page, roomState);
  
  return {
    users,
    songs,
    history,
    gameId,
    winners,
    bingoCards,
    counts,
    avatars,
    roomState
  };
}

export default {
  clearStorage,
  seedSession,
  seedFestivalState,
  seedPlaylist,
  seedHistory,
  seedBingoSharedState,
  seedBingoWinners,
  seedBingoUserCards,
  seedBingoPermanentCounts,
  seedBingoCurrentGame,
  seedAvatars,
  seedRoomState,
  seedStats,
  seedStandardScenario
};
