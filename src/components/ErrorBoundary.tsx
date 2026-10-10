import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900 font-sans">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-6 text-center space-y-4">
            <div className="inline-flex p-3 rounded-full bg-rose-50 text-rose-500 border border-rose-200/80">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Algo ocurrió al cargar la aplicación
            </h1>
            <p className="text-sm text-slate-500">
              Ha ocurrido un detalle inesperado al iniciar los datos locales. Puedes restablecer la aplicación para restaurar los valores iniciales.
            </p>
            {this.state.error && (
              <div className="p-3 bg-slate-100 rounded-lg text-xs font-mono text-slate-700 text-left overflow-auto max-h-24">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restablecer y recargar</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
