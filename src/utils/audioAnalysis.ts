/**
 * VocalFit Audio Analysis — Pure JS DSP
 *
 * Implements:
 * - F0 (Fundamental Frequency) via autocorrelation pitch detection
 * - Jitter (period-to-period variation)
 * - Shimmer (amplitude-to-amplitude variation)
 * - HNR (Harmonics-to-Noise Ratio) via autocorrelation
 *
 * These are simplified implementations suitable for screening.
 * Clinical-grade analysis requires Praat or equivalent.
 */

export interface AcousticAnalysisResult {
  f0Hz: number;
  jitterPercent: number;
  shimmerPercent: number;
  hnrDb: number;
  duration: number;
  isValid: boolean;
  error?: string;
}

/**
 * Run full acoustic analysis on PCM float samples.
 * @param samples Float32Array of audio samples (mono, normalized -1 to 1)
 * @param sampleRate Sample rate in Hz (typically 44100)
 */
export function analyzeVoice(
  samples: Float32Array,
  sampleRate: number
): AcousticAnalysisResult {
  const duration = samples.length / sampleRate;

  if (duration < 1.0) {
    return { f0Hz: 0, jitterPercent: 0, shimmerPercent: 0, hnrDb: 0, duration, isValid: false, error: 'Recording too short (< 1s)' };
  }

  // Trim silence from start/end (threshold: 0.02 RMS)
  const trimmed = trimSilence(samples, 0.02);
  if (trimmed.length < sampleRate * 0.5) {
    return { f0Hz: 0, jitterPercent: 0, shimmerPercent: 0, hnrDb: 0, duration, isValid: false, error: 'Not enough voiced signal detected' };
  }

  // Extract F0 using autocorrelation on overlapping frames
  const frameSize = Math.round(sampleRate * 0.04); // 40ms frames
  const hopSize = Math.round(sampleRate * 0.01);    // 10ms hop
  const f0Estimates: number[] = [];
  const amplitudes: number[] = [];

  for (let start = 0; start + frameSize < trimmed.length; start += hopSize) {
    const frame = trimmed.subarray(start, start + frameSize);
    const f0 = estimateF0Autocorrelation(frame, sampleRate);

    if (f0 > 60 && f0 < 500) {
      f0Estimates.push(f0);
      amplitudes.push(frameRMS(frame));
    }
  }

  if (f0Estimates.length < 5) {
    return { f0Hz: 0, jitterPercent: 0, shimmerPercent: 0, hnrDb: 0, duration, isValid: false, error: 'Could not detect stable pitch' };
  }

  // Median F0 (robust against outliers)
  const f0Hz = median(f0Estimates);

  // Jitter: mean absolute period-to-period difference / mean period
  const periods = f0Estimates.map((f) => 1 / f);
  const jitterPercent = computeJitter(periods);

  // Shimmer: mean absolute amplitude-to-amplitude difference / mean amplitude
  const shimmerPercent = computeShimmer(amplitudes);

  // HNR via autocorrelation
  const hnrDb = computeHNR(trimmed, sampleRate, f0Hz);

  return {
    f0Hz: Math.round(f0Hz * 10) / 10,
    jitterPercent: Math.round(jitterPercent * 1000) / 1000,
    shimmerPercent: Math.round(shimmerPercent * 1000) / 1000,
    hnrDb: Math.round(hnrDb * 10) / 10,
    duration: Math.round(duration * 10) / 10,
    isValid: true,
  };
}

// ─── F0 via Autocorrelation ─────────────────────────────────────
function estimateF0Autocorrelation(frame: Float32Array, sampleRate: number): number {
  const n = frame.length;

  // Apply Hanning window
  const windowed = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    windowed[i] = frame[i] * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1)));
  }

  // Autocorrelation
  const minLag = Math.round(sampleRate / 500); // 500 Hz max
  const maxLag = Math.round(sampleRate / 60);  // 60 Hz min

  let bestLag = minLag;
  let bestCorr = -1;
  const r0 = autocorrelationAt(windowed, 0);

  if (r0 === 0) return 0;

  for (let lag = minLag; lag <= Math.min(maxLag, n - 1); lag++) {
    const r = autocorrelationAt(windowed, lag) / r0;
    if (r > bestCorr) {
      bestCorr = r;
      bestLag = lag;
    }
  }

  // Parabolic interpolation for sub-sample accuracy
  if (bestLag > minLag && bestLag < maxLag && bestCorr > 0.3) {
    const rMinus = autocorrelationAt(windowed, bestLag - 1) / r0;
    const rPlus = autocorrelationAt(windowed, bestLag + 1) / r0;
    const shift = 0.5 * (rMinus - rPlus) / (rMinus - 2 * bestCorr + rPlus);
    if (Math.abs(shift) < 1) {
      return sampleRate / (bestLag + shift);
    }
  }

  return bestCorr > 0.3 ? sampleRate / bestLag : 0;
}

function autocorrelationAt(signal: Float32Array, lag: number): number {
  let sum = 0;
  const n = signal.length - lag;
  for (let i = 0; i < n; i++) {
    sum += signal[i] * signal[i + lag];
  }
  return sum;
}

// ─── Jitter (local, %) ──────────────────────────────────────────
function computeJitter(periods: number[]): number {
  if (periods.length < 2) return 0;
  let sumDiff = 0;
  let sumPeriod = 0;
  for (let i = 1; i < periods.length; i++) {
    sumDiff += Math.abs(periods[i] - periods[i - 1]);
    sumPeriod += periods[i];
  }
  sumPeriod += periods[0];
  const meanPeriod = sumPeriod / periods.length;
  const meanDiff = sumDiff / (periods.length - 1);
  return meanPeriod > 0 ? (meanDiff / meanPeriod) * 100 : 0;
}

// ─── Shimmer (local, %) ─────────────────────────────────────────
function computeShimmer(amplitudes: number[]): number {
  if (amplitudes.length < 2) return 0;
  let sumDiff = 0;
  let sumAmp = 0;
  for (let i = 1; i < amplitudes.length; i++) {
    sumDiff += Math.abs(amplitudes[i] - amplitudes[i - 1]);
    sumAmp += amplitudes[i];
  }
  sumAmp += amplitudes[0];
  const meanAmp = sumAmp / amplitudes.length;
  const meanDiff = sumDiff / (amplitudes.length - 1);
  return meanAmp > 0 ? (meanDiff / meanAmp) * 100 : 0;
}

// ─── HNR via autocorrelation ────────────────────────────────────
function computeHNR(samples: Float32Array, sampleRate: number, f0: number): number {
  if (f0 <= 0) return 0;

  const periodSamples = Math.round(sampleRate / f0);
  const n = Math.min(samples.length, sampleRate * 2); // Analyze up to 2s
  const signal = samples.subarray(0, n);

  const r0 = autocorrelationAt(signal, 0);
  if (r0 === 0) return 0;

  const rT = autocorrelationAt(signal, periodSamples);
  const normalizedR = rT / r0;

  // HNR = 10 * log10(r / (1 - r)) where r is the normalized autocorrelation at T0
  if (normalizedR <= 0 || normalizedR >= 1) return normalizedR > 0.5 ? 30 : 0;
  return 10 * Math.log10(normalizedR / (1 - normalizedR));
}

// ─── Utility ────────────────────────────────────────────────────
function frameRMS(frame: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < frame.length; i++) {
    sum += frame[i] * frame[i];
  }
  return Math.sqrt(sum / frame.length);
}

function trimSilence(samples: Float32Array, threshold: number): Float32Array {
  const frameLen = 1024;
  let start = 0;
  let end = samples.length;

  // Find start
  for (let i = 0; i + frameLen < samples.length; i += frameLen) {
    const rms = frameRMS(samples.subarray(i, i + frameLen));
    if (rms > threshold) { start = i; break; }
  }

  // Find end
  for (let i = samples.length - frameLen; i > start; i -= frameLen) {
    const rms = frameRMS(samples.subarray(i, i + frameLen));
    if (rms > threshold) { end = i + frameLen; break; }
  }

  return samples.subarray(start, end);
}

function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Convert metering dB values to a 0–1 scale for visualization.
 * expo-av metering returns values in dBFS (typically -160 to 0).
 */
export function dbToLinear(db: number): number {
  const clamped = Math.max(-60, Math.min(0, db));
  return (clamped + 60) / 60;
}

/**
 * Decode WAV file buffer to Float32 samples.
 * Supports 16-bit PCM WAV only.
 */
export function decodeWav(buffer: ArrayBuffer): { samples: Float32Array; sampleRate: number } | null {
  const view = new DataView(buffer);

  // Verify RIFF header
  const riff = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
  if (riff !== 'RIFF') return null;

  const wave = String.fromCharCode(view.getUint8(8), view.getUint8(9), view.getUint8(10), view.getUint8(11));
  if (wave !== 'WAVE') return null;

  // Find fmt chunk
  let offset = 12;
  let sampleRate = 44100;
  let bitsPerSample = 16;
  let numChannels = 1;

  while (offset < view.byteLength - 8) {
    const chunkId = String.fromCharCode(
      view.getUint8(offset), view.getUint8(offset + 1),
      view.getUint8(offset + 2), view.getUint8(offset + 3)
    );
    const chunkSize = view.getUint32(offset + 4, true);

    if (chunkId === 'fmt ') {
      numChannels = view.getUint16(offset + 10, true);
      sampleRate = view.getUint32(offset + 12, true);
      bitsPerSample = view.getUint16(offset + 22, true);
    }

    if (chunkId === 'data') {
      const dataOffset = offset + 8;
      const numSamples = chunkSize / (bitsPerSample / 8) / numChannels;
      const samples = new Float32Array(numSamples);

      for (let i = 0; i < numSamples; i++) {
        const byteOffset = dataOffset + i * numChannels * (bitsPerSample / 8);
        if (byteOffset + 1 >= view.byteLength) break;

        if (bitsPerSample === 16) {
          const val = view.getInt16(byteOffset, true);
          samples[i] = val / 32768;
        } else if (bitsPerSample === 32) {
          samples[i] = view.getFloat32(byteOffset, true);
        }
      }

      return { samples, sampleRate };
    }

    offset += 8 + chunkSize;
    if (chunkSize % 2 !== 0) offset++; // Pad byte
  }

  return null;
}
