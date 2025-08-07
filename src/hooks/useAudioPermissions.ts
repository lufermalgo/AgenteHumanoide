import { useState, useEffect } from 'react';
import { 
  checkMicrophonePermission, 
  requestMicrophonePermission, 
  detectBrowserCapabilities,
  getBrowserSpecificInstructions,
  type BrowserCapabilities 
} from '../utils/browserCapabilities';

export type PermissionState = 'checking' | 'granted' | 'denied' | 'prompt' | 'error';

export interface AudioPermissionsState {
  permission: PermissionState;
  stream: MediaStream | null;
  capabilities: BrowserCapabilities;
  error: string | null;
  isSupported: boolean;
}

export interface AudioPermissionsActions {
  requestPermission: () => Promise<void>;
  stopStream: () => void;
  getInstructions: () => string;
}

export const useAudioPermissions = (): [AudioPermissionsState, AudioPermissionsActions] => {
  const [permission, setPermission] = useState<PermissionState>('checking');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capabilities] = useState<BrowserCapabilities>(detectBrowserCapabilities());

  const isSupported = capabilities.hasGetUserMedia && capabilities.hasMediaRecorder;

  useEffect(() => {
    checkInitialPermission();
  }, []);

  const checkInitialPermission = async () => {
    if (!isSupported) {
      setPermission('error');
      setError('Tu navegador no soporta grabación de audio.');
      return;
    }

    if (!capabilities.isHTTPS) {
      setPermission('error');
      setError('La grabación de audio requiere HTTPS. Accede mediante https:// o localhost.');
      return;
    }

    try {
      const permissionState = await checkMicrophonePermission();
      setPermission(permissionState);
    } catch (err) {
      console.warn('Error verificando permisos:', err);
      setPermission('prompt');
    }
  };

  const requestPermission = async (): Promise<void> => {
    try {
      setPermission('checking');
      setError(null);
      
      const mediaStream = await requestMicrophonePermission();
      
      if (mediaStream) {
        setStream(mediaStream);
        setPermission('granted');
        console.log('🎙️ Micrófono disponible:', {
          tracks: mediaStream.getAudioTracks().length,
          constraints: mediaStream.getAudioTracks()[0]?.getSettings()
        });
      } else {
        setPermission('denied');
      }
    } catch (err: any) {
      console.error('Error solicitando permisos:', err);
      setPermission('denied');
      setError(err.message || 'Error al acceder al micrófono');
    }
  };

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('🔇 Track de audio detenido:', track.label);
      });
      setStream(null);
    }
  };

  const getInstructions = () => getBrowserSpecificInstructions(capabilities.browser);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stream]);

  return [
    {
      permission,
      stream,
      capabilities,
      error,
      isSupported
    },
    {
      requestPermission,
      stopStream,
      getInstructions
    }
  ];
};