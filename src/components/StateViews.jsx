import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InboxIcon from "@mui/icons-material/Inbox";

export function LoadingState({ label = "Cargando…", minHeight = 240 }) {
  return (
    <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ minHeight }} role="status">
      <CircularProgress size={32} />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  );
}

export function ErrorState({ message = "No se pudo cargar la información.", onRetry }) {
  return (
    <Stack alignItems="center" justifyContent="center" spacing={1.5} sx={{ minHeight: 240, textAlign: "center" }}>
      <ErrorOutlineIcon color="error" sx={{ fontSize: 40 }} />
      <Typography variant="h6">Ocurrió un problema</Typography>
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
      {onRetry && (
        <Button variant="contained" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </Stack>
  );
}

export function EmptyState({ title, description }) {
  return (
    <Box sx={{ py: 5, textAlign: "center", color: "text.secondary" }}>
      <InboxIcon sx={{ fontSize: 36, mb: 1 }} />
      <Typography variant="subtitle1" color="text.primary">
        {title}
      </Typography>
      {description && <Typography variant="body2">{description}</Typography>}
    </Box>
  );
}

LoadingState.propTypes = { label: PropTypes.string, minHeight: PropTypes.number };
ErrorState.propTypes = { message: PropTypes.string, onRetry: PropTypes.func };
EmptyState.propTypes = { title: PropTypes.string.isRequired, description: PropTypes.string };
