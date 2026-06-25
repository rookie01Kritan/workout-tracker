// src/hooks/useAudioPlayer.js

import { useState, useRef } from "react";

export default function useAudioPlayer() {
  const audioRef           = useRef(null);
  const [currentId,  setCurrentId]  = useState(null);
  const [isPlaying,  setIsPlaying]  = useState(false);

  // ── cleanupAudio ──────────────────────────────────────────
  // Stop and fully destroy current audio before switching
  function cleanupAudio() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current     = null;
    }
  }

  // ── playExercise ──────────────────────────────────────────
  // Called when user clicks play on a card
  // audioSrc = "http://localhost:5000/audio/filename.mp3"
  //          = "" (no audio attached)
  async function playExercise(id, audioSrc) {

    // Step 1 — Stop whatever is playing
    cleanupAudio();
    setIsPlaying(false);
    setCurrentId(id);

    // Step 2 — No audio attached to this exercise
    if (!audioSrc || audioSrc.trim() === "") {
      console.log("No audio attached to this exercise.");
      return;
    }

    // Step 3 — Create Audio object with backend URL
    const audio  = new Audio(audioSrc);
    audio.loop   = true;

    // Step 4 — Wait for enough data then play
    audio.addEventListener("canplaythrough", () => {
      audio.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error("Playback failed:", err.message);
          setIsPlaying(false);
        });
    }, { once: true });

    // Step 5 — Handle errors
    // Common causes:
    //   - backend not running
    //   - file deleted from downloads/
    //   - wrong URL
    audio.addEventListener("error", (e) => {
      console.error("Audio error — is backend running?", e.target.error);
      setIsPlaying(false);
    });

    // Step 6 — Handle natural end
    audio.addEventListener("ended", () => {
      setIsPlaying(false);
    });

    // Step 7 — Start loading
    audio.load();
    audioRef.current = audio;
  }

  // ── togglePlay ────────────────────────────────────────────
  // Pause or resume current audio
  function togglePlay() {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error("Resume failed:", err.message);
          setIsPlaying(false);
        });
    }
  }

  // ── stopAudio ─────────────────────────────────────────────
  // Fully stop and unload audio
  function stopAudio() {
    cleanupAudio();
    setCurrentId(null);
    setIsPlaying(false);
  }

  return { currentId, isPlaying, playExercise, togglePlay, stopAudio };
}