class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Algo salió mal</h1>
            <p className="text-gray-600 mb-4">Lo sentimos, ocurrió un error inesperado.</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Recargar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  try {
    const [activeTab, setActiveTab] = React.useState('parameters');
    const [parameters, setParameters] = React.useState(null);
    const [results, setResults] = React.useState(null);
    const [isOptimizing, setIsOptimizing] = React.useState(false);

    const handleParametersUpdate = (newParams) => {
      setParameters(newParams);
    };

    const handleOptimize = async () => {
      if (!parameters) {
        alert('Por favor, configure los parámetros primero');
        return;
      }
      
      setIsOptimizing(true);
      try {
        const optimizationResults = await runOptimization(parameters);
        setResults(optimizationResults);
        setActiveTab('results');
      } catch (error) {
        console.error('Error en optimización:', error);
        alert('Error durante la optimización: ' + error.message);
      } finally {
        setIsOptimizing(false);
      }
    };

    return (
      <div className="min-h-screen bg-[var(--background-color)]" data-name="app" data-file="app.js">
        <Header />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Navigation Tabs */}
            <div className="mb-8">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('parameters')}
                  className={`pb-4 border-b-2 font-medium text-sm ${
                    activeTab === 'parameters'
                      ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                      : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <div className="icon-settings text-lg mr-2 inline-block"></div>
                  Parámetros
                </button>
                <button
                  onClick={() => setActiveTab('optimization')}
                  className={`pb-4 border-b-2 font-medium text-sm ${
                    activeTab === 'optimization'
                      ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                      : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <div className="icon-play text-lg mr-2 inline-block"></div>
                  Optimización
                </button>
                <button
                  onClick={() => setActiveTab('results')}
                  className={`pb-4 border-b-2 font-medium text-sm ${
                    activeTab === 'results'
                      ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                      : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                  disabled={!results}
                >
                  <div className="icon-chart-bar text-lg mr-2 inline-block"></div>
                  Resultados
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'parameters' && (
              <ParameterInput onParametersUpdate={handleParametersUpdate} />
            )}

            {activeTab === 'optimization' && (
              <OptimizationRunner 
                parameters={parameters}
                isOptimizing={isOptimizing}
                onOptimize={handleOptimize}
              />
            )}

            {activeTab === 'results' && results && (
              <ResultsViewer results={results} />
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('App component error:', error);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);