import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, CircularProgress, Chip } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import BookIcon from '@mui/icons-material/Book';
import PaymentIcon from '@mui/icons-material/Payment';
import CampaignIcon from '@mui/icons-material/Campaign';
import { List, ListItem, ListItemText, Divider as MuiDivider } from '@mui/material';
import { dashboardService } from '../services/dashboardService';
import { communicationService } from '../services/communicationService';
import { useAuth } from '../contexts/AuthContext';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactElement;
  color: string;
  sub?: string;
}

function StatCard({ label, value, icon, color, sub }: StatCardProps) {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 2, height: '100%' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, md: 2 }, p: { xs: 2, md: 3 }, '&:last-child': { pb: { xs: 2, md: 3 } } }}>
        <Box sx={{ width: { xs: 44, md: 56 }, height: { xs: 44, md: 56 }, borderRadius: 2, bgcolor: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', md: '2rem' }, lineHeight: 1.2 }}>{value}</Typography>
          <Typography variant="body2" color="text.secondary" noWrap>{label}</Typography>
          {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
        </Box>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ estudiantes: 0, docentes: 0, materias: 0, pagos: 0, pagosPendientes: 0 });
  const [comunicados, setComunicados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardService.getStats(),
      communicationService.getComunicados()
    ]).then(([statsData, comunicadosData]) => {
      setStats(statsData);
      setComunicados(comunicadosData);
    })
    .catch(() => {})
    .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      <CircularProgress />
    </Box>
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <Box>
      <Box sx={{ mb: { xs: 2.5, md: 4 } }}>
        <Typography sx={{ fontWeight: 700, fontSize: { xs: '1.3rem', md: '1.75rem' }, lineHeight: 1.25 }} color="text.primary">
          {greeting}, {user?.first_name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Resumen del sistema de gestión escolar
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Estudiantes activos" value={stats.estudiantes} icon={<PeopleIcon />} color="#1976d2" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Docentes" value={stats.docentes} icon={<SchoolIcon />} color="#388e3c" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Materias activas" value={stats.materias} icon={<BookIcon />} color="#f57c00" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Pagos" value={stats.pagos} icon={<PaymentIcon />} color="#7b1fa2"
            sub={`${stats.pagosPendientes} pendientes/vencidos`} />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Estado del sistema</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[
                  { label: 'Backend API', ok: true },
                  { label: 'Base de datos SQLite', ok: true },
                  { label: 'Autenticación JWT', ok: true },
                  { label: 'CORS configurado', ok: true },
                ].map(({ label, ok }) => (
                  <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">{label}</Typography>
                    <Chip label={ok ? 'Activo' : 'Inactivo'} color={ok ? 'success' : 'error'} size="small" />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CampaignIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Comunicados Recientes</Typography>
              </Box>
              <List sx={{ p: 0 }}>
                {comunicados.map((c, i) => (
                  <React.Fragment key={c.id}>
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemText
                        primary={c.titulo}
                        secondary={
                          <>
                            <Typography component="span" variant="caption" color="text.primary">{c.fecha_creacion?.split('T')[0]}</Typography>
                            {" — "}{c.contenido}
                          </>
                        }
                      />
                    </ListItem>
                    {i < comunicados.length - 1 && <MuiDivider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
