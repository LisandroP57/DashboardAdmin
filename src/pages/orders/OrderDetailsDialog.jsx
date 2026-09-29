import PropTypes from "prop-types";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { OrderStatusChip } from "../../components/StatusChips";
import { formatCurrency, formatDateTime } from "../../utils/formatters";

export function OrderDetailsDialog({ order, onClose }) {
  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth aria-labelledby="order-details-title">
      <DialogTitle id="order-details-title">Pedido {order.id}</DialogTitle>
      <DialogContent dividers>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <div>
            <Typography variant="subtitle1">{order.customerName}</Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDateTime(order.createdAt)}
            </Typography>
          </div>
          <OrderStatusChip status={order.status} />
        </Stack>

        <TableContainer>
          <Table size="small" aria-label="Productos del pedido">
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell align="right">Cant.</TableCell>
                <TableCell align="right">Precio</TableCell>
                <TableCell align="right">Subtotal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.productId}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell align="right">{item.qty}</TableCell>
                  <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell align="right">{formatCurrency(item.qty * item.unitPrice)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} align="right" sx={{ fontWeight: 700 }}>
                  Total
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  {formatCurrency(order.total)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}

OrderDetailsDialog.propTypes = {
  order: PropTypes.shape({
    id: PropTypes.string.isRequired,
    customerName: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    total: PropTypes.number.isRequired,
    items: PropTypes.array.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};
