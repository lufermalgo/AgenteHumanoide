import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { detectBrowserCapabilities } from '../../utils/browserCapabilities';

const RecorderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${theme.spacing.lg};
  background: ${theme.colors.backgroundCard};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
`;

const RecordButton = styled.button<{ isRecording: boolean; disabled: boolean }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid ${props => 
    props.disabled ? theme.colors.lightGray :
    props.isRecording ? '#ff4444' : theme.colors.primary
  };
  background: ${props => 
    props.disabled ? theme.colors.lightGray :
    props.isRecording ? '#ff4444' : theme.colors.primary
  };
  color: white;
  font-size: 2rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: ${props => props.disabled ? 'none' : 'scale(1.05)'};
  }

  &:active {
    transform: ${props => props.disabled ? 'none' : 'scale(0.95)'};
  }

  ${props => props.isRecording && `
    animation: pulse 1.5s infinite;
    
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(255, 68, 68, 0.7); }
      70% { box-shadow: 0 0 0 20px rgba(255, 68, 68, 0); }
      100% { box-shadow: 0 0 0 0 rgba(255, 68, 68, 0); }
    }
  `}
`;

const StatusText = styled.div`
  margin-top: ${theme.spacing.md};
  font-size: ${theme.typography.fontSizes.md};
  font-weight: ${theme.typography.fontWeights.medium};
  color: ${theme.colors.text};
  text-align: center;
`;

const TimerText = styled.div`
  margin-top: ${theme.spacing.sm};
  font-size: ${theme.typography.fontSizes.lg};
  font-weight: ${theme.typography.fontWeights.bold};
  color: ${theme.colors.primary};
  font-family: 'Courier New', monospace;
`;

const TranscriptionText = styled.div`
  margin-top: ${theme.spacing.lg};
  padding: ${theme.spacing.md};
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.md};
  border: 2px dashed ${theme.colors.lightGray};
  min-height: 60px;
  max-width: 400px;
  font-size: ${theme.typography.fontSizes.md};
  color: ${theme.colors.text};
  line-height: 1.4;
  
  &:empty::before {
    content: 'Tu transcripción aparecerá aquí...';
    color: ${theme.colors.textLight};
    font-style: italic;
  }
`;

const ErrorMessage = styled.div`
  margin-top: ${theme.spacing.md};
  padding: ${theme.spacing.sm};
  background: ${theme.colors.error};
  color: white;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSizes.sm};
  text-align: center;
`;

const AudioVisualizer = styled.div<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: ${theme.spacing.md} 0;
  height: 40px;
  opacity: ${props => props.isActive ? 1 : 0.3};
  transition: opacity 0.3s ease;
`;

const VisualizerBar = styled.div<{ height: number }>`
  width: 3px;
  background: ${theme.colors.primary};
  margin: 0 1px;
  border-radius: 2px;
  height: ${props => Math.max(2, props.height)}px;
  transition: height 0.1s ease;
`;

export type RecordingEngine = 'web' | 'gemini';

export interface VoiceRecorderProps {
  engine: RecordingEngine;
  onTranscription: (text: string, confidence?: number) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  maxDuration?: number; // en segundos
  autoStop?: boolean; // detener automáticamente por silencio
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  engine = 'web',
  onTranscription,
  onRecordingStart,
  onRecordingStop,
  onError,
  disabled = false,
  maxDuration = 60,
  autoStop = true
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(20).fill(0));

  // Referencias
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const visualizerRef = useRef<NodeJS.Timeout | null>(null);

  const capabilities = detectBrowserCapabilities();

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      stopRecording();
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (visualizerRef.current) {
      clearInterval(visualizerRef.current);
      visualizerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      speechRecognitionRef.current = null;
    }
  };

  const startTimer = () => {
    setDuration(0);
    timerRef.current = setInterval(() => {
      setDuration(prev => {
        const newDuration = prev + 1;
        if (newDuration >= maxDuration) {
          stopRecording();
        }
        return newDuration;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startAudioVisualization = (stream: MediaStream) => {
    try {
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVisualizer = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calcular niveles de audio para visualización
        const levels = [];
        const step = Math.floor(bufferLength / 20);
        
        for (let i = 0; i < 20; i++) {
          const start = i * step;
          const end = start + step;
          let sum = 0;
          
          for (let j = start; j < end && j < bufferLength; j++) {
            sum += dataArray[j];
          }
          
          const average = sum / step;
          levels.push(Math.floor((average / 255) * 30)); // Escalar a altura máxima de 30px
        }
        
        setAudioLevels(levels);
      };

      visualizerRef.current = setInterval(updateVisualizer, 100);
    } catch (err) {
      console.warn('No se pudo inicializar visualización de audio:', err);
    }
  };

  const startWebSpeechRecognition = () => {
    if (!capabilities.hasSpeechRecognition) {
      throw new Error('Web Speech API no soportada en este navegador');
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    speechRecognitionRef.current = new SpeechRecognition();
    
    const recognition = speechRecognitionRef.current;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-ES';

    let silenceTimer: NodeJS.Timeout | null = null;
    let finalTranscript = '';

    recognition.onresult = (event) => {
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      const fullTranscript = finalTranscript + interimTranscript;
      setTranscription(fullTranscript);

      // Reiniciar timer de silencio
      if (silenceTimer) clearTimeout(silenceTimer);
      
      if (autoStop && finalTranscript.trim()) {
        silenceTimer = setTimeout(() => {
          stopRecording();
        }, 2000); // 2 segundos de silencio
      }
    };

    recognition.onerror = (event) => {
      console.error('Error en Speech Recognition:', event.error);
      const errorMessage = `Error de reconocimiento: ${event.error}`;
      setError(errorMessage);
      onError?.(errorMessage);
    };

    recognition.onend = () => {
      if (silenceTimer) clearTimeout(silenceTimer);
      
      if (finalTranscript.trim()) {
        onTranscription(finalTranscript.trim());
      }
    };

    recognition.start();
  };

  const startRecording = async () => {
    if (disabled || isRecording) return;

    try {
      setError(null);
      setTranscription('');
      setIsRecording(true);
      onRecordingStart?.();

      // Obtener stream de audio
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      streamRef.current = stream;
      startTimer();
      startAudioVisualization(stream);

      if (engine === 'web') {
        startWebSpeechRecognition();
      } else {
        // TODO: Implementar Gemini Live API
        throw new Error('Gemini Live API no implementado aún');
      }

    } catch (err: any) {
      console.error('Error iniciando grabación:', err);
      const errorMessage = err.message || 'Error al iniciar grabación';
      setError(errorMessage);
      onError?.(errorMessage);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (!isRecording) return;

    setIsRecording(false);
    stopTimer();
    onRecordingStop?.();

    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    }

    cleanup();
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    if (disabled) return 'Grabación deshabilitada';
    if (isRecording) return 'Grabando... Habla ahora';
    return 'Haz clic para grabar tu respuesta';
  };

  const getButtonIcon = () => {
    if (disabled) return '🚫';
    if (isRecording) return '⏹️';
    return '🎙️';
  };

  return (
    <RecorderContainer>
      <RecordButton
        onClick={toggleRecording}
        isRecording={isRecording}
        disabled={disabled}
        title={getStatusText()}
      >
        {getButtonIcon()}
      </RecordButton>

      <StatusText>{getStatusText()}</StatusText>

      {isRecording && (
        <TimerText>{formatDuration(duration)} / {formatDuration(maxDuration)}</TimerText>
      )}

      <AudioVisualizer isActive={isRecording}>
        {audioLevels.map((level, index) => (
          <VisualizerBar key={index} height={level} />
        ))}
      </AudioVisualizer>

      {transcription && (
        <TranscriptionText>{transcription}</TranscriptionText>
      )}

      {error && (
        <ErrorMessage>{error}</ErrorMessage>
      )}
    </RecorderContainer>
  );
};

export default VoiceRecorder;