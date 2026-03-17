/**
 * useAudioRecorder — reusable hook for microphone recording with expo-av
 *
 * Features:
 * - Permission handling
 * - Start / stop / reset recording
 * - Live metering callback (dB level for VU meter)
 * - Access to recording URI for analysis
 * - Duration tracking
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { Audio } from 'expo-av';

export interface RecorderState {
  isRecording: boolean;
  isPrepared: boolean;
  durationMs: number;
  meteringDb: number;      // Current dB level (dBFS, -160 to 0)
  uri: string | null;      // File URI after recording stops
  error: string | null;
}

interface UseAudioRecorderOptions {
  onMeteringUpdate?: (db: number) => void;
  meteringInterval?: number;  // ms, default 100
}

export function useAudioRecorder(options: UseAudioRecorderOptions = {}) {
  const { onMeteringUpdate, meteringInterval = 100 } = options;

  const [state, setState] = useState<RecorderState>({
    isRecording: false,
    isPrepared: false,
    durationMs: 0,
    meteringDb: -160,
    uri: null,
    error: null,
  });

  const recordingRef = useRef<Audio.Recording | null>(null);
  const meteringRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const durationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (meteringRef.current) clearInterval(meteringRef.current);
      if (durationRef.current) clearInterval(durationRef.current);
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        setState((s) => ({ ...s, error: 'Microphone permission denied' }));
        return false;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      return true;
    } catch (err) {
      setState((s) => ({ ...s, error: 'Failed to request permissions' }));
      return false;
    }
  }, []);

  const startRecording = useCallback(async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    try {
      // Configure recording with metering enabled
      const recordingOptions: Audio.RecordingOptions = {
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        android: {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY.android,
          extension: '.wav',
          outputFormat: 6,    // AudioEncoder.DEFAULT gives PCM on some devices
          audioEncoder: 0,
        },
        ios: {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY.ios,
          extension: '.wav',
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.MAX,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 705600,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/wav',
          bitsPerSecond: 705600,
        },
        isMeteringEnabled: true,
      };

      const { recording } = await Audio.Recording.createAsync(recordingOptions);
      recordingRef.current = recording;
      startTimeRef.current = Date.now();

      setState((s) => ({
        ...s,
        isRecording: true,
        isPrepared: true,
        durationMs: 0,
        meteringDb: -160,
        uri: null,
        error: null,
      }));

      // Duration timer
      durationRef.current = setInterval(() => {
        setState((s) => ({
          ...s,
          durationMs: Date.now() - startTimeRef.current,
        }));
      }, 100);

      // Metering timer
      meteringRef.current = setInterval(async () => {
        if (!recordingRef.current) return;
        try {
          const status = await recordingRef.current.getStatusAsync();
          if (status.isRecording && status.metering !== undefined) {
            const db = status.metering;
            setState((s) => ({ ...s, meteringDb: db }));
            if (onMeteringUpdate) onMeteringUpdate(db);
          }
        } catch {}
      }, meteringInterval);

    } catch (err) {
      setState((s) => ({ ...s, error: 'Failed to start recording' }));
    }
  }, [requestPermission, onMeteringUpdate, meteringInterval]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    if (meteringRef.current) { clearInterval(meteringRef.current); meteringRef.current = null; }
    if (durationRef.current) { clearInterval(durationRef.current); durationRef.current = null; }

    if (!recordingRef.current) return null;

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      setState((s) => ({
        ...s,
        isRecording: false,
        uri: uri || null,
        meteringDb: -160,
      }));

      return uri || null;
    } catch (err) {
      setState((s) => ({ ...s, error: 'Failed to stop recording', isRecording: false }));
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isRecording: false,
      isPrepared: false,
      durationMs: 0,
      meteringDb: -160,
      uri: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    startRecording,
    stopRecording,
    reset,
  };
}
