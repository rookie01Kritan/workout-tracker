// src/hooks/useAudioPlayer.js

import { useState, useRef } from "react";

const YT_API_URL = "https://www.youtube.com/iframe_api";
let ytApiPromise = null;

// ── Load YouTube's IFrame API once, reuse for every play ──────
function loadYouTubeAPI() {
  if (ytApiPromise) return ytApiPromise;

  ytApiPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve(window.YT);
      return;
    }

    const existingCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (existingCallback) existingCallback();
      resolve(window.YT);
    };

    if (!document.querySelector(`script[src="${YT_API_URL}"]`)) {
      const script = document.createElement("script");
      script.src = YT_API_URL;
      document.head.appendChild(script);
    }
  });

  return ytApiPromise;
}

// ── Hidden container the YouTube player attaches to ────────────
// 1x1px, off-screen — video technically plays, but invisible.
function getOrCreateYTContainer() {
  let container = document.getElementById("hidden-yt-audio-player");
  if (!container) {
    container = document.createElement("div");
    container.id = "hidden-yt-audio-player";
    container.style.position      = "fixed";
    container.style.width         = "1px";
    container.style.height        = "1px";
    container.style.opacity       = "0";
    container.style.pointerEvents = "none";
    container.style.bottom        = "0";
    container.style.left          = "0";
    document.body.appendChild(container);
  }
  return container;
}

export default function useAudioPlayer() {
  const audioRef      = useRef(null); // HTMLAudioElement OR a YT.Player instance
  const sourceTypeRef = useRef(null); // "file" | "youtube"
  const [currentId, setCurrentId] = useState(null);
  const [isPlaying,  setIsPlaying]  = useState(false);

  // ── cleanupAudio ──────────────────────────────────────────
  function cleanupAudio() {
    if (audioRef.current) {
      if (sourceTypeRef.current === "youtube") {
        try {
          audioRef.current.stopVideo();
          audioRef.current.destroy();
        } catch (err) {
          // player may already be gone — safe to ignore
        }
      } else {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      audioRef.current = null;
    }
    sourceTypeRef.current = null;
  }

  // ── playExercise ──────────────────────────────────────────
  // audioSrc can be:
  //   ""                     → no audio
  //   "youtube:VIDEO_ID"     → play via YouTube IFrame API
  //   "https://.../file.mp3" → play via normal <audio>
  async function playExercise(id, audioSrc) {
    cleanupAudio();
    setIsPlaying(false);
    setCurrentId(id);

    if (!audioSrc || audioSrc.trim() === "") {
      console.log("No audio attached to this exercise.");
      return;
    }

    // ── YouTube source ────────────────────────────────────
    if (audioSrc.startsWith("youtube:")) {
      const videoId = audioSrc.replace("youtube:", "");
      sourceTypeRef.current = "youtube";

      const YT = await loadYouTubeAPI();
      const container = getOrCreateYTContainer();
      container.innerHTML = "";
      const playerDiv = document.createElement("div");
      container.appendChild(playerDiv);

      const player = new YT.Player(playerDiv, {
        height: "1",
        width:  "1",
        videoId,
        playerVars: {
          autoplay: 1,
          loop:     1,
          playlist: videoId, // required by YouTube for single-video looping
        },
        events: {
          onReady: (event) => {
            event.target.playVideo();
            setIsPlaying(true);
          },
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.ENDED) {
              setIsPlaying(false);
            }
          },
          onError: (event) => {
            console.error("YouTube playback error:", event.data);
            setIsPlaying(false);
          },
        },
      });

      audioRef.current = player;
      return;
    }

    // ── Uploaded file source ───────────────────────────────
    sourceTypeRef.current = "file";
    const audio = new Audio(audioSrc);
    audio.loop  = true;

    audio.addEventListener("canplaythrough", () => {
      audio.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error("Playback failed:", err.message);
          setIsPlaying(false);
        });
    }, { once: true });

    audio.addEventListener("error", (e) => {
      console.error("Audio error — is backend running?", e.target.error);
      setIsPlaying(false);
    });

    audio.addEventListener("ended", () => {
      setIsPlaying(false);
    });

    audio.load();
    audioRef.current = audio;
  }

  // ── togglePlay ────────────────────────────────────────────
  function togglePlay() {
    if (!audioRef.current) return;

    if (sourceTypeRef.current === "youtube") {
      if (isPlaying) {
        audioRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        audioRef.current.playVideo();
        setIsPlaying(true);
      }
      return;
    }

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
  function stopAudio() {
    cleanupAudio();
    setCurrentId(null);
    setIsPlaying(false);
  }

  return { currentId, isPlaying, playExercise, togglePlay, stopAudio };
}