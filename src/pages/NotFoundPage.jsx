import { Link as RouterLink } from "react-router-dom";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ROUTES } from "../config/app";

export default function NotFoundPage() {
  return (
    <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ minHeight: "100vh", textAlign: "center", p: 3 }}>
      <Typography variant="h2" component="p" color="primary" sx={{ fontWeight: 800 }}>
        404
      </Typography>
      <Typography variant="h5" component="h1">
        No encontramos esa página
      </Typography>
      <Typography color="text.secondary">Puede que el enlace esté roto o que la página se haya movido.</Typography>
      <Button component={RouterLink} to={ROUTES.dashboard} variant="contained">
        Volver al inicio
      </Button>
    </Stack>
  );
}
