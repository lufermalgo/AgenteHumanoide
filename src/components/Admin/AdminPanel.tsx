import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../Auth/AuthProvider';
import { QuestionLoader, AssessmentConfig } from '../../services/questionLoader';
import { theme } from '../../styles/theme';

const AdminContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${theme.colors.background} 0%, #e8e8e8 100%);
  padding: ${theme.spacing.lg};
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.xl};
  padding: ${theme.spacing.md} 0;
`;

const Logo = styled.h1`
  font-size: ${theme.typography.fontSizes.xl};
  font-weight: ${theme.typography.fontWeights.bold};
  color: ${theme.colors.primary};
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const UserName = styled.span`
  font-size: ${theme.typography.fontSizes.md};
  color: ${theme.colors.text};
  font-weight: ${theme.typography.fontWeights.medium};
`;

const LogoutButton = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background-color: transparent;
  color: ${theme.colors.textLight};
  border: 1px solid ${theme.colors.textLight};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  font-size: ${theme.typography.fontSizes.sm};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${theme.colors.textLight};
    color: white;
  }
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 2px solid ${theme.colors.lightGray};
  margin-bottom: ${theme.spacing.xl};
`;

const Tab = styled.button<{ active: boolean }>`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${props => props.active ? theme.colors.primary : 'transparent'};
  color: ${props => props.active ? 'white' : theme.colors.text};
  border: none;
  border-radius: ${theme.borderRadius.md} ${theme.borderRadius.md} 0 0;
  cursor: pointer;
  font-size: ${theme.typography.fontSizes.md};
  font-weight: ${theme.typography.fontWeights.medium};
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? theme.colors.primary : theme.colors.lightGray};
  }
`;

const Card = styled.div`
  background: ${theme.colors.backgroundCard};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  padding: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.lg};
`;

const Title = styled.h2`
  font-size: ${theme.typography.fontSizes.xl};
  font-weight: ${theme.typography.fontWeights.semibold};
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.lg};
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  background-color: ${props => {
    switch (props.variant) {
      case 'danger': return theme.colors.secondary;
      case 'secondary': return theme.colors.lightGray;
      default: return theme.colors.primary;
    }
  }};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  font-size: ${theme.typography.fontSizes.md};
  font-weight: ${theme.typography.fontWeights.medium};
  transition: all 0.2s ease;
  margin-right: ${theme.spacing.sm};

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 200px;
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.lightGray};
  border-radius: ${theme.borderRadius.md};
  font-family: 'Courier New', monospace;
  font-size: ${theme.typography.fontSizes.sm};
  resize: vertical;
  margin-bottom: ${theme.spacing.md};
`;

const Input = styled.input`
  width: 100%;
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.lightGray};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSizes.md};
  margin-bottom: ${theme.spacing.md};
`;

const Label = styled.label`
  display: block;
  font-size: ${theme.typography.fontSizes.md};
  font-weight: ${theme.typography.fontWeights.medium};
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.sm};
`;

const StatusMessage = styled.div<{ type: 'success' | 'error' | 'info' }>`
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.md};
  background-color: ${props => {
    switch (props.type) {
      case 'success': return '#d4edda';
      case 'error': return '#f8d7da';
      case 'info': return '#d1ecf1';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'success': return '#155724';
      case 'error': return '#721c24';
      case 'info': return '#0c5460';
    }
  }};
  border: 1px solid ${props => {
    switch (props.type) {
      case 'success': return '#c3e6cb';
      case 'error': return '#f5c6cb';
      case 'info': return '#bee5eb';
    }
  }};
`;

const QuestionList = styled.div`
  margin-top: ${theme.spacing.lg};
`;

const QuestionItem = styled.div`
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.lightGray};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.sm};
  background: white;
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.sm};
`;

const QuestionText = styled.div`
  font-size: ${theme.typography.fontSizes.md};
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.sm};
`;

const QuestionMeta = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  font-size: ${theme.typography.fontSizes.sm};
  color: ${theme.colors.textLight};
`;

const Tag = styled.span`
  background: ${theme.colors.primary};
  color: white;
  padding: 2px 8px;
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSizes.xs};
  margin-right: ${theme.spacing.xs};
`;

type TabType = 'questions' | 'config' | 'system';

const AdminPanel: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('questions');
  const [config, setConfig] = useState<AssessmentConfig | null>(null);
  const [jsonContent, setJsonContent] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const questionLoader = QuestionLoader.getInstance();

  useEffect(() => {
    loadCurrentConfig();
  }, [questionLoader]);

  const loadCurrentConfig = async () => {
    try {
      setIsLoading(true);
      const currentConfig = await questionLoader.loadQuestions();
      setConfig(currentConfig);
      setJsonContent(JSON.stringify(currentConfig, null, 2));
      setStatus({ type: 'success', message: 'Configuración cargada exitosamente' });
    } catch (error) {
      setStatus({ type: 'error', message: `Error cargando configuración: ${error}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveQuestions = async () => {
    try {
      setIsLoading(true);
      const newConfig = JSON.parse(jsonContent);
      
      // Validar estructura
      if (!newConfig.questions || !Array.isArray(newConfig.questions)) {
        throw new Error('Estructura de preguntas inválida');
      }

      // Aquí normalmente guardarías en Firestore o un endpoint
      // Por ahora, solo actualizamos el estado local
      setConfig(newConfig);
      setStatus({ type: 'success', message: 'Preguntas guardadas exitosamente' });
      
      // Limpiar cache para forzar recarga
      questionLoader.clearCache();
    } catch (error) {
      setStatus({ type: 'error', message: `Error guardando preguntas: ${error}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateJson = () => {
    try {
      JSON.parse(jsonContent);
      setStatus({ type: 'success', message: 'JSON válido' });
    } catch (error) {
      setStatus({ type: 'error', message: `JSON inválido: ${error}` });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  const renderQuestionsTab = () => (
    <Card>
      <Title>Gestión de Preguntas</Title>
      
      {status && <StatusMessage type={status.type}>{status.message}</StatusMessage>}
      
      <div style={{ marginBottom: theme.spacing.lg }}>
        <Button onClick={loadCurrentConfig} disabled={isLoading}>
          {isLoading ? 'Cargando...' : 'Recargar Configuración'}
        </Button>
        <Button onClick={handleValidateJson} variant="secondary">
          Validar JSON
        </Button>
        <Button onClick={handleSaveQuestions} disabled={isLoading}>
          {isLoading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

      <Label>Configuración JSON:</Label>
      <TextArea
        value={jsonContent}
        onChange={(e) => setJsonContent(e.target.value)}
        placeholder="Pega aquí la configuración JSON..."
      />

      {config && (
        <QuestionList>
          <Title>Preguntas Actuales ({config.questions.length})</Title>
          {config.questions.map((question, index) => (
            <QuestionItem key={question.id}>
              <QuestionHeader>
                <strong>Pregunta {index + 1}: {question.id}</strong>
                <div>
                  {question.required && <Tag>Requerida</Tag>}
                  <Tag>{question.category}</Tag>
                </div>
              </QuestionHeader>
              <QuestionText>{question.text}</QuestionText>
              <QuestionMeta>
                <span>Orden: {question.order}</span>
                <span>Tiempo máximo: {question.maxResponseTime}s</span>
                <span>Tags: {question.tags.join(', ')}</span>
              </QuestionMeta>
            </QuestionItem>
          ))}
        </QuestionList>
      )}
    </Card>
  );

  const renderConfigTab = () => (
    <Card>
      <Title>Configuración del Sistema</Title>
      
      <Label>URL de Configuración:</Label>
      <Input
        type="url"
        placeholder="https://ejemplo.com/config.json"
        defaultValue="/data/assessment-questions.json"
      />
      
      <Label>Duración Estimada (minutos):</Label>
      <Input
        type="number"
        placeholder="10"
        defaultValue="10"
      />
      
      <Label>Límite de Usuarios:</Label>
      <Input
        type="number"
        placeholder="75"
        defaultValue="75"
      />
      
      <Button>Guardar Configuración</Button>
    </Card>
  );

  const renderSystemTab = () => (
    <Card>
      <Title>System Prompt</Title>
      
      <Label>Prompt del Sistema (para Gemini):</Label>
      <TextArea
        value={systemPrompt}
        onChange={(e) => setSystemPrompt(e.target.value)}
        placeholder="Eres un asistente amigable para un assessment de IA generativa..."
      />
      
      <Button>Guardar Prompt</Button>
    </Card>
  );

  return (
    <AdminContainer>
      <Header>
        <Logo>Assessmentia - Admin</Logo>
        <UserInfo>
          <UserName>
            Admin: {user?.displayName || user?.email?.split('@')[0]}
          </UserName>
          <LogoutButton onClick={handleLogout}>
            Salir
          </LogoutButton>
        </UserInfo>
      </Header>

      <MainContent>
        <TabContainer>
          <Tab 
            active={activeTab === 'questions'} 
            onClick={() => setActiveTab('questions')}
          >
            Preguntas
          </Tab>
          <Tab 
            active={activeTab === 'config'} 
            onClick={() => setActiveTab('config')}
          >
            Configuración
          </Tab>
          <Tab 
            active={activeTab === 'system'} 
            onClick={() => setActiveTab('system')}
          >
            System Prompt
          </Tab>
        </TabContainer>

        {activeTab === 'questions' && renderQuestionsTab()}
        {activeTab === 'config' && renderConfigTab()}
        {activeTab === 'system' && renderSystemTab()}
      </MainContent>
    </AdminContainer>
  );
};

export default AdminPanel; 