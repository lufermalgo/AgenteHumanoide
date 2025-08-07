import React from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../../styles/theme';

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: ${theme.colors.background};
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid ${theme.colors.backgroundCard};
  border-top: 4px solid ${theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  margin-top: ${theme.spacing.md};
  color: ${theme.colors.textLight};
  font-size: ${theme.typography.fontSizes.md};
  text-align: center;
`;

interface LoadingSpinnerProps {
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  text = "Cargando..." 
}) => {
  return (
    <SpinnerContainer>
      <div>
        <Spinner />
        <LoadingText>{text}</LoadingText>
      </div>
    </SpinnerContainer>
  );
};

export default LoadingSpinner;