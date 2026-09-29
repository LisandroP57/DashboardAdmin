import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useFormik } from "formik";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { AuthLayout } from "../../layouts/AuthLayout";
import { ROUTES } from "../../config/app";
import { useAuth } from "../../hooks/useAuth";
import { getErrorMessage } from "../../services/errors";
import { getFieldProps } from "../../utils/formik";
import { validateRegister } from "../../utils/validators";

export default function RegisterPage() {
  const { register } = useAuth();
  const [submitError, setSubmitError] = useState("");

  const formik = useFormik({
    initialValues: { name: "", lastName: "", email: "", password: "", confirmPassword: "", terms: false },
    validate: validateRegister,
    onSubmit: async ({ name, lastName, email, password }) => {
      setSubmitError("");
      try {
        await register({ name, lastName, email, password });
      } catch (error) {
        setSubmitError(getErrorMessage(error));
      }
    },
  });

  const termsError = formik.touched.terms && formik.errors.terms;

  return (
    <AuthLayout
      title="Crear cuenta"
      subtitle="Registrate para acceder al panel de administración."
      footer={
        <Typography variant="body2">
          ¿Ya tenés una cuenta?{" "}
          <Link component={RouterLink} to={ROUTES.login} fontWeight={600}>
            Iniciá sesión
          </Link>
        </Typography>
      }
    >
      <form onSubmit={formik.handleSubmit} noValidate>
        <Grid container spacing={2}>
          {submitError && (
            <Grid item xs={12}>
              <Alert severity="error">{submitError}</Alert>
            </Grid>
          )}

          <Grid item xs={12} sm={6}>
            <TextField {...getFieldProps(formik, "name")} id="name" label="Nombre" autoComplete="given-name" autoFocus fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField {...getFieldProps(formik, "lastName")} id="lastName" label="Apellido" autoComplete="family-name" fullWidth />
          </Grid>
          <Grid item xs={12}>
            <TextField {...getFieldProps(formik, "email")} id="email" label="Email" type="email" autoComplete="email" fullWidth />
          </Grid>
          <Grid item xs={12}>
            <TextField
              {...getFieldProps(formik, "password")}
              id="password"
              label="Contraseña"
              type="password"
              autoComplete="new-password"
              fullWidth
              helperText={getFieldProps(formik, "password").helperText ?? "Mínimo 8 caracteres, con letras y números"}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              {...getFieldProps(formik, "confirmPassword")}
              id="confirmPassword"
              label="Repetir contraseña"
              type="password"
              autoComplete="new-password"
              fullWidth
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl error={Boolean(termsError)}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="terms"
                    checked={formik.values.terms}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                }
                label="Acepto los términos y condiciones"
              />
              {termsError && <FormHelperText>{formik.errors.terms}</FormHelperText>}
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={formik.isSubmitting}
              startIcon={formik.isSubmitting ? <CircularProgress size={18} color="inherit" /> : null}
            >
              {formik.isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
            </Button>
          </Grid>
        </Grid>
      </form>
    </AuthLayout>
  );
}
