import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, IconButton, Avatar,
  Divider, Tooltip, Menu, MenuItem, useTheme, useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import BookIcon from '@mui/icons-material/Book';
import GradeIcon from '@mui/icons-material/Grade';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PaymentIcon from '@mui/icons-material/Payment';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import DateRangeIcon from '@mui/icons-material/DateRange';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Badge from '@mui/material/Badge';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import { useAuth } from '../contexts/AuthContext';
import { useConfig } from '../contexts/ConfigContext';
import { communicationService } from '../services/communicationService';

const DRAWER_WIDTH = 240;

type Role = 'estudiante' | 'docente' | 'padre' | 'administrativo' | 'directivo';

const NAV_ITEMS: { label: string; icon: React.ReactElement; path: string; roles?: Role[] }[] = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/', roles: ['administrativo', 'directivo'] },
  { label: 'Mis Cursos', icon: <BookIcon />, path: '/docente', roles: ['docente'] },
  { label: 'Mi Portal', icon: <BookIcon />, path: '/estudiante', roles: ['estudiante'] },
  { label: 'Estudiantes', icon: <PeopleIcon />, path: '/estudiantes', roles: ['administrativo', 'directivo'] },
  { label: 'Inscripciones', icon: <AssignmentIndIcon />, path: '/inscripciones', roles: ['administrativo'] },
  { label: 'Docentes', icon: <SchoolIcon />, path: '/docentes', roles: ['administrativo', 'directivo'] },
  { label: 'Materias', icon: <BookIcon />, path: '/cursos', roles: ['administrativo', 'directivo'] },
  { label: 'Horario', icon: <CalendarMonthIcon />, path: '/horario', roles: ['administrativo', 'directivo'] },
  { label: 'Calificaciones', icon: <GradeIcon />, path: '/calificaciones', roles: ['administrativo', 'directivo'] },
  { label: 'Asistencia', icon: <EventAvailableIcon />, path: '/asistencia', roles: ['administrativo', 'directivo'] },
  { label: 'Pagos', icon: <PaymentIcon />, path: '/pagos', roles: ['administrativo', 'directivo'] },
  { label: 'Año Académico', icon: <DateRangeIcon />, path: '/anio-academico', roles: ['directivo'] },
  { label: 'Mi Perfil', icon: <PersonIcon />, path: '/perfil' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { anios, anioActivo, trimestreActual, periodoVisor, setPeriodoVisor } = useConfig();
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      communicationService.getNotificaciones()
        .then(notifs => {
          setUnreadCount(notifs.filter((n: any) => !n.leido).length);
        })
        .catch(() => {});
    }
  }, [user]);
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const isAdmin = user?.role === 'directivo' || user?.role === 'administrativo';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const ROLE_LABELS: Record<string, string> = {
    administrativo: 'Administrativo',
    directivo: 'Directivo',
    docente: 'Docente',
    estudiante: 'Estudiante',
    padre: 'Padre de familia',
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* ── Cabecera del sidebar ── */}
      <Box
        sx={{
          background: 'linear-gradient(160deg, #145214 0%, #1B5E20 100%)',
          color: 'white',
          px: 2,
          pt: 2.5,
          pb: isAdmin && anioActivo ? 2 : 2.5,
        }}
      >
        {/* Logo + nombre */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: isAdmin && anioActivo ? 2 : 0 }}>
          <Box
            component="img"
            src="/logo.png"
            alt="Escudo"
            sx={{
              width: 44,
              height: 44,
              objectFit: 'contain',
              flexShrink: 0,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
            }}
          />
          <Box sx={{ overflow: 'hidden' }}>
            <Typography sx={{ fontWeight: 700, fontSize: 13, lineHeight: 1.25, whiteSpace: 'nowrap' }}>
              Col. Bautista B.B.
            </Typography>
            <Typography sx={{ fontSize: 10.5, opacity: 0.65, lineHeight: 1.3 }}>
              Sistema de Gestión Escolar
            </Typography>
          </Box>
        </Box>

        {/* Selector de año escolar */}
        {isAdmin && anioActivo && (
          <Box sx={{ pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
            <Typography sx={{
              fontSize: 10, opacity: 0.55, mb: 0.75,
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              Año escolar
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Select
                native size="small"
                value={periodoVisor || anioActivo?.nombre || ''}
                onChange={e => setPeriodoVisor(e.target.value === anioActivo?.nombre ? null : e.target.value)}
                sx={{
                  flex: 1, bgcolor: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 12,
                  '& .MuiNativeSelect-select': { py: 0.6, color: 'white', pr: '24px !important' },
                  '& .MuiNativeSelect-icon': { color: 'white' },
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                }}
              >
                {(anios || []).map(a => (
                  <option key={a.id} value={a.nombre} style={{ color: '#333' }}>{a.nombre}</option>
                ))}
              </Select>
              <Chip
                label={trimestreActual}
                size="small"
                sx={{
                  bgcolor: '#E65100', color: '#FFF',
                  fontWeight: 700, fontSize: 10.5, height: 26,
                  flexShrink: 0,
                }}
              />
            </Box>
          </Box>
        )}
      </Box>

      {/* ── Navegación ── */}
      <List sx={{ flexGrow: 1, py: 1.5, px: 1, overflowY: 'auto' }}>
        {NAV_ITEMS
          .filter(item => !item.roles || item.roles.includes(user?.role as Role))
          .map(({ label, icon, path }) => {
            const active = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
            return (
              <ListItem key={path} disablePadding sx={{ mb: 0.25 }}>
                <ListItemButton
                  onClick={() => { navigate(path); if (isMobile) setMobileOpen(false); }}
                  selected={active}
                  sx={{
                    borderRadius: 2,
                    py: 1,
                    px: 1.5,
                    '&.Mui-selected': {
                      bgcolor: '#1B5E20',
                      color: 'white',
                      '& .MuiListItemIcon-root': { color: 'white' },
                      '&:hover': { bgcolor: '#145214' },
                    },
                    '&:not(.Mui-selected):hover': { bgcolor: '#EEF3EE' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: active ? 'inherit' : '#637063' }}>
                    {icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={label}
                    slotProps={{
                      primary: {
                        style: { fontSize: 13.5, fontWeight: active ? 600 : 400, lineHeight: 1.3 },
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
      </List>

      {/* ── Pie — usuario ── */}
      <Box sx={{ p: 1.75, borderTop: '1px solid #E8EAE8' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Avatar
            sx={{
              width: 36, height: 36,
              bgcolor: '#1B5E20',
              fontSize: 13, fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 13, lineHeight: 1.3 }} noWrap>
              {user?.first_name} {user?.last_name}
            </Typography>
            <Typography sx={{ fontSize: 11, color: '#637063', lineHeight: 1.3 }} noWrap>
              {ROLE_LABELS[user?.role ?? ''] ?? user?.role}
            </Typography>
          </Box>
          <Tooltip title="Cerrar sesión" placement="top">
            <IconButton
              size="small"
              onClick={handleLogout}
              sx={{ color: '#9CA3AF', '&:hover': { color: '#1B5E20', bgcolor: '#EEF3EE' } }}
            >
              <LogoutIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1, display: { md: 'none' }, bgcolor: '#1B5E20' }}>
        <Toolbar>
          <IconButton color="inherit" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 15 }}>Col. Bautista B.B.</Typography>
          <Box sx={{ flex: 1 }} />
          <IconButton
            color="inherit"
            sx={{ mr: 1 }}
            onClick={async () => {
              await communicationService.marcarLeidas();
              setUnreadCount(0);
            }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: 14 }}>
              {user?.first_name?.[0]}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => { navigate('/perfil'); setAnchorEl(null); }}>
              <PersonIcon fontSize="small" sx={{ mr: 1 }} /> Mi Perfil
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Cerrar sesión
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 'none', boxShadow: 2 },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: { xs: 8, md: 0 }, bgcolor: '#F4F6F4', minHeight: '100vh' }}>
        <Outlet />
      </Box>
    </Box>
  );
}
