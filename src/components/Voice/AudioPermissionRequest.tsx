import React from 'react';
import styled from 'styled-components';
import { useAudioPermissions } from '../../hooks/useAudioPermissions';
import { theme } from '../../styles/theme';

const PermissionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xl};
  background: ${theme.colors.backgroundCard};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  max-width: 500px;
  margin: 0 auto;
  text-align: center;
`;

const MicrophoneIcon = styled.div`
  font-size: 4rem;
  margin-bottom: ${theme.spacing.lg};
  color: ${theme.colors.primary};
`;

const Title = styled.h2`
  font-size: ${theme.typography.fontSizes.xl};
  font-weight: ${theme.typography.fontWeights.semibold};
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.md};
`;

const Description = styled.p`
  font-size: ${theme.typography.fontSizes.md};
  color: ${theme.colors.textLight};
  margin-bottom: ${theme.spacing.lg};
  line-height: 1.5;
`;

const PermissionButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  background: ${props => props.variant === 'secondary' ? theme.colors.lightGray : theme.colors.primary};
  color: ${props => props.variant === 'secondary' ? theme.colors.text : 'white'};
  border: none;
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  font-size: ${theme.typography.fontSizes.md};
  font-weight: ${theme.typography.fontWeights.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 0 ${theme.spacing.sm};

  &:hover {
    background: ${props => props.variant === 'secondary' ? theme.colors.tertiary : theme.colors.secondary};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  background: ${theme.colors.error};
  color: white;
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  margin: ${theme.spacing.md} 0;
  font-size: ${theme.typography.fontSizes.sm};
`;

const InfoBox = styled.div`
  background: ${theme.colors.info};
  color: white;
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  margin: ${theme.spacing.md} 0;
  font-size: ${theme.typography.fontSizes.sm};
  text-align: left;
`;

const CapabilityList = styled.ul`
  text-align: left;
  margin: ${theme.spacing.md} 0;
  padding-left: ${theme.spacing.lg};
  color: ${theme.colors.textLight};
  font-size: ${theme.typography.fontSizes.sm};
`;

const StatusIndicator = styled.div<{ status: 'success' | 'warning' | 'error' }>`
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: ${theme.spacing.sm};
  background: ${props => {
    switch (props.status) {
      case 'success': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'error': return '#F44336';
      default: return theme.colors.tertiary;
    }
  }};
`;

interface AudioPermissionRequestProps {
  onPermissionGranted: (stream: MediaStream) => void;
  onSkip?: () => void;
}

const AudioPermissionRequest: React.FC<AudioPermissionRequestProps> = ({ 
  onPermissionGranted, 
  onSkip 
}) => {
  const [audioState, audioActions] = useAudioPermissions();
  const { permission, stream, capabilities, error, isSupported } = audioState;
  const { requestPermission, getInstructions } = audioActions;

  React.useEffect(() => {
    if (permission === 'granted' && stream) {
      onPermissionGranted(stream);
    }
  }, [permission, stream, onPermissionGranted]);

  const handleRequestPermission = async () => {
    try {
      await requestPermission();
    } catch (err) {
      console.error('Error requesting permission:', err);
    }
  };

  const getPermissionIcon = () => {
    switch (permission) {
      case 'granted': return '✅';
      case 'denied': return '❌';
      case 'checking': return '🔄';
      case 'error': return '⚠️';
      default: return '🎙️';
    }
  };

  const getPermissionTitle = () => {
    switch (permission) {
      case 'granted': return '¡Micrófono Habilitado!';
      case 'denied': return 'Permisos Denegados';
      case 'checking': return 'Verificando Permisos...';
      case 'error': return 'Error de Compatibilidad';
      default: return 'Permisos de Micrófono Requeridos';
    }
  };

  const getPermissionDescription = () => {
    switch (permission) {
      case 'granted': 
        return 'Perfecto, tu micrófono está listo para el assessment de voz.';
      case 'denied': 
        return 'Necesitamos acceso al micrófono para el assessment de voz. Por favor, habilita los permisos.';
      case 'checking': 
        return 'Verificando el acceso al micrófono...';
      case 'error': 
        return 'Tu navegador no soporta las funciones de voz necesarias para este assessment.';
      default: 
        return 'Para participar en el assessment de voz, necesitamos acceso a tu micrófono. Tus respuestas serán procesadas de forma segura.';
    }
  };

  if (!isSupported) {
    return (
      <PermissionContainer>
        <MicrophoneIcon>⚠️</MicrophoneIcon>
        <Title>Navegador No Compatible</Title>
        <Description>
          Tu navegador no soporta las funciones de grabación de audio necesarias.
        </Description>
        
        <CapabilityList>
          <li>
            <StatusIndicator status={capabilities.hasGetUserMedia ? 'success' : 'error'} />
            getUserMedia: {capabilities.hasGetUserMedia ? 'Soportado' : 'No soportado'}
          </li>
          <li>
            <StatusIndicator status={capabilities.hasMediaRecorder ? 'success' : 'error'} />
            MediaRecorder: {capabilities.hasMediaRecorder ? 'Soportado' : 'No soportado'}
          </li>
          <li>
            <StatusIndicator status={capabilities.isHTTPS ? 'success' : 'error'} />
            HTTPS: {capabilities.isHTTPS ? 'Habilitado' : 'Requerido'}
          </li>
        </CapabilityList>

        <InfoBox>
          <strong>Recomendación:</strong> Usa Chrome, Firefox o Edge en su versión más reciente.
        </InfoBox>

        {onSkip && (
          <PermissionButton variant="secondary" onClick={onSkip}>
            Continuar sin Voz
          </PermissionButton>
        )}
      </PermissionContainer>
    );
  }

  return (
    <PermissionContainer>
      <MicrophoneIcon>{getPermissionIcon()}</MicrophoneIcon>
      <Title>{getPermissionTitle()}</Title>
      <Description>{getPermissionDescription()}</Description>

      {error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}

      {permission === 'denied' && (
        <InfoBox>
          <strong>Instrucciones:</strong><br />
          {getInstructions()}
        </InfoBox>
      )}

      <div style={{ marginTop: theme.spacing.lg }}>
        {permission === 'prompt' && (
          <PermissionButton 
            onClick={handleRequestPermission}
            disabled={permission === 'checking'}
          >
            {permission === 'checking' ? 'Verificando...' : 'Habilitar Micrófono'}
          </PermissionButton>
        )}

        {permission === 'denied' && (
          <PermissionButton onClick={handleRequestPermission}>
            Intentar de Nuevo
          </PermissionButton>
        )}

        {onSkip && permission !== 'granted' && (
          <PermissionButton variant="secondary" onClick={onSkip}>
            Continuar sin Voz
          </PermissionButton>
        )}
      </div>

      <CapabilityList style={{ marginTop: theme.spacing.lg }}>
        <li>Navegador: {capabilities.browser} {capabilities.isMobile ? '(móvil)' : '(escritorio)'}</li>
        <li>Speech Recognition: {capabilities.hasSpeechRecognition ? 'Soportado' : 'No soportado'}</li>
        <li>Speech Synthesis: {capabilities.hasSpeechSynthesis ? 'Soportado' : 'No soportado'}</li>
      </CapabilityList>
    </PermissionContainer>
  );
};

export default AudioPermissionRequest;