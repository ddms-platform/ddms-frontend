/**
 * Global Audio Manager
 *
 * Creates and owns the background Audio element at module-load time.
 * Audio playback is triggered explicitly by the splash screen's
 * "enter" button — which is a valid user gesture, satisfying
 * the browser's autoplay policy.
 *
 * HeroSection controls mute/unmute via exported functions.
 */

import helloVietnam from '@/assets/Hello Vietnam.mp3';

// Create the audio element immediately at module load
const bgAudio = new Audio(helloVietnam);
bgAudio.loop = true;
bgAudio.preload = 'auto';

let isPlaying = false;
let isMutedByUser = false;

/**
 * Start playing background audio.
 * MUST be called inside a user gesture event handler (click, keydown, etc.)
 * for the browser to allow playback.
 */
export function startBackgroundAudio() {
  if (isPlaying || isMutedByUser) return;

  bgAudio
    .play()
    .then(() => {
      isPlaying = true;
    })
    .catch(() => {
      // Browser still blocked — nothing we can do
    });
}

/** Pause audio and mark as muted by user */
export function muteBackgroundAudio() {
  isMutedByUser = true;
  bgAudio.pause();
  isPlaying = false;
}

/** Resume audio */
export function unmuteBackgroundAudio() {
  isMutedByUser = false;
  bgAudio
    .play()
    .then(() => {
      isPlaying = true;
    })
    .catch(() => {
      // Autoplay blocked — user needs to interact
    });
}

/** Check if audio is currently playing */
export function isBackgroundAudioPlaying() {
  return isPlaying && !bgAudio.paused;
}
