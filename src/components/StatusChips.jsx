import PropTypes from "prop-types";
import Chip from "@mui/material/Chip";
import { ORDER_STATUS_MAP } from "../config/catalog";
import { LOW_STOCK_THRESHOLD } from "../config/app";

export function OrderStatusChip({ status }) {
  const config = ORDER_STATUS_MAP[status] ?? { label: status, color: "default" };
  return <Chip size="small" label={config.label} color={config.color} variant="outlined" />;
}

export function StockChip({ stock }) {
  if (stock <= 0) return <Chip size="small" label="Sin stock" color="error" />;
  if (stock <= LOW_STOCK_THRESHOLD) return <Chip size="small" label={`Stock bajo · ${stock}`} color="warning" />;
  return <Chip size="small" label={stock} variant="outlined" />;
}

OrderStatusChip.propTypes = { status: PropTypes.string.isRequired };
StockChip.propTypes = { stock: PropTypes.number.isRequired };
