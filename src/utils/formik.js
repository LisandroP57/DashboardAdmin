// Props comunes de un TextField de MUI conectado a Formik.
export const getFieldProps = (formik, name) => ({
  name,
  value: formik.values[name],
  onChange: formik.handleChange,
  onBlur: formik.handleBlur,
  error: Boolean(formik.touched[name] && formik.errors[name]),
  helperText: (formik.touched[name] && formik.errors[name]) || undefined,
});
