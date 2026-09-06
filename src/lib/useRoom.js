import { useCallback, useEffect, useRef, useState } from "react";
import { createChannel, mergeUserMaps } from "./sync.js";
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
      avatarsChannelRef.current?.push(next);
      return next;
    });
  }, [user]);

  const [dj, setDj] = useState(null);
  const [waitlist, setWaitlist] = useState([]);
  const [playlist, setPlaylist] = useState(() => readJSON(STORAGE_KEYS.playlist, []));
  const [history, setHistory] = useState(() => readJSON(STORAGE_KEYS.history, []));
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [played, setPlayed] = useState(0); // 0-1 progress for cross-device sync
  const [playedSeconds, setPlayedSeconds] = useState(0); // seconds for seek
  const [messages, setMessages] = useState([]);
  const [trackReactions, setTrackReactions] = useState({});
  const [statsMap, setStatsMap] = useState(() => readJSON(STORAGE_KEYS.stats, {}));
  const [bursts, setBursts] = useState([]);
  
  const channelRef = useRef(null);
  const avatarsChannelRef = useRef(null);
  const statsChannelRef = useRef(null);
  const broadcastRef = useRef(null);
  const burstIdRef = useRef(0);

  const roomStateRef = useRef({
    dj, waitlist, playlist, history, currentTrack, isPlaying, played, playedSeconds,
    messages, trackReactions, statsMap,
  });
  roomStateRef.current = {
    dj, waitlist, playlist, history, currentTrack, isPlaying, played, playedSeconds,
    messages, trackReactions, statsMap,
  };

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      // Canal híbrido de la sala: localStorage (pestañas) + Supabase (fila `room`).
      const channel = createChannel(STORAGE_KEYS.roomState, "room");
      broadcastRef.current = (next) => channel.push(next);

      const snap = channel.snapshot();
      if (!cancelled && snap) {
        if (typeof snap.dj === "string") setDj(snap.dj);
        if (Array.isArray(snap.waitlist)) setWaitlist(snap.waitlist);
        if (Array.isArray(snap.playlist)) setPlaylist(snap.playlist);
        if (Array.isArray(snap.history)) setHistory(snap.history);
        if (snap.currentTrack) setCurrentTrack(snap.currentTrack);
        if (typeof snap.isPlaying === "boolean") setIsPlaying(snap.isPlaying);
        if (typeof snap.played === "number") setPlayed(snap.played);
        if (typeof snap.playedSeconds === "number") setPlayedSeconds(snap.playedSeconds);
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

      // Canal híbrido de avatares (fila `avatars`).
      const avatarsChannel = createChannel(STORAGE_KEYS.avatars, "avatars");
      const snapAv = avatarsChannel.snapshot();
      if (!cancelled && snapAv && Object.keys(snapAv).length) setAvatars(snapAv);
      avatarsChannel.onState((remote) => {
        if (!remote || typeof remote !== "object") return;
        setAvatars((prev) => mergeUserMaps(prev, remote));
      });
      avatarsChannelRef.current = avatarsChannel;

      // Canal híbrido de stats/fama (fila `stats`).
      const statsChannel = createChannel(STORAGE_KEYS.stats, "stats");
      const snapSt = statsChannel.snapshot();
      if (!cancelled && snapSt && Object.keys(snapSt).length) setStatsMap(snapSt);
      statsChannel.onState((remote) => {
        if (!remote || typeof remote !== "object") return;
        setStatsMap((prev) => mergeUserMaps(prev, remote));
      });
      statsChannelRef.current = statsChannel;
    };
    init();
    return () => {
      cancelled = true;
      channelRef.current?.dispose();
      avatarsChannelRef.current?.dispose();
      statsChannelRef.current?.dispose();
    };
  }, [user]);

  
  useEffect(() => { writeJSON(STORAGE_KEYS.playlist, playlist); }, [playlist]);
  useEffect(() => { writeJSON(STORAGE_KEYS.history, history); }, [history]);
  useEffect(() => {
    writeJSON(STORAGE_KEYS.stats, statsMap);
    // Push del mapa de fama completo al canal híbrido (fila `stats`).
    statsChannelRef.current?.push(statsMap);
  }, [statsMap]);

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
    const nextTrack = nextQueue[0] || null;
    setCurrentTrack(nextTrack);
    // Reset position and ensure playback starts on new track
    setPlayed(0);
    setPlayedSeconds(0);
    broadcastRef.current && broadcastRef.current({
      playlist: nextQueue,
      currentTrack: nextTrack,
      isPlaying: true,
      played: 0,
      playedSeconds: 0,
    });

    const nextDj = nextQueue[0]?.addedBy || null;
    if (nextDj && nextDj !== dj) {
      setDj(nextDj);
      broadcastRef.current && broadcastRef.current({ dj: nextDj });
      setStatsMap((prev) => addXp(prev, nextDj, "djSet"));
    }
  }, [currentTrack, dj]);

  const togglePlay = useCallback((forceState) => {
    setIsPlaying((p) => {
      const next = forceState !== undefined ? forceState : !p;
      // Broadcast with current position for accurate sync
      broadcastRef.current && broadcastRef.current({
        isPlaying: next,
        played: roomStateRef.current.played,
        playedSeconds: roomStateRef.current.playedSeconds,
      });
      return next;
    });
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

  // --- Video position sync ---
  // Track progress for cross-device sync (called by react-player onProgress)
  const onProgress = useCallback((state) => {
    const played = state.played ?? 0;
    const playedSeconds = state.playedSeconds ?? 0;
    setPlayed(played);
    setPlayedSeconds(playedSeconds);
    // Throttle broadcast to avoid flooding (every ~2 seconds worth of changes)
    const now = Date.now();
    if (now - (lastProgressBroadcastRef.current || 0) > 2000) {
      lastProgressBroadcastRef.current = now;
      broadcastRef.current && broadcastRef.current({ played, playedSeconds });
    }
  }, []);

  // Handle seek events (called by react-player onSeek)
  const onSeek = useCallback((seconds) => {
    setPlayedSeconds(seconds);
    setPlayed(seconds / (durationRef.current || 1));
    broadcastRef.current && broadcastRef.current({
      playedSeconds: seconds,
      played: seconds / (durationRef.current || 1),
    });
  }, []);

  // Store duration for seek calculations
  const durationRef = useRef(0);
  const onDuration = useCallback((duration) => {
    durationRef.current = duration;
  }, []);

  // Track last progress broadcast time for throttling
  const lastProgressBroadcastRef = useRef(0);

  const awardXp = useCallback((eventType) => {
    setStatsMap((prev) => addXp(prev, user, eventType));
  }, [user]);

  return {
    user, isAdmin, avatars, saveAvatar,
    dj, setDj, waitlist, joinCabina, leaveCabina, ejectFromCabina, rotateCabina,
    playlist, setPlaylist, history, setHistory,
    currentTrack, setCurrentTrack, isPlaying, setIsPlaying, togglePlay, playNext,
    played, playedSeconds, onProgress, onSeek, onDuration,
    addSong, removeSong,
    sendMessage, messages, trackReactions, react,
    reactionsTotal: Object.values(trackReactions).reduce((s, u) => s + u.length, 0),
    statsMap, awardXp, bursts,
  };
}

export { readJSON, writeJSON };




