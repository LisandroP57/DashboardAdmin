import { useState } from "react";
import PropTypes from "prop-types";
import { useFormik } from "formik";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import { CATEGORIES } from "../../config/catalog";
import { useNotify } from "../../hooks/useNotify";
import { getErrorMessage } from "../../services/errors";
import { createProduct, updateProduct } from "../../services/productsService";
import { getFieldProps } from "../../utils/formik";
import { validateProduct } from "../../utils/validators";

// Se monta solo cuando hay que mostrarlo, así el formulario siempre arranca con los valores correctos.
export function ProductFormDialog({ product, onClose, onSaved }) {
  const notify = useNotify();
  const [submitError, setSubmitError] = useState("");
  const isEdit = Boolean(product);

  const formik = useFormik({
    initialValues: {
      name: product?.name ?? "",
      sku: product?.sku ?? "",
      category: product?.category ?? "",
      price: product?.price ?? "",
      stock: product?.stock ?? "",
      description: product?.description ?? "",
      status: product?.status ?? "active",
    },
    validate: validateProduct,
    onSubmit: async (values) => {
      setSubmitError("");
      try {
        const saved = isEdit ? await updateProduct(product.id, values) : await createProduct(values);
        notify.success(isEdit ? "Producto actualizado" : "Producto creado");
        onSaved(saved);
      } catch (error) {
        setSubmitError(getErrorMessage(error));
      }
    },
  });

  return (
    <Dialog
      open
      onClose={formik.isSubmitting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ component: "form", onSubmit: formik.handleSubmit, noValidate: true }}
    >
      <DialogTitle>{isEdit ? "Editar producto" : "Nuevo producto"}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ pt: 0.5 }}>
          {submitError && (
            <Grid item xs={12}>
              <Alert severity="error">{submitError}</Alert>
            </Grid>
          )}
          <Grid item xs={12}>
            <TextField {...getFieldProps(formik, "name")} id="product-name" label="Nombre" fullWidth autoFocus required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              {...getFieldProps(formik, "sku")}
              id="product-sku"
              label="SKU"
              fullWidth
              helperText={getFieldProps(formik, "sku").helperText ?? (isEdit ? undefined : "Opcional: se genera solo")}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField {...getFieldProps(formik, "category")} id="product-category" label="Categoría" select fullWidth required>
              {CATEGORIES.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              {...getFieldProps(formik, "price")}
              id="product-price"
              label="Precio"
              type="number"
              fullWidth
              required
              inputProps={{ min: 0, step: "any" }}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              {...getFieldProps(formik, "stock")}
              id="product-stock"
              label="Stock"
              type="number"
              fullWidth
              required
              inputProps={{ min: 0, step: 1 }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              {...getFieldProps(formik, "description")}
              id="product-description"
              label="Descripción"
              fullWidth
              multiline
              minRows={3}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.status === "active"}
                  onChange={(event) => formik.setFieldValue("status", event.target.checked ? "active" : "inactive")}
                />
              }
              label="Producto activo"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={formik.isSubmitting}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={formik.isSubmitting}
          startIcon={formik.isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {isEdit ? "Guardar cambios" : "Crear producto"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ProductFormDialog.propTypes = {
  product: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
};
