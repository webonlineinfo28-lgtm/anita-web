import { Component } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

/**
 * Contenedor a prueba de catástrofes: si un panel falla (p. ej. un bug en el
 * bombo del bingo), solo se cae ese panel — el resto del festival sigue vivo.
 *
 * Uso: <ErrorBoundary label="Bingo"><BingoPanel … /></ErrorBoundary>
 * En desarrollo muestra el stack real; en producción, un mensaje limpio.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
    this.reset = () => this.setState({ error: null });
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Log ligero y sin PII; útil para diagnóstico remoto.
    console.error(`[ErrorBoundary:${this.props.label || "panel"}]`, error, info?.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div
        role="alert"
        className="glass-card flex min-h-[160px] flex-col items-center justify-center gap-3 p-6 text-center"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-red-400">
          <AlertTriangle size={18} />
        </span>
        <div>
          <p className="text-sm font-bold text-white">
            {this.props.label || "Este panel"} falló
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            El resto del festival sigue en pie.
          </p>
        </div>
        <button onClick={this.reset} className="btn btn-secondary btn-sm">
          <RotateCcw size={12} /> Reintentar
        </button>
        {import.meta.env.DEV && (
          <pre className="max-h-24 max-w-full overflow-auto rounded-lg bg-black/50 p-2 text-left text-[10px] text-red-300/80">
            {String(error?.message || error)}
          </pre>
        )}
      </div>
    );
  }
}
