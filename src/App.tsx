import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ConfigProvider } from './contexts/ConfigContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

// Wrapper to handle ChunkLoadErrors
const lazyRetry = (importFn: () => Promise<any>) => {
  return lazy(async () => {
    try {
      return await importFn();
    } catch (error) {
      // If a chunk load fails, it's likely a new deployment happened.
      // We force a page reload to get the latest bundle.
      window.location.reload();
      return { default: () => null };
    }
  });
};

// Lazy load pages
const LoginPage = lazyRetry(() => import('./pages/LoginPage'));
const ForceChangePasswordPage = lazyRetry(() => import('./pages/ForceChangePasswordPage'));
const DashboardPage = lazyRetry(() => import('./pages/DashboardPage'));
const EstudiantesPage = lazyRetry(() => import('./pages/EstudiantesPage'));
const DocentesPage = lazyRetry(() => import('./pages/DocentesPage'));
const CursosPage = lazyRetry(() => import('./pages/CursosPage'));
const CalificacionesPage = lazyRetry(() => import('./pages/CalificacionesPage'));
const AsistenciaPage = lazyRetry(() => import('./pages/AsistenciaPage'));
const PagosPage = lazyRetry(() => import('./pages/PagosPage'));
const InscripcionesPage = lazyRetry(() => import('./pages/InscripcionesPage'));
const HorarioPage = lazyRetry(() => import('./pages/HorarioPage'));
const TeacherDashboard = lazyRetry(() => import('./pages/teacher/TeacherDashboard'));
const TeacherCoursePage = lazyRetry(() => import('./pages/teacher/TeacherCoursePage'));
const StudentPortalPage = lazyRetry(() => import('./pages/student/StudentPortalPage'));
const ProfilePage = lazyRetry(() => import('./pages/ProfilePage'));
const AnioAcademicoPage = lazyRetry(() => import('./pages/AnioAcademicoPage'));

const theme = createTheme({
  palette: {
    primary: {
      main: '#1B5E20',
      light: '#388E3C',
      dark: '#145214',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#E65100',
      light: '#FF8A50',
      dark: '#BF360C',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#1565C0',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F5F6F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#5A6370',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600, letterSpacing: '-0.01em' },
    body1: { fontSize: '0.9375rem' },
    body2: { fontSize: '0.875rem' },
    caption: { fontSize: '0.75rem' },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          minHeight: 44,
          '&:hover': { boxShadow: 'none' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05)',
          border: '1px solid #E8EAE8',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1B5E20',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused fieldset': { borderColor: '#1B5E20' },
            '& input': { fontSize: '1rem' },
          },
          '& label.Mui-focused': { color: '#1B5E20' },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: { minHeight: 44 },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
    MuiIconButton: {
      styleOverrides: {
        root: { minWidth: 44, minHeight: 44 },
      },
    },
  },
});

function Loading() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  );
}

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === 'docente') return <Navigate to="/docente" replace />;
  if (user.role === 'estudiante') return <Navigate to="/estudiante" replace />;
  return <DashboardPage />;
}

/**
 * Wrapper that forces users with must_change_password to the password change page.
 * Any authenticated route goes through this check first.
 */
function RequirePasswordChanged({ children }: { children: React.ReactNode }) {
  const { mustChangePassword } = useAuth();
  if (mustChangePassword) {
    return <Navigate to="/cambiar-contrasena" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <ConfigProvider>
          <BrowserRouter>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />

                {/* Force change password route - accessible only when authenticated */}
                <Route path="/cambiar-contrasena" element={
                  <PrivateRoute><ForceChangePasswordPage /></PrivateRoute>
                } />

                {/* Shared layout for all authenticated users */}
                <Route path="/" element={
                  <PrivateRoute>
                    <RequirePasswordChanged>
                      <Layout />
                    </RequirePasswordChanged>
                  </PrivateRoute>
                }>
                  <Route index element={<RoleRedirect />} />

                  {/* Admin / Directivo routes */}
                  <Route path="estudiantes" element={<EstudiantesPage />} />
                  <Route path="docentes" element={<DocentesPage />} />
                  <Route path="cursos" element={<CursosPage />} />
                  <Route path="calificaciones" element={<CalificacionesPage />} />
                  <Route path="asistencia" element={<AsistenciaPage />} />
                  <Route path="pagos" element={<PagosPage />} />
                  <Route path="inscripciones" element={<InscripcionesPage />} />
                  <Route path="horario" element={<HorarioPage />} />
                  <Route path="anio-academico" element={<AnioAcademicoPage />} />

                  {/* Teacher routes */}
                  <Route path="docente" element={<TeacherDashboard />} />
                  <Route path="docente/cursos/:id" element={<TeacherCoursePage />} />

                  {/* Student routes */}
                  <Route path="estudiante" element={<StudentPortalPage />} />

                  {/* Profile route */}
                  <Route path="perfil" element={<ProfilePage />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ConfigProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
