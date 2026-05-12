import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Card, Table, TableHead,
  TableRow, TableCell, TableBody, Chip, CircularProgress, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, TableContainer, Tooltip, Alert, FormControlLabel, Switch, TablePagination,
  useTheme, useMediaQuery,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { studentService } from '../services/studentService';
import { useConfig } from '../contexts/ConfigContext';
import { Estudiante, Curso } from '../types';

const ESTADO_COLOR: Record<string, any> = {
  activo: 'success', inactivo: 'default', retirado: 'warning', egresado: 'info',
};

const emptyForm = { first_name: '', last_name: '', email: '', numero_expediente: '', documento: '', fecha_nacimiento: '', curso_id: '', estado: 'activo' };

export default function EstudiantesPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const rowsPerPage = 50;
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(emptyForm);
  const [editing, setEditing] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [filterSinCurso, setFilterSinCurso] = useState(false);
  const { anioActivo, periodoVisor } = useConfig();
  const selectedYear = periodoVisor || anioActivo?.nombre;

  const load = async (currentPage = page) => {
    setLoading(true);
    try {
      const [res, cur] = await Promise.all([
        studentService.getEstudiantes({ page: currentPage + 1 }),
        studentService.getCursos()
      ]);
      setEstudiantes(res?.results || []);
      setTotalCount(res?.count || 0);
      setCursos(cur || []);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(0); setPage(0); }, [filterSinCurso, selectedYear]);

  const handleChangePage = (_: any, newPage: number) => {
    setPage(newPage);
    load(newPage);
  };

  const openCreate = () => { setForm(emptyForm); setEditing(null); setError(''); setOpen(true); };
  
  // Nota: El filtrado local "filterSinCurso" ahora solo aplica a los resultados de la página actual.
  // Para un filtrado completo, debería implementarse en el backend.
  const estudiantesFiltrados = (estudiantes || []).filter((e) => {
    if (!filterSinCurso) return true;
    if (!selectedYear) return !e.curso;
    return !e.curso || e.curso.periodo !== selectedYear;
  });

  const openEdit = (e: Estudiante) => {
    setForm({ 
      first_name: e.user?.first_name || '',
      last_name: e.user?.last_name || '',
      email: e.user?.email || '',
      numero_expediente: e.numero_expediente, 
      documento: e.documento, 
      fecha_nacimiento: e.fecha_nacimiento, 
      curso_id: e.curso?.id || '', 
      estado: e.estado 
    });
    setEditing(e.id); setError(''); setOpen(true);
  };

  const handleSave = async () => {
    setError('');
    try {
      if (editing) await studentService.updateEstudiante(editing, form);
      else await studentService.createEstudiante(form);
      setOpen(false); load();
    } catch (err: any) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : 'Error al guardar.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Desactivar este estudiante?')) return;
    await studentService.deleteEstudiante(id);
    load();
  };

  if (loading && estudiantes.length === 0) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box>
      <Box sx={{ mb: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5 }}>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: { xs: '1.15rem', md: '1.35rem' } }}>Estudiantes</Typography>
            <Typography variant="caption" color="text.secondary">
              {selectedYear ? `Año: ${selectedYear}` : 'Sin año escolar activo'}
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ borderRadius: 2, flexShrink: 0 }}>
            Nuevo
          </Button>
        </Box>
        <FormControlLabel
          sx={{ mt: 1 }}
          control={<Switch checked={filterSinCurso} onChange={e => setFilterSinCurso(e.target.checked)} color="primary" size="small" />}
          label={<Typography variant="caption">Solo sin curso en año activo</Typography>}
        />
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 600 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell><b>Nombre</b></TableCell>
                <TableCell><b>Expediente</b></TableCell>
                <TableCell><b>Documento</b></TableCell>
                <TableCell><b>Curso</b></TableCell>
                <TableCell><b>Estado</b></TableCell>
                <TableCell align="right"><b>Acciones</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}><CircularProgress size={24} /></TableCell>
                </TableRow>
              ) : estudiantesFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    {filterSinCurso
                      ? `No hay estudiantes sin curso en el año ${selectedYear ?? 'activo'}`
                      : 'No hay estudiantes registrados'}
                  </TableCell>
                </TableRow>
              ) : (
                estudiantesFiltrados.map((e) => (
                  <TableRow key={e.id} hover>
                    <TableCell>{e.user?.first_name} {e.user?.last_name}</TableCell>
                    <TableCell>{e.numero_expediente}</TableCell>
                    <TableCell>{e.documento}</TableCell>
                    <TableCell>
                      {e.curso ? (
                        e.curso.periodo === selectedYear ? e.curso.nombre : `${e.curso.nombre} (${e.curso.periodo})`
                      ) : '—'}
                    </TableCell>
                    <TableCell><Chip label={e.estado} color={ESTADO_COLOR[e.estado]} size="small" /></TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar"><IconButton size="small" onClick={() => openEdit(e)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Desactivar"><IconButton size="small" color="error" onClick={() => handleDelete(e.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[50]}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </Box>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle>{editing ? 'Editar Estudiante' : 'Nuevo Estudiante'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Nombres" value={form.first_name} onChange={e => setForm(prev => ({ ...prev, first_name: e.target.value }))} fullWidth />
          <TextField label="Apellidos" value={form.last_name} onChange={e => setForm(prev => ({ ...prev, last_name: e.target.value }))} fullWidth />
          <TextField label="Email" type="email" value={form.email} onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))} fullWidth />
          <TextField label="N° Expediente" value={form.numero_expediente} onChange={e => setForm(prev => ({ ...prev, numero_expediente: e.target.value }))} fullWidth />
          <TextField label="Documento" value={form.documento} onChange={e => setForm(prev => ({ ...prev, documento: e.target.value }))} fullWidth />
          <TextField label="Fecha de nacimiento" type="date" value={form.fecha_nacimiento} onChange={e => setForm(prev => ({ ...prev, fecha_nacimiento: e.target.value }))} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
          <TextField label="Curso" select value={form.curso_id} onChange={e => setForm(prev => ({ ...prev, curso_id: e.target.value }))} fullWidth>
            <MenuItem value="">Sin asignar</MenuItem>
            {cursos.map(c => <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>)}
          </TextField>
          <TextField label="Estado" select value={form.estado} onChange={e => setForm(prev => ({ ...prev, estado: e.target.value }))} fullWidth>
            {['activo', 'inactivo', 'retirado', 'egresado'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>{editing ? 'Actualizar' : 'Crear'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
