/**
 * Global Audio Manager
 *
 * Background music only plays on the Home page.
 * - Splash screen's click handler calls startBackgroundAudio() (user gesture).
 * - HomePage mounts → resumeBackgroundAudio()
 * - HomePage unmounts → pauseBackgroundAudio()
 * - HeroSection controls mute/unmute via muteBackgroundAudio/unmuteBackgroundAudio.
 */

import helloVietnam from '@/assets/Hello Vietnam.mp3';

// Create the audio element immediately at module load
const bgAudio = new Audio(helloVietnam);
bgAudio.loop = true;
bgAudio.preload = 'auto';

let hasStarted = false; // Whether audio has ever been started (user gesture captured)
let isMutedByUser = false; // Whether user clicked the mute button
let isOnHomePage = false; // Whether we're currently on the home page

/**
 * Start playing background audio.
 * Called by the splash screen's click handler (valid user gesture).
 */
export function startBackgroundAudio() {
  if (isMutedByUser) return;

  bgAudio
    .play()
    .then(() => {
      hasStarted = true;
    })
    .catch(() => {
      // Browser blocked
    });
}

/**
 * Resume audio when entering the Home page.
 * Only plays if audio was previously started and user hasn't muted.
 */
export function resumeBackgroundAudio() {
  isOnHomePage = true;
  if (!hasStarted || isMutedByUser) return;

  bgAudio.play().catch(() => {
    // Autoplay blocked — user needs to interact
  });
}

/**
 * Pause audio when leaving the Home page.
 */
export function pauseBackgroundAudio() {
  isOnHomePage = false;
  bgAudio.pause();
}

/** Mute audio (user clicked speaker icon) */
export function muteBackgroundAudio() {
  isMutedByUser = true;
  bgAudio.pause();
}

/** Unmute audio (user clicked speaker icon) */
export function unmuteBackgroundAudio() {
  isMutedByUser = false;
  if (!isOnHomePage) return;

  bgAudio
    .play()
    .then(() => {
      hasStarted = true;
    })
    .catch(() => {
      // Autoplay blocked
    });
}

/** Check if audio is currently playing */
export function isBackgroundAudioPlaying() {
  return !bgAudio.paused;
}
