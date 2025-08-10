import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AgentContext, NameAnalysis, generate_agent_response } from '../../services/context';

interface Props {
  onTranscriptionComplete: (text: string) => void;
  questionText?: string;
  userName?: string;
  agentContext?: AgentContext | null;
  onNamePreferenceSet?: (newPreferredName: string) => void;
  nameAnalysis?: NameAnalysis | null;
  onListeningChange?: (isListening: boolean) => void;
  onSpeakingChange?: (isSpeaking: boolean) => void;
}

const AssessmentAudio: React.FC<Props> = ({ 
  onTranscriptionComplete, 
  questionText, 
  userName,
  agentContext,
  onNamePreferenceSet,
  nameAnalysis,
  onListeningChange,
  onSpeakingChange
}) => {
  const [started, setStarted] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [phase, setPhase] = useState<'idle' | 'speaking' | 'listening' | 'processing' | 'followup'>('idle');
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const stopRequestedRef = useRef<boolean>(false);
  const rafIdRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const prefetchedUrlRef = useRef<string | null>(null);
  const prefetchedReadyRef = useRef<boolean>(false);
  const lastTranscriptRef = useRef<string>('');
  const timerRef = useRef<number | null>(null);
  const lastEndSpeakMsRef = useRef<number>(0);

  // Función para generar y reproducir respuesta dinámica
  const generateAndSpeak = useCallback(async (
    situation: 'greeting' | 'name_preference' | 'name_confirmation' | 'add_more' | 'question_intro',
    userInput?: string
  ) => {
    if (!agentContext) return;
    
    try {
      setStatus('Generando respuesta...');
      
      // Generar respuesta dinámica usando Gemini
      const response = await generate_agent_response(
        agentContext,
        situation,
        userInput,
        userName,
        questionText
      );
      
      // Reproducir la respuesta generada
      const resp = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: response, 
          voiceName: agentContext.voices.defaultVoice 
        }),
      });
      
      if (resp.ok) {
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        
        setStatus('Hablando…');
        onSpeakingChange?.(true);
        
        await audio.play();
        
        audio.onended = () => {
          URL.revokeObjectURL(url);
          onSpeakingChange?.(false);
          setStatus('');
        };
        
        return response;
      }
    } catch (error) {
      console.error('Error generating/speaking response:', error);
      setStatus('');
      onSpeakingChange?.(false);
    }
  }, [agentContext, userName, questionText, onSpeakingChange]);

  // Precalentar TTS (reduce cold start): preparar introducción + pregunta
  useEffect(() => {
    const warmup = async () => {
      if (!agentContext) return;
      
      try {
        // Generar saludo inicial dinámico
        const greetingResponse = await generate_agent_response(
          agentContext,
          'greeting',
          undefined,
          userName,
          questionText
        );
        
        const resp = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: greetingResponse, 
            voiceName: agentContext.voices.defaultVoice 
          }),
        });
        if (resp.ok) {
          const blob = await resp.blob();
          const url = URL.createObjectURL(blob);
          prefetchedUrlRef.current = url;
          prefetchedReadyRef.current = true;
        }
      } catch (error) {
        console.error('Error in TTS warmup:', error);
      }
    };
    warmup();
  }, [agentContext, questionText, userName]);

  const runCycle = useCallback(async () => {
    if (!agentContext) return;
    
    try {
      setStarted(true);
      setPhase('speaking');
      setStatus('Hablando…');
      onSpeakingChange?.(true);

      // Garantizar gesto de usuario: crear/resumir AudioContext aquí
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // Saludo inicial dinámico
      let greetingText = '';
      if (prefetchedUrlRef.current) {
        // Usar prefetched si está listo
        const audio = new Audio(prefetchedUrlRef.current);
        await audio.play();
        audio.onended = () => {
          URL.revokeObjectURL(prefetchedUrlRef.current!);
          prefetchedUrlRef.current = null;
          prefetchedReadyRef.current = false;
        };
      } else {
        // Generar y reproducir saludo dinámico
        greetingText = await generateAndSpeak('greeting');
      }

      // Si necesita preguntar preferencia de nombre
      if (nameAnalysis?.needsAsk) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa natural
        await generateAndSpeak('name_preference');
      } else {
        // Ir directamente a la pregunta
        await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa natural
        await generateAndSpeak('question_intro');
      }

      // Continuar con el ciclo de escucha...
      setPhase('listening');
      setStatus('Escuchando…');
      onSpeakingChange?.(false);
      onListeningChange?.(true);

      // Configurar grabación de audio
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      let silenceStart = 0;
      let isRecording = false;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (chunks.length === 0) return;

        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        
        reader.onload = async () => {
          const base64 = (reader.result as string).split(',')[1];
          
          try {
            setPhase('processing');
            setStatus('Procesando…');
            onListeningChange?.(false);

            const resp = await fetch('/api/stt', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioBase64: base64, mimeType: 'audio/webm' }),
            });

            if (resp.ok) {
              const { text } = await resp.json();
              lastTranscriptRef.current = text;
              
              // Procesar la transcripción
              if (nameAnalysis?.needsAsk && phase === 'listening') {
                // Detectar preferencia de nombre
                const preferredName = extractPreferredName(text, nameAnalysis.firstNames);
                if (preferredName) {
                  onNamePreferenceSet?.(preferredName);
                  await generateAndSpeak('name_confirmation', preferredName);
                  setPhase('idle');
                  return;
                }
              } else {
                // Respuesta normal a pregunta
                onTranscriptionComplete(text);
                
                // Preguntar si quiere agregar más
                await new Promise(resolve => setTimeout(resolve, 500));
                await generateAndSpeak('add_more');
                
                // Escuchar respuesta adicional
                setPhase('followup');
                setStatus('Escuchando respuesta adicional…');
                onListeningChange?.(true);
                
                // Configurar grabación para follow-up
                const followupStream = await navigator.mediaDevices.getUserMedia({
                  audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
                });
                
                const followupRecorder = new MediaRecorder(followupStream);
                const followupChunks: Blob[] = [];
                
                followupRecorder.ondataavailable = (event) => {
                  if (event.data.size > 0) {
                    followupChunks.push(event.data);
                  }
                };
                
                followupRecorder.onstop = async () => {
                  if (followupChunks.length === 0) {
                    setPhase('idle');
                    return;
                  }
                  
                  const followupBlob = new Blob(followupChunks, { type: 'audio/webm' });
                  const followupReader = new FileReader();
                  
                  followupReader.onload = async () => {
                    const followupBase64 = (followupReader.result as string).split(',')[1];
                    
                    try {
                      const followupResp = await fetch('/api/stt', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ audioBase64: followupBase64, mimeType: 'audio/webm' }),
                      });
                      
                      if (followupResp.ok) {
                        const { text: followupText } = await followupResp.json();
                        
                        // Verificar si es un "no"
                        const isNo = agentContext.questionFlow.afterAnswer.interpretNo.some(
                          noPhrase => followupText.toLowerCase().includes(noPhrase.toLowerCase())
                        );
                        
                        if (isNo) {
                          // Continuar con siguiente pregunta
                          setPhase('idle');
                          setStatus('');
                        } else {
                          // Agregar respuesta adicional
                          onTranscriptionComplete(followupText);
                          setPhase('idle');
                          setStatus('');
                        }
                      }
                    } catch (error) {
                      console.error('Error processing followup:', error);
                      setPhase('idle');
                    }
                  };
                  
                  followupReader.readAsDataURL(followupBlob);
                };
                
                followupRecorder.start(250);
                
                // Detener después de tiempo límite
                setTimeout(() => {
                  if (followupRecorder.state === 'recording') {
                    followupRecorder.stop();
                  }
                }, agentContext.timeConstraints.followupExtraTurnMs);
                
              }
            }
          } catch (error) {
            console.error('Error processing transcription:', error);
            setPhase('idle');
          }
        };
        
        reader.readAsDataURL(audioBlob);
      };

      // Iniciar grabación
      mediaRecorder.start(250);
      isRecording = true;

      // Detectar silencio para detener
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const checkSilence = () => {
        if (!isRecording) return;
        
        analyser.getByteFrequencyData(dataArray);
        const rms = Math.sqrt(dataArray.reduce((sum, val) => sum + val * val, 0) / dataArray.length);
        
        if (rms < agentContext.turnTaking.vad.rmsThreshold) {
          if (silenceStart === 0) {
            silenceStart = Date.now();
          } else if (Date.now() - silenceStart > agentContext.turnTaking.vad.silenceMs) {
            if (mediaRecorder.state === 'recording') {
              mediaRecorder.stop();
            }
            isRecording = false;
            return;
          }
        } else {
          silenceStart = 0;
        }
        
        if (isRecording) {
          requestAnimationFrame(checkSilence);
        }
      };
      
      checkSilence();

      // Detener después de tiempo máximo
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, agentContext.timeConstraints.maxUserTurnMs);

    } catch (error) {
      console.error('Error in runCycle:', error);
      setPhase('idle');
      setStatus('');
      onSpeakingChange?.(false);
      onListeningChange?.(false);
    }
  }, [agentContext, nameAnalysis, onNamePreferenceSet, onTranscriptionComplete, onSpeakingChange, onListeningChange, generateAndSpeak]);

  // Función auxiliar para extraer nombre preferido
  const extractPreferredName = (text: string, firstNames: string[]): string | null => {
    const lowerText = text.toLowerCase();
    
    for (const name of firstNames) {
      if (lowerText.includes(name.toLowerCase())) {
        return name;
      }
    }
    
    // Buscar combinación de nombres
    if (firstNames.length >= 2) {
      const fullName = firstNames.join(' ');
      if (lowerText.includes(fullName.toLowerCase())) {
        return fullName;
      }
    }
    
    return null;
  };

  // Disparar automáticamente un nuevo ciclo cuando cambia la pregunta
  useEffect(() => {
    if (started && phase === 'idle' && questionText) {
      runCycle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionText, phase]);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {!started && (
        <button
          onClick={runCycle}
          style={{
            background: '#9bc41c', color: '#fff', border: 'none', borderRadius: 12,
            padding: '12px 20px', cursor: 'pointer', fontSize: 16
          }}
        >
          Iniciar
        </button>
      )}
      {status && (
        <div style={{ marginTop: 12, color: '#666666' }}>
          {status} {phase === 'listening' && elapsedMs > 0 ? `(${Math.floor(elapsedMs/1000)}s)` : ''}
        </div>
      )}
      {/* Sin botones manuales durante la escucha para mantener interacción natural */}
    </div>
  );
};

export default AssessmentAudio;