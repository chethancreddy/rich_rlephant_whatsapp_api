// ============================================================================
// Voice Message Audio Recording & Encoding Engine
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

export type RecordingState = 'idle' | 'recording' | 'paused' | 'previewing' | 'uploading' | 'sent' | 'error';

export interface AudioRecordingResult {
  blob: Blob;
  mimeType: string;
  durationSeconds: number;
  previewUrl: string;
}

/**
 * Detects best supported WhatsApp-compatible audio MIME type in the current browser
 */
export function getSupportedAudioMimeType(): string {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
    return 'audio/ogg; codecs=opus';
  }

  // Meta WhatsApp Cloud API prefers OGG/Opus for voice notes
  const candidateTypes = [
    'audio/ogg; codecs=opus',
    'audio/ogg',
    'audio/webm; codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/aac',
  ];

  for (const type of candidateTypes) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return '';
}

/**
 * Validates audio file size and duration against Meta WhatsApp Cloud API constraints
 * Meta limits audio files to 16 MB.
 */
export function validateWhatsAppAudio(blob: Blob, durationSeconds: number): { valid: boolean; error?: string } {
  const MAX_SIZE_BYTES = 16 * 1024 * 1024; // 16 MB

  if (blob.size === 0) {
    return { valid: false, error: 'Recorded audio file is empty (0 bytes).' };
  }

  if (blob.size > MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: `Audio size (${(blob.size / (1024 * 1024)).toFixed(2)} MB) exceeds Meta's 16 MB limit.`,
    };
  }

  if (durationSeconds < 1) {
    return { valid: false, error: 'Voice message is too short (minimum 1 second required).' };
  }

  return { valid: true };
}

