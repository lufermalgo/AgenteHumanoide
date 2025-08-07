import React from 'react';
import styled from 'styled-components';
import { useAudioPermissions } from '../../hooks/useAudioPermissions';
import { theme } from '../../styles/theme';
import LoadingSpinner from '../UI/LoadingSpinner';

const PermissionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: ${theme.colors.background};
  color: ${theme.colors.text};
  padding: ${theme.spacing.lg};
  text-align: center;
`;

const Card = styled.div`
  background-color: ${theme.colors.backgroundCard};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  padding: ${theme.spacing.xxl};
  max-width: 600px;
  width: 100%;
`;

const Title = styled.h2`
  color: ${theme.colors.primary};
  margin-bottom: ${theme.spacing.md};
  font-size: ${theme.typography.fontSizes.xxl};
`;

const Description = styled.p`
  color: ${theme.colors.textLight};
  margin-bottom: ${theme.spacing.lg};
  font-size: ${theme.typography.fontSizes.md};
`;

const PermissionButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  background: ${props => props.variant === 'secondary' ? theme.colors.lightGray : theme.colors.primary};
  color: ${props => props.variant === 'secondary' ? theme.colors.text : 'white'};
  border: none;
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  font-size: ${theme.typography.fontSizes.lg};
  cursor: pointer;
  transition: all 0.3s ease;
  margin: ${theme.spacing.sm};

  &:hover {
    transform: translateY(-1px);
    background: ${props => props.variant === 'secondary' ? theme.colors.tertiary : theme.colors.secondary};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  background-color: ${theme.colors.error};
  color: ${theme.colors.textWhite};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  margin-top: ${theme.spacing.lg};
  font-size: ${theme.typography.fontSizes.sm};
`;

const InfoBox = styled.div<{ variant?: 'info' | 'warning' | 'error' }>`
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  margin-top: ${theme.spacing.lg};
  font-size: ${theme.typography.fontSizes.sm};
  
  background: ${props => {
    switch (props.variant) {
      case 'info': return theme.colors.info;
      case 'warning': return theme.colors.warning;
      case 'error': return theme.colors.error;
      default: return theme.colors.tertiary;
    }
  }};
  color: white;
`;

const Icon = styled.span`
  font-size: ${theme.typography.fontSizes.xxxl};
  margin-bottom: ${theme.spacing.md};
  color: ${theme.colors.primary};
`;

const CapabilityList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: ${theme.spacing.lg};
  
  li {
    padding: ${theme.spacing.sm} 0;
    font-size: ${theme.typography.fontSizes.sm};
    color: ${theme.colors.textLight};
    border-bottom: 1px solid ${theme.colors.lightGray};
    
    &:last-child {
      border-bottom: none;
    }
  }
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
  const { permission, stream, error, capabilities } = audioState;
  const { requestPermission } = audioActions;
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (permission === 'granted' && stream) {
      console.log('🎤 Permisos concedidos, llamando onPermissionGranted');
      onPermissionGranted(stream);
    }
  }, [permission, stream, onPermissionGranted]);

  const handleRequestPermission = async () => {
    setIsLoading(true);
    try {
      await requestPermission();
    } catch (err) {
      console.error('Error requesting permission:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Si los permisos están concedidos, el useEffect se encargará de llamar onPermissionGranted
  // No necesitamos mostrar LoadingSpinner aquí porque el componente padre manejará la transición
  if (permission === 'granted' && stream) {
    return null; // El componente padre se encargará de mostrar la interfaz correcta
  }

  return (
    <PermissionContainer>
      <Card>
        <Icon>🎤</Icon>
        <Title>Permiso de Micrófono Necesario</Title>
        <Description>
          Para una experiencia interactiva completa con el agente de IA, necesitamos acceso a tu micrófono.
          Esto nos permitirá escucharte y responder en tiempo real.
        </Description>

        {permission === 'prompt' && (
          <PermissionButton 
            onClick={handleRequestPermission}
            disabled={isLoading}
          >
            {isLoading ? 'Solicitando...' : 'Autorizar Micrófono'}
          </PermissionButton>
        )}

        {permission === 'denied' && (
          <>
            <ErrorMessage>
              {error || 'Permiso de micrófono denegado. Por favor, habilítalo en la configuración de tu navegador para usar la voz.'}
            </ErrorMessage>
            <PermissionButton onClick={handleRequestPermission}>
              Intentar de Nuevo
            </PermissionButton>
          </>
        )}

        {permission === 'error' && (
          <>
            <ErrorMessage>
              {error || 'La funcionalidad de micrófono no está disponible en este navegador o dispositivo.'}
            </ErrorMessage>
            {!capabilities.isHTTPS && (
              <InfoBox variant="info">
                <strong>Sugerencia:</strong> Intenta acceder a esta página usando HTTPS (https://...) o en un navegador compatible.
              </InfoBox>
            )}
          </>
        )}

        {onSkip && permission !== 'granted' && (
          <PermissionButton variant="secondary" onClick={onSkip}>
            Continuar sin Voz
          </PermissionButton>
        )}

        <CapabilityList>
          <li>Navegador: {capabilities.browser} {capabilities.isMobile ? '(móvil)' : '(escritorio)'}</li>
          <li>MediaRecorder: {capabilities.hasMediaRecorder ? 'Soportado' : 'No soportado'}</li>
          <li>HTTPS: {capabilities.isHTTPS ? 'Sí' : 'No'}</li>
        </CapabilityList>

        <Description style={{ marginTop: theme.spacing.xl, fontSize: theme.typography.fontSizes.sm }}>
          Tu privacidad es importante. El audio solo se usará para la transcripción durante el assessment.
        </Description>
      </Card>
    </PermissionContainer>
  );
};

export default AudioPermissionRequest;