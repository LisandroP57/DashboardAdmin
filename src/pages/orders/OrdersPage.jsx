import { useMemo, useState } from "react";
import { DataGrid, esES, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { PageHeader } from "../../components/PageHeader";
import { ErrorState } from "../../components/StateViews";
import { OrderStatusChip } from "../../components/StatusChips";
import { FINAL_STATUSES, ORDER_STATUSES } from "../../config/catalog";
import { useAsync } from "../../hooks/useAsync";
import { useAuth } from "../../hooks/useAuth";
import { useNotify } from "../../hooks/useNotify";
import { getErrorMessage } from "../../services/errors";
import { listOrders, updateOrderStatus } from "../../services/ordersService";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { can } from "../../utils/permissions";
import { OrderDetailsDialog } from "./OrderDetailsDialog";

const localeText = esES.components.MuiDataGrid.defaultProps.localeText;

export default function OrdersPage() {
  const { user } = useAuth();
  const notify = useNotify();
  const { data, loading, error, reload } = useAsync(listOrders);

  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const canUpdate = can(user, "order:update");

  const rows = useMemo(
    () => (data ?? []).filter((order) => statusFilter === "all" || order.status === statusFilter),
    [data, statusFilter],
  );

  const handleStatusChange = async (order, status) => {
    try {
      await updateOrderStatus(order.id, status);
      notify.success(`Pedido ${order.id} actualizado`);
      reload();
    } catch (err) {
      notify.error(getErrorMessage(err));
    }
  };

  const columns = useMemo(
    () => [
      { field: "id", headerName: "Pedido", width: 110 },
      {
        field: "createdAt",
        headerName: "Fecha",
        width: 130,
        valueFormatter: (params) => formatDate(params.value),
      },
      { field: "customerName", headerName: "Cliente", flex: 1, minWidth: 180 },
      { field: "unitsCount", headerName: "Unidades", type: "number", width: 100 },
      {
        field: "total",
        headerName: "Total",
        type: "number",
        width: 130,
        valueFormatter: (params) => formatCurrency(params.value),
      },
      {
        field: "status",
        headerName: "Estado",
        width: 170,
        sortable: true,
        renderCell: ({ row }) =>
          canUpdate && !FINAL_STATUSES.includes(row.status) ? (
            <Select
              size="small"
              variant="standard"
              disableUnderline
              value={row.status}
              onChange={(event) => handleStatusChange(row, event.target.value)}
              inputProps={{ "aria-label": `Estado del pedido ${row.id}` }}
              renderValue={(value) => <OrderStatusChip status={value} />}
              sx={{ width: "100%" }}
            >
              {ORDER_STATUSES.map((status) => (
                <MenuItem key={status.id} value={status.id}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>
          ) : (
            <OrderStatusChip status={row.status} />
          ),
      },
      {
        field: "actions",
        type: "actions",
        headerName: "Detalle",
        width: 80,
        getActions: ({ row }) => [
          <GridActionsCellItem
            key="view"
            icon={<VisibilityIcon />}
            label={`Ver detalle del pedido ${row.id}`}
            onClick={() => setSelected(row)}
          />,
        ],
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canUpdate],
  );

  if (error && !data) return <ErrorState message={getErrorMessage(error)} onRetry={reload} />;

  return (
    <>
      <PageHeader title="Pedidos" subtitle="Seguimiento y cambio de estado de las ventas." />

      <Card>
        <Stack direction="row" sx={{ p: 2 }}>
          <TextField
            select
            size="small"
            label="Estado"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="all">Todos</MenuItem>
            {ORDER_STATUSES.map((status) => (
              <MenuItem key={status.id} value={status.id}>
                {status.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        <Box sx={{ height: "calc(100vh - 340px)", minHeight: 460 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
              sorting: { sortModel: [{ field: "createdAt", sort: "desc" }] },
            }}
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 300 } } }}
            localeText={localeText}
            sx={{ border: 0 }}
          />
        </Box>
      </Card>

      {selected && <OrderDetailsDialog order={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
