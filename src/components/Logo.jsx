import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { APP_NAME } from "../config/app";

export function Logo({ size = 36, showName = true }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box
        aria-hidden="true"
        sx={{
          width: size,
          height: size,
          borderRadius: 2,
          display: "grid",
          placeItems: "center",
          color: "primary.contrastText",
          bgcolor: "primary.main",
        }}
      >
        <StorefrontIcon fontSize="small" />
      </Box>
      {showName && (
        <Typography variant="h6" component="span" sx={{ fontWeight: 700, letterSpacing: "-0.01em" }}>
          {APP_NAME}
        </Typography>
      )}
    </Stack>
  );
}

Logo.propTypes = { size: PropTypes.number, showName: PropTypes.bool };
