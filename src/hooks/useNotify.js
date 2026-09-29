import { useContext } from "react";
import { NotificationContext } from "../context/notificationContext";

export function useNotify() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotify debe usarse dentro de <NotificationProvider>.");
  return context;
}
