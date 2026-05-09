import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, TextField, Button, Typography,
  Alert, InputAdornment, IconButton, CircularProgress,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      const msg =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        'Credenciales inválidas. Verifique sus datos.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: { xs: 'column', md: 'row' } }}>

      {/* ── Panel de identidad institucional ── */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(160deg, #145214 0%, #1B5E20 60%, #2E7D32 100%)',
          // Mobile: franja superior compacta
          py: { xs: 4, md: 0 },
          px: { xs: 3, md: 6 },
          minHeight: { xs: 'auto', md: '100vh' },
          width: { xs: '100%', md: '42%' },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Círculos decorativos de fondo */}
        <Box sx={{
          display: { xs: 'none', md: 'block' },
          position: 'absolute', bottom: -100, right: -100,
          width: 340, height: 340, borderRadius: '50%',
          border: '1px solid rgba(230,81,0,0.2)',
          pointerEvents: 'none',
        }} />
        <Box sx={{
          display: { xs: 'none', md: 'block' },
          position: 'absolute', top: -60, left: -80,
          width: 240, height: 240, borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.07)',
          pointerEvents: 'none',
        }} />

        {/* Logo escudo */}
        <Box
          component="img"
          src="/logo.png"
          alt="Escudo Colegio Bautista Boliviano Brasileño"
          sx={{
            width: { xs: 100, sm: 120, md: 150 },
            height: { xs: 100, sm: 120, md: 150 },
            objectFit: 'contain',
            filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.35))',
            mb: { xs: 2, md: 3 },
          }}
        />

        {/* Nombre del colegio */}
        <Typography
          sx={{
            color: '#FFFFFF',
            fontWeight: 700,
            textAlign: 'center',
            fontSize: { xs: '1.15rem', sm: '1.3rem', md: '1.45rem' },
            lineHeight: 1.25,
            letterSpacing: '-0.01em',
            mb: 0.5,
          }}
        >
          Colegio Bautista<br />Boliviano Brasileño
        </Typography>

        {/* Separador naranja */}
        <Box sx={{
          width: 44, height: 3,
          bgcolor: '#E65100',
          borderRadius: 2,
          my: { xs: 1.5, md: 2.5 },
        }} />

        {/* Lema */}
        <Typography
          sx={{
            color: 'rgba(255,255,255,0.8)',
            textAlign: 'center',
            fontSize: { xs: '0.75rem', md: '0.825rem' },
            fontStyle: 'italic',
            maxWidth: 260,
            lineHeight: 1.5,
            display: { xs: 'none', sm: 'block' },
          }}
        >
          "El principio de la sabiduría es el temor de Dios"
        </Typography>

        <Typography
          sx={{
            color: 'rgba(255,255,255,0.45)',
            fontSize: { xs: '0.7rem', md: '0.75rem' },
            mt: { xs: 1, md: 1.5 },
          }}
        >
          Sistema de Gestión Escolar
        </Typography>
      </Box>

      {/* ── Panel de formulario ── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#FFFFFF',
          px: { xs: 3, sm: 5, md: 7 },
          py: { xs: 4, md: 6 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 420 }}>

          <Typography
            variant="h5"
            sx={{ color: '#1A1A1A', mb: 0.75, fontSize: { xs: '1.35rem', md: '1.5rem' } }}
          >
            Iniciar sesión
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: '#5A6370', mb: { xs: 3, md: 4 }, lineHeight: 1.5 }}
          >
            Ingrese sus credenciales para acceder al sistema
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 3, borderRadius: 2, fontSize: '0.875rem' }}
            >
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 2.5 } }}
          >
            <TextField
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              autoComplete="username"
              autoFocus
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountCircleOutlinedIcon sx={{ color: '#9CA3AF', fontSize: 22 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                '& .MuiInputBase-input': { py: { xs: 1.6, md: 1.4 } },
              }}
            />

            <TextField
              label="Contraseña"
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              autoComplete="current-password"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: '#9CA3AF', fontSize: 22 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPass(!showPass)}
                        edge="end"
                        size="medium"
                        aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showPass
                          ? <VisibilityOffIcon sx={{ fontSize: 20, color: '#9CA3AF' }} />
                          : <VisibilityIcon sx={{ fontSize: 20, color: '#9CA3AF' }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                '& .MuiInputBase-input': { py: { xs: 1.6, md: 1.4 } },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{
                mt: 0.5,
                py: { xs: 1.6, md: 1.5 },
                borderRadius: 2,
                fontSize: { xs: '1rem', md: '0.9375rem' },
                fontWeight: 600,
                bgcolor: '#1B5E20',
                '&:hover': { bgcolor: '#145214' },
                '&.Mui-disabled': { bgcolor: '#A5D6A7', color: '#FFFFFF' },
              }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Ingresar'}
            </Button>
          </Box>

          <Box
            sx={{
              mt: { xs: 3, md: 4 },
              pt: { xs: 3, md: 4 },
              borderTop: '1px solid #F0F0F0',
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: '#9CA3AF', display: 'block', textAlign: 'center', lineHeight: 1.7 }}
            >
              Acceso restringido a personal autorizado del colegio.<br />
              Si tiene problemas para ingresar, contacte a administración.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
