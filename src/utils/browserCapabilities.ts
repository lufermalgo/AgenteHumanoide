/**
 * Utilidades para detectar capacidades del navegador relacionadas con audio/voz
 */

export interface BrowserCapabilities {
  hasMediaRecorder: boolean;
  hasSpeechRecognition: boolean;
  hasSpeechSynthesis: boolean;
  hasGetUserMedia: boolean;
  isHTTPS: boolean;
  browser: string;
  isMobile: boolean;
}

export const detectBrowserCapabilities = (): BrowserCapabilities => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Detectar navegador
  let browser = 'unknown';
  if (userAgent.includes('chrome')) browser = 'chrome';
  else if (userAgent.includes('firefox')) browser = 'firefox';
  else if (userAgent.includes('safari') && !userAgent.includes('chrome')) browser = 'safari';
  else if (userAgent.includes('edge')) browser = 'edge';

  // Detectar si es móvil
  const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

  return {
    hasMediaRecorder: typeof MediaRecorder !== 'undefined',
    hasSpeechRecognition: 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window,
    hasSpeechSynthesis: 'speechSynthesis' in window,
    hasGetUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    isHTTPS: window.location.protocol === 'https:' || window.location.hostname === 'localhost',
    browser,
    isMobile
  };
};

export const checkMicrophonePermission = async (): Promise<'granted' | 'denied' | 'prompt'> => {
  try {
    if (!navigator.permissions) {
      return 'prompt'; // Navegador no soporta Permissions API
    }

    const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
    return result.state as 'granted' | 'denied' | 'prompt';
  } catch (error) {
    console.warn('No se pudo verificar permisos de micrófono:', error);
    return 'prompt';
  }
};

export const requestMicrophonePermission = async (): Promise<MediaStream | null> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      }
    });
    
    console.log('✅ Permisos de micrófono concedidos');
    return stream;
  } catch (error: any) {
    console.error('❌ Error al solicitar permisos de micrófono:', error);
    
    if (error?.name === 'NotAllowedError') {
      throw new Error('Permisos de micrófono denegados. Por favor, habilítalos en la configuración del navegador.');
    } else if (error?.name === 'NotFoundError') {
      throw new Error('No se encontró ningún micrófono. Verifica que esté conectado.');
    } else if (error?.name === 'NotSupportedError') {
      throw new Error('Tu navegador no soporta grabación de audio.');
    } else {
      throw new Error('Error al acceder al micrófono. Verifica permisos y configuración.');
    }
  }
};

export const getBrowserSpecificInstructions = (browser: string): string => {
  switch (browser) {
    case 'chrome':
    case 'edge':
      return 'En Chrome/Edge: Haz clic en el ícono del micrófono en la barra de direcciones y selecciona "Permitir".';
    case 'firefox':
      return 'En Firefox: Haz clic en el ícono del micrófono en la barra de direcciones y selecciona "Permitir".';
    case 'safari':
      return 'En Safari: Ve a Safari > Configuración > Sitios web > Micrófono y permite el acceso.';
    default:
      return 'Habilita los permisos de micrófono en la configuración de tu navegador.';
  }
};