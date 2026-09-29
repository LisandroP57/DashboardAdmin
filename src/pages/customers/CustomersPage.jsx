import { useMemo } from "react";
import { DataGrid, esES, GridToolbar } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import { PageHeader } from "../../components/PageHeader";
import { ErrorState } from "../../components/StateViews";
import { useAsync } from "../../hooks/useAsync";
import { getErrorMessage } from "../../services/errors";
import { listCustomers } from "../../services/customersService";
import { formatCurrency, formatDate } from "../../utils/formatters";

const localeText = esES.components.MuiDataGrid.defaultProps.localeText;

const columns = [
  {
    field: "fullName",
    headerName: "Cliente",
    flex: 1,
    minWidth: 190,
    valueGetter: (params) => `${params.row.name} ${params.row.lastName}`,
  },
  { field: "email", headerName: "Email", flex: 1, minWidth: 230 },
  { field: "phone", headerName: "Teléfono", width: 140 },
  { field: "city", headerName: "Ciudad", width: 150 },
  { field: "ordersCount", headerName: "Pedidos", type: "number", width: 100 },
  {
    field: "totalSpent",
    headerName: "Total comprado",
    type: "number",
    width: 150,
    valueFormatter: (params) => formatCurrency(params.value),
  },
  {
    field: "createdAt",
    headerName: "Cliente desde",
    width: 140,
    valueFormatter: (params) => formatDate(params.value),
  },
];

export default function CustomersPage() {
  const { data, loading, error, reload } = useAsync(listCustomers);
  const rows = useMemo(() => data ?? [], [data]);

  if (error && !data) return <ErrorState message={getErrorMessage(error)} onRetry={reload} />;

  return (
    <>
      <PageHeader title="Clientes" subtitle="Compradores registrados y su historial de compras." />

      <Card>
        <Box sx={{ height: "calc(100vh - 270px)", minHeight: 460 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
              sorting: { sortModel: [{ field: "totalSpent", sort: "desc" }] },
            }}
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 300 } } }}
            localeText={localeText}
            sx={{ border: 0 }}
          />
        </Box>
      </Card>
    </>
  );
}
