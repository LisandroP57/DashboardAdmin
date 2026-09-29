import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { NotificationContext } from "./notificationContext";

export function NotificationProvider({ children }) {
  const [toast, setToast] = useState({ open: false, message: "", severity: "info", key: 0 });

  const notify = useMemo(() => {
    const show = (severity) => (message) =>
      setToast((prev) => ({ open: true, message, severity, key: prev.key + 1 }));
    return { success: show("success"), error: show("error"), warning: show("warning"), info: show("info") };
  }, []);

  const handleClose = (_event, reason) => {
    if (reason === "clickaway") return;
    setToast((prev) => ({ ...prev, open: false }));
  };

  return (
    <NotificationContext.Provider value={notify}>
      {children}
      <Snackbar
        key={toast.key}
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleClose} severity={toast.severity} variant="filled" sx={{ width: "100%" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}

NotificationProvider.propTypes = { children: PropTypes.node.isRequired };
