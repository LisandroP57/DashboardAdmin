import { useState } from "react";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Chip from "@mui/material/Chip";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { PageHeader } from "../../components/PageHeader";
import { APP_NAME, APP_VERSION, ROLE_LABELS } from "../../config/app";
import { useAuth } from "../../hooks/useAuth";
import { useNotify } from "../../hooks/useNotify";
import { useThemeMode } from "../../hooks/useThemeMode";
import { resetDemoData } from "../../services/db";
import { formatDate, getInitials } from "../../utils/formatters";
import { can } from "../../utils/permissions";

const STACK = ["React 18", "Vite", "Material UI", "MUI X DataGrid", "Chart.js", "Formik", "React Router", "Vitest"];

export default function SettingsPage() {
  const { user } = useAuth();
  const notify = useNotify();
  const { mode, toggleMode } = useThemeMode();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const canReset = can(user, "data:reset");

  const handleReset = () => {
    resetDemoData();
    setConfirmOpen(false);
    notify.success("Datos de demostración restablecidos");
  };

  return (
    <>
      <PageHeader title="Configuración" subtitle="Tu perfil, la apariencia y los datos de la aplicación." />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardHeader title="Perfil" />
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.main" }}>
                  {getInitials(user.name, user.lastName)}
                </Avatar>
                <div>
                  <Typography variant="h6">
                    {user.name} {user.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Chip size="small" color="primary" label={ROLE_LABELS[user.role] ?? user.role} />
                    <Chip size="small" variant="outlined" label={`Alta: ${formatDate(user.createdAt)}`} />
                  </Stack>
                </div>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardHeader title="Apariencia" />
            <CardContent>
              <FormControlLabel
                control={<Switch checked={mode === "dark"} onChange={toggleMode} />}
                label="Tema oscuro"
              />
              <Typography variant="body2" color="text.secondary">
                La preferencia se guarda en este navegador.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardHeader title="Datos de demostración" />
            <CardContent>
              <Stack spacing={2} alignItems="flex-start">
                <Alert severity="info" sx={{ width: "100%" }}>
                  Todo se guarda en el almacenamiento local de tu navegador: no hay servidor ni base de datos
                  externa.
                </Alert>
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<RestartAltIcon />}
                  disabled={!canReset}
                  onClick={() => setConfirmOpen(true)}
                >
                  Restablecer datos
                </Button>
                {!canReset && (
                  <Typography variant="caption" color="text.secondary">
                    Solo los administradores pueden restablecer los datos.
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardHeader title="Acerca de" subheader={`${APP_NAME} · v${APP_VERSION}`} />
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Proyecto de portfolio construido con:
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {STACK.map((item) => (
                  <Chip key={item} size="small" variant="outlined" label={item} />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <ConfirmDialog
        open={confirmOpen}
        title="Restablecer datos"
        message="Se volverán a generar los productos, clientes y pedidos de demostración. Los cambios que hiciste se perderán."
        confirmLabel="Restablecer"
        onConfirm={handleReset}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  );
}
