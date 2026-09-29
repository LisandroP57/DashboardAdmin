import { useMemo, useState } from "react";
import { DataGrid, esES, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { PageHeader } from "../../components/PageHeader";
import { ErrorState } from "../../components/StateViews";
import { StockChip } from "../../components/StatusChips";
import { CATEGORIES, CATEGORY_LABELS } from "../../config/catalog";
import { LOW_STOCK_THRESHOLD } from "../../config/app";
import { useAsync } from "../../hooks/useAsync";
import { useAuth } from "../../hooks/useAuth";
import { useNotify } from "../../hooks/useNotify";
import { getErrorMessage } from "../../services/errors";
import { deleteProduct, listProducts } from "../../services/productsService";
import { formatCurrency } from "../../utils/formatters";
import { can } from "../../utils/permissions";
import { ProductFormDialog } from "./ProductFormDialog";

const localeText = esES.components.MuiDataGrid.defaultProps.localeText;

export default function ProductsPage() {
  const { user } = useAuth();
  const notify = useNotify();
  const { data, loading, error, reload } = useAsync(listProducts);

  const [category, setCategory] = useState("all");
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [formState, setFormState] = useState(null); // null = cerrado; { product } = abierto
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const canCreate = can(user, "product:create");
  const canUpdate = can(user, "product:update");
  const canDelete = can(user, "product:delete");

  const rows = useMemo(
    () =>
      (data ?? []).filter(
        (product) =>
          (category === "all" || product.category === category) &&
          (!onlyLowStock || product.stock <= LOW_STOCK_THRESHOLD),
      ),
    [data, category, onlyLowStock],
  );

  const columns = useMemo(
    () => [
      { field: "sku", headerName: "SKU", width: 110 },
      { field: "name", headerName: "Producto", flex: 1, minWidth: 220 },
      {
        field: "category",
        headerName: "Categoría",
        width: 140,
        valueGetter: (params) => CATEGORY_LABELS[params.value] ?? params.value,
      },
      {
        field: "price",
        headerName: "Precio",
        type: "number",
        width: 120,
        valueFormatter: (params) => formatCurrency(params.value),
      },
      {
        field: "stock",
        headerName: "Stock",
        type: "number",
        width: 150,
        align: "left",
        headerAlign: "left",
        renderCell: (params) => <StockChip stock={params.value} />,
      },
      {
        field: "status",
        headerName: "Estado",
        width: 110,
        renderCell: (params) => (
          <Chip
            size="small"
            variant="outlined"
            color={params.value === "active" ? "success" : "default"}
            label={params.value === "active" ? "Activo" : "Inactivo"}
          />
        ),
      },
      {
        field: "actions",
        type: "actions",
        headerName: "Acciones",
        width: 100,
        getActions: ({ row }) =>
          [
            canUpdate && (
              <GridActionsCellItem
                key="edit"
                icon={<EditIcon />}
                label={`Editar ${row.name}`}
                onClick={() => setFormState({ product: row })}
              />
            ),
            canDelete && (
              <GridActionsCellItem
                key="delete"
                icon={<DeleteIcon />}
                label={`Eliminar ${row.name}`}
                onClick={() => setToDelete(row)}
              />
            ),
          ].filter(Boolean),
      },
    ],
    [canUpdate, canDelete],
  );

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteProduct(toDelete.id);
      notify.success("Producto eliminado");
      setToDelete(null);
      reload();
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  if (error && !data) return <ErrorState message={getErrorMessage(error)} onRetry={reload} />;

  return (
    <>
      <PageHeader
        title="Productos"
        subtitle="Catálogo, precios y stock de tu tienda."
        actions={
          canCreate && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormState({ product: null })}>
              Nuevo producto
            </Button>
          )
        }
      />

      <Card>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ sm: "center" }}
          sx={{ p: 2 }}
        >
          <TextField
            select
            size="small"
            label="Categoría"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="all">Todas</MenuItem>
            {CATEGORIES.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.label}
              </MenuItem>
            ))}
          </TextField>
          <FormControlLabel
            control={<Switch checked={onlyLowStock} onChange={(event) => setOnlyLowStock(event.target.checked)} />}
            label={`Solo stock bajo (≤ ${LOW_STOCK_THRESHOLD})`}
          />
        </Stack>

        <Box sx={{ height: "calc(100vh - 340px)", minHeight: 460 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 300 } } }}
            localeText={localeText}
            sx={{ border: 0 }}
          />
        </Box>
      </Card>

      {formState && (
        <ProductFormDialog
          product={formState.product}
          onClose={() => setFormState(null)}
          onSaved={() => {
            setFormState(null);
            reload();
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Eliminar producto"
        message={`¿Seguro que querés eliminar "${toDelete?.name ?? ""}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setToDelete(null)}
      />
    </>
  );
}
