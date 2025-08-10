import React from 'react';

interface InteractionStatusProps {
  phase: 'idle' | 'speaking' | 'listening' | 'processing' | 'followup';
  status: string;
  isListening: boolean;
  isSpeaking: boolean;
}

const InteractionStatus: React.FC<InteractionStatusProps> = ({
  phase,
  status,
  isListening,
  isSpeaking
}) => {
  // Configuración de colores y estilos
  const getStatusConfig = () => {
    switch (phase) {
      case 'speaking':
        return {
          color: '#9bc41c',
          icon: '🎤',
          animation: 'pulse',
          message: 'Anita-AI está hablando...'
        };
      case 'listening':
        return {
          color: '#f08a00',
          icon: '👂',
          animation: 'wave',
          message: 'Escuchando tu respuesta...'
        };
      case 'processing':
        return {
          color: '#666666',
          icon: '⚙️',
          animation: 'spin',
          message: 'Procesando...'
        };
      case 'followup':
        return {
          color: '#f08a00',
          icon: '👂',
          animation: 'wave',
          message: 'Escuchando respuesta adicional...'
        };
      default:
        return {
          color: '#666666',
          icon: '⏳',
          animation: 'none',
          message: 'Preparando...'
        };
    }
  };

  const config = getStatusConfig();

  // Estilos CSS para animaciones
  const getAnimationStyle = () => {
    const baseStyle = {
      display: 'inline-block',
      fontSize: '24px',
      marginRight: '8px'
    };

    switch (config.animation) {
      case 'pulse':
        return {
          ...baseStyle,
          animation: 'pulse 1.5s ease-in-out infinite'
        };
      case 'wave':
        return {
          ...baseStyle,
          animation: 'wave 1s ease-in-out infinite'
        };
      case 'spin':
        return {
          ...baseStyle,
          animation: 'spin 1s linear infinite'
        };
      default:
        return baseStyle;
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      minHeight: '120px',
      backgroundColor: '#f8f9fa',
      borderRadius: '12px',
      border: `2px solid ${config.color}`,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease'
    }}>
      {/* Icono animado */}
      <div style={getAnimationStyle()}>
        {config.icon}
      </div>

      {/* Mensaje de estado */}
      <div style={{
        fontSize: '16px',
        fontWeight: '600',
        color: config.color,
        marginBottom: '8px',
        textAlign: 'center'
      }}>
        {config.message}
      </div>

      {/* Estado específico */}
      {status && (
        <div style={{
          fontSize: '14px',
          color: '#666666',
          textAlign: 'center',
          fontStyle: 'italic'
        }}>
          {status}
        </div>
      )}

      {/* Indicadores de actividad */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginTop: '12px'
      }}>
        {isSpeaking && (
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#9bc41c',
            animation: 'pulse 1s ease-in-out infinite'
          }} />
        )}
        {isListening && (
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#f08a00',
            animation: 'wave 1s ease-in-out infinite'
          }} />
        )}
      </div>

      {/* Barra de progreso para procesamiento */}
      {phase === 'processing' && (
        <div style={{
          width: '100%',
          height: '4px',
          backgroundColor: '#e9ecef',
          borderRadius: '2px',
          marginTop: '12px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: '30%',
            height: '100%',
            backgroundColor: config.color,
            borderRadius: '2px',
            animation: 'progress 2s ease-in-out infinite'
          }} />
        </div>
      )}

      {/* Estilos CSS para animaciones */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        
        @keyframes wave {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
};

export default InteractionStatus; 