/**
 * Global Audio Manager
 *
 * Creates and owns the background Audio element at module-load time.
 *
 * Two playback paths:
 * 1. First visit: Splash screen calls startBackgroundAudio() inside a click handler.
 * 2. Subsequent reloads (splash skipped via sessionStorage): Interaction listeners
 *    catch the first user gesture and call .play() inside the event handler.
 */

import helloVietnam from '@/assets/Hello Vietnam.mp3';

// Create the audio element immediately at module load
const bgAudio = new Audio(helloVietnam);
bgAudio.loop = true;
bgAudio.preload = 'auto';

let isPlaying = false;
let isMutedByUser = false;

const INTERACTION_EVENTS = [
  'click',
  'mousedown',
  'keydown',
  'touchstart',
  'pointerdown',
];

function onFirstInteraction() {
  if (isPlaying || isMutedByUser) return;

  bgAudio
    .play()
    .then(() => {
      isPlaying = true;
      cleanupListeners();
    })
    .catch(() => {
      // Still blocked — keep listeners for the next gesture
    });
}

function cleanupListeners() {
  INTERACTION_EVENTS.forEach((event) => {
    window.removeEventListener(event, onFirstInteraction);
  });
}

function registerListeners() {
  INTERACTION_EVENTS.forEach((event) => {
    window.addEventListener(event, onFirstInteraction);
  });
}

// Register listeners immediately at module load time.
// If the splash screen is shown, startBackgroundAudio() will play first and
// these listeners will be cleaned up. If the splash is skipped (sessionStorage),
// these listeners ensure audio plays on the first user gesture.
registerListeners();

/**
 * Start playing background audio.
 * Called by the splash screen's click handler (valid user gesture).
 */
export function startBackgroundAudio() {
  if (isPlaying || isMutedByUser) return;

  bgAudio
    .play()
    .then(() => {
      isPlaying = true;
      cleanupListeners();
    })
    .catch(() => {
      // Browser still blocked
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
      cleanupListeners();
    })
    .catch(() => {
      // Re-register listeners for next user gesture
      registerListeners();
    });
}

/** Check if audio is currently playing */
export function isBackgroundAudioPlaying() {
  return isPlaying && !bgAudio.paused;
}
