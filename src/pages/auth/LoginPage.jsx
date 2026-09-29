import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useFormik } from "formik";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { AuthLayout } from "../../layouts/AuthLayout";
import { DEMO_ACCOUNT, ROUTES } from "../../config/app";
import { useAuth } from "../../hooks/useAuth";
import { getErrorMessage } from "../../services/errors";
import { getFieldProps } from "../../utils/formik";
import { validateLogin } from "../../utils/validators";

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [demoLoading, setDemoLoading] = useState(false);

  const formik = useFormik({
    initialValues: { email: "", password: "", remember: false },
    validate: validateLogin,
    onSubmit: async (values) => {
      setSubmitError("");
      try {
        await login(values);
      } catch (error) {
        setSubmitError(getErrorMessage(error));
      }
    },
  });

  const handleDemoLogin = async () => {
    setSubmitError("");
    setDemoLoading(true);
    try {
      await login({ email: DEMO_ACCOUNT.email, password: DEMO_ACCOUNT.password, remember: false });
    } catch (error) {
      setSubmitError(getErrorMessage(error));
      setDemoLoading(false);
    }
  };

  const busy = formik.isSubmitting || demoLoading;

  return (
    <AuthLayout
      title="Iniciar sesión"
      subtitle="Ingresá con tu cuenta para administrar tu tienda."
      footer={
        <Typography variant="body2">
          ¿No tenés cuenta?{" "}
          <Link component={RouterLink} to={ROUTES.register} fontWeight={600}>
            Registrate
          </Link>
        </Typography>
      }
    >
      <form onSubmit={formik.handleSubmit} noValidate>
        <Stack spacing={2}>
          {submitError && <Alert severity="error">{submitError}</Alert>}

          <TextField
            {...getFieldProps(formik, "email")}
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            autoFocus
            fullWidth
          />
          <TextField
            {...getFieldProps(formik, "password")}
            id="password"
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    onClick={() => setShowPassword((visible) => !visible)}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <FormControlLabel
            control={<Checkbox name="remember" checked={formik.values.remember} onChange={formik.handleChange} />}
            label="Mantener la sesión iniciada"
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={busy}
            startIcon={formik.isSubmitting ? <CircularProgress size={18} color="inherit" /> : null}
          >
            {formik.isSubmitting ? "Ingresando…" : "Ingresar"}
          </Button>

          <Divider>o</Divider>

          <Button variant="outlined" size="large" onClick={handleDemoLogin} disabled={busy}>
            {demoLoading ? "Ingresando…" : "Probar con la cuenta demo"}
          </Button>
          <Typography variant="caption" color="text.secondary" align="center">
            Cuenta demo: {DEMO_ACCOUNT.email} · {DEMO_ACCOUNT.password}
          </Typography>
        </Stack>
      </form>
    </AuthLayout>
  );
}
