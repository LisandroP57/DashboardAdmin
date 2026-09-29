import { Component } from "react";
import PropTypes from "prop-types";
import { ErrorState } from "./StateViews";

// Evita que un error de renderizado deje la pantalla en blanco.
export class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Error de renderizado:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          message="Algo salió mal al mostrar esta pantalla."
          onRetry={() => window.location.reload()}
        />
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = { children: PropTypes.node };
