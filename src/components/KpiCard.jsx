import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { formatPercent } from "../utils/formatters";

export function KpiCard({ title, value, change, icon, hint }) {
  const hasChange = typeof change === "number" && Number.isFinite(change);
  const positive = hasChange && change >= 0;

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            {title}
          </Typography>
          <Box
            aria-hidden="true"
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              color: "primary.main",
              bgcolor: (theme) =>
                theme.palette.mode === "dark" ? "rgba(129,140,248,0.15)" : "rgba(79,70,229,0.08)",
            }}
          >
            {icon}
          </Box>
        </Stack>

        <Typography variant="h4" component="p" sx={{ mt: 1, mb: 1 }}>
          {value ?? <Skeleton width={120} />}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          {hasChange && (
            <Chip
              size="small"
              color={positive ? "success" : "error"}
              icon={positive ? <TrendingUpIcon /> : <TrendingDownIcon />}
              label={formatPercent(change)}
            />
          )}
          {hint && (
            <Typography variant="caption" color="text.secondary">
              {hint}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

KpiCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.node,
  change: PropTypes.number,
  icon: PropTypes.node.isRequired,
  hint: PropTypes.string,
};
