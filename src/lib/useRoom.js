import { useCallback, useEffect, useRef, useState } from "react";
import { createLocalChannel } from "./sync.js";
import { STORAGE_KEYS } from "./constants.js";
import { createChatMessage, pushMessage, systemMessage } from "./chat-core.js";
import { joinWaitlist, leaveWaitlist, rotateWaitlist } from "./waitlist-core.js";

const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Error saving:", key, e);
  }
};

/**
 * useRoom — estado social compartido de la sala del festival.
 * El host (admin) es el animo de la partida; los invitados celebran.
 */
export function useRoom(session) {
  const user = session?.user ?? "Anónimo";
  const isAdmin = session?.role === "admin";
  const [avatars, setAvatars] = useState(() => readJSON(STORAGE_KEYS.avatars, {}));
  const saveAvatar = useCallback((cfg) => {
    setAvatars((prev) => {
      const next = { ...prev, [user]: cfg };
      const all = readJSON(STORAGE_KEYS.avatars, {});
      writeJSON(STORAGE_KEYS.avatars, { ...all, ...next });
      return next;
    });
  }, [user]);

  const [dj, setDj] = useState(null);
  const [waitlist, setWaitlist] = useState([]);
  const [playlist, setPlaylist] = useState(() => readJSON(STORAGE_KEYS.playlist, []));
  const [history, setHistory] = useState(() => readJSON(STORAGE_KEYS.history, []));
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [messages, setMessages] = useState([]);
  const [trackReactions, setTrackReactions] = useState({});
  const [statsMap, setStatsMap] = useState(() => readJSON(STORAGE_KEYS.stats, {}));
  const [bursts, setBursts] = useState([]);
  
  const channelRef = useRef(null);
  const broadcastRef = useRef(null);
  const burstIdRef = useRef(0);

  const roomStateRef = useRef({
    dj, waitlist, playlist, history, currentTrack, isPlaying,
    messages, trackReactions, statsMap,
  });
  roomStateRef.current = {
    dj, waitlist, playlist, history, currentTrack, isPlaying,
    messages, trackReactions, statsMap,
  };

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      const channel = await createLocalChannel(STORAGE_KEYS.roomState);
      broadcastRef.current = (next) => channel.push(next);

      const snap = channel.snapshot();
      if (!cancelled && snap) {
        if (typeof snap.dj === "string") setDj(snap.dj);
        if (Array.isArray(snap.waitlist)) setWaitlist(snap.waitlist);
        if (Array.isArray(snap.playlist)) setPlaylist(snap.playlist);
        if (Array.isArray(snap.history)) setHistory(snap.history);
        if (snap.currentTrack) setCurrentTrack(snap.currentTrack);
        if (typeof snap.isPlaying === "boolean") setIsPlaying(snap.isPlaying);
        if (Array.isArray(snap.messages)) setMessages(snap.messages);
        if (snap.trackReactions) setTrackReactions(snap.trackReactions);
        if (snap.statsMap) setStatsMap(snap.statsMap);
      }

      channel.onState((state) => {
        if (state.__origin === user) return; // no aplicar loop local
        if (typeof state.dj === "string") setDj(state.dj);
        if (Array.isArray(state.waitlist)) setWaitlist(state.waitlist);
        if (Array.isArray(state.playlist)) setPlaylist(state.playlist);
        if (Array.isArray(state.history)) setHistory(state.history);
        if (state.currentTrack) setCurrentTrack(state.currentTrack);
        if (typeof state.isPlaying === "boolean") setIsPlaying(state.isPlaying);
        if (Array.isArray(state.messages)) setMessages(state.messages);
        if (state.trackReactions) setTrackReactions(state.trackReactions);
        if (state.statsMap) setStatsMap(state.statsMap);
      });

      channelRef.current = channel;
    };
    init();
    return () => { cancelled = true; channelRef.current?.dispose(); };
  }, [user]);

  
  useEffect(() => { writeJSON(STORAGE_KEYS.playlist, playlist); }, [playlist]);
  useEffect(() => { writeJSON(STORAGE_KEYS.history, history); }, [history]);
  useEffect(() => { writeJSON(STORAGE_KEYS.stats, statsMap); }, [statsMap]);

  // --- Chat ---
  const sendMessage = useCallback((text) => {
    const msg = createChatMessage({ user, text });
    setMessages((prev) => pushMessage(prev, msg));
    broadcastRef.current && broadcastRef.current({ messages: pushMessage(roomStateRef.current.messages, msg) });
  }, [user]);

  const react = useCallback((emoji) => {
    setTrackReactions((prev) => {
      const users = prev[emoji] || [];
      const nextUsers = users.includes(user) ? users : [...users, user];
      const next = { ...prev, [emoji]: nextUsers };
      broadcastRef.current && broadcastRef.current({ trackReactions: next });
      const id = ++burstIdRef.current;
      setBursts((b) => [...b, { id, emoji }]);
      setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 1500);
      if (currentTrack && dj) {
        setStatsMap((prev) => addXp(prev, dj, "reactionReceived"));
      }
      return next;
    });
  }, [user, dj, currentTrack]);

  // --- Lista de espera / cabina ---
  const joinCabina = useCallback(() => {
    const next = joinWaitlist(roomStateRef.current.waitlist, user);
    setWaitlist(next);
    broadcastRef.current && broadcastRef.current({ waitlist: next });
    broadcastRef.current && broadcastRef.current({ messages: pushMessage(roomStateRef.current.messages, systemMessage(`${user} entro en la cola`)) });
  }, [user]);

  const leaveCabina = useCallback(() => {
    const next = leaveWaitlist(roomStateRef.current.waitlist, user);
    const nextDj = next[0] || null;
    setWaitlist(next);
    setDj(nextDj);
    broadcastRef.current && broadcastRef.current({ waitlist: next, dj: nextDj });
  }, [user]);

  const ejectFromCabina = useCallback((targetUser) => {
    if (!isAdmin) return;
    const next = leaveWaitlist(roomStateRef.current.waitlist, targetUser);
    const nextDj = next[0] || null;
    setWaitlist(next);
    if (dj === targetUser) setDj(nextDj);
    broadcastRef.current && broadcastRef.current({ waitlist: next, dj: nextDj });
  }, [isAdmin, dj]);


  
  const rotateCabina = useCallback(() => {
    if (!isAdmin) return;
    const [nextList, nextDj] = rotateWaitlist(roomStateRef.current.waitlist);
    const newPlaylist = roomStateRef.current.playlist;
    setWaitlist(nextList);
    setDj(nextDj);
    setCurrentTrack(newPlaylist[0] || null);
    broadcastRef.current && broadcastRef.current({ waitlist: nextList, dj: nextDj, currentTrack: newPlaylist[0] || null });

    if (nextDj) {
      const front = newPlaylist.filter((t) => t.addedBy === nextDj);
      const rest = newPlaylist.filter((t) => t.addedBy !== nextDj);
      setPlaylist([...front, ...rest]);
      broadcastRef.current && broadcastRef.current({ playlist: [...front, ...rest] });
      setStatsMap((prev) => addXp(prev, nextDj, "djSet"));
    }
  }, [isAdmin]);

  // --- Canciones ---
  const addSong = useCallback(
    async (url) => {
      if (!url || !url.trim()) return;
      if (user === dj || isAdmin) {
        if (!/^https?:\/\//.test(url) || url.includes("<")) return;
        const newSong = { url: url.trim(), id: crypto.randomUUID(), title: url.trim(), addedBy: user };
        setPlaylist((prev) => [...prev, newSong]);
        broadcastRef.current && broadcastRef.current({ playlist: [...roomStateRef.current.playlist, newSong] });
        if (!currentTrack) setCurrentTrack(newSong);
        setStatsMap((prev) => addXp(prev, user, "songAdded"));
      }
    },
    [user, dj, isAdmin, currentTrack],
  );

  const playNext = useCallback(() => {
    if (!currentTrack) return;
    setHistory((prev) => [currentTrack, ...prev].slice(0, 20));
    broadcastRef.current && broadcastRef.current({ history: [currentTrack, ...roomStateRef.current.history].slice(0, 20) });
    const nextQueue = roomStateRef.current.playlist.filter((t) => t.id !== currentTrack.id);
    setPlaylist(nextQueue);
    setCurrentTrack(nextQueue[0] || null);
    broadcastRef.current && broadcastRef.current({ playlist: nextQueue, currentTrack: nextQueue[0] || null });

    const nextDj = nextQueue[0]?.addedBy || null;
    if (nextDj && nextDj !== dj) {
      setDj(nextDj);
      broadcastRef.current && broadcastRef.current({ dj: nextDj });
      setStatsMap((prev) => addXp(prev, nextDj, "djSet"));
    }
  }, [currentTrack, dj]);

  const togglePlay = useCallback(() => {
    setIsPlaying((p) => !p);
    broadcastRef.current && broadcastRef.current({ isPlaying: !roomStateRef.current.isPlaying });
  }, []);

    
  const removeSong = useCallback((id) => {
    if (!(user === dj || isAdmin)) return;
    const next = roomStateRef.current.playlist.filter((t) => t.id !== id);
    setPlaylist(next);
    broadcastRef.current && broadcastRef.current({ playlist: next });
    if (currentTrack?.id === id) setCurrentTrack(next[0] || null);
  }, [user, dj, isAdmin, currentTrack]);

  // Mueve una canción al frente de la cola (solo DJ/host).
  const moveUp = useCallback((id) => {
    if (!(user === dj || isAdmin)) return;
    const list = roomStateRef.current.playlist;
    const idx = list.findIndex((t) => t.id === id);
    if (idx <= 0) return;
    const [song] = list.splice(idx, 1);
    const next = [song, ...list];
    setPlaylist(next);
    broadcastRef.current && broadcastRef.current({ playlist: next });
  }, [user, dj, isAdmin]);

  const awardXp = useCallback((eventType) => {
    setStatsMap((prev) => addXp(prev, user, eventType));
  }, [user]);

  return {
    user, isAdmin, avatars, saveAvatar,
    dj, setDj, waitlist, joinCabina, leaveCabina, ejectFromCabina, rotateCabina,
    playlist, setPlaylist, history, setHistory,
    currentTrack, setCurrentTrack, isPlaying, setIsPlaying, togglePlay, playNext,
    addSong, removeSong,
    sendMessage, messages, trackReactions, react,
    reactionsTotal: Object.values(trackReactions).reduce((s, u) => s + u.length, 0),
    statsMap, awardXp, bursts,
  };
}

export { readJSON, writeJSON };




