import PropTypes from "prop-types";
import { HashRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { NotificationProvider } from "./context/NotificationProvider";
import { ThemeModeProvider } from "./theme/ThemeModeProvider";

export function AppProviders({ children, Router = HashRouter, routerProps }) {
  return (
    <ThemeModeProvider>
      <NotificationProvider>
        <Router {...routerProps}>
          <AuthProvider>{children}</AuthProvider>
        </Router>
      </NotificationProvider>
    </ThemeModeProvider>
  );
}

AppProviders.propTypes = {
  children: PropTypes.node.isRequired,
  Router: PropTypes.elementType,
  routerProps: PropTypes.object,
};
