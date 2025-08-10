import React, { useEffect, useState } from 'react';
import { onAuth, signInGoogle } from '../../services/firebase';
import { Box, Button, Typography } from '@mui/material';

interface Props {
  children: (displayName: string) => React.ReactNode;
}

const AuthGate: React.FC<Props> = ({ children }) => {
  const [displayName, setDisplayName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsub = onAuth((user) => {
      setDisplayName(user?.displayName || '');
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Cargando…</Typography>
      </Box>
    );
  }

  if (!displayName) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <Typography variant="h5">Bienvenido</Typography>
        <Typography variant="body1">Por favor inicia sesión con Google para continuar</Typography>
        <Button variant="contained" color="primary" onClick={async () => { await signInGoogle(); }}>Iniciar sesión con Google</Button>
      </Box>
    );
  }

  return <>{children(displayName)}</>;
};

export default AuthGate;

