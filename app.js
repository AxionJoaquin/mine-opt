// C:\Axion\COPIAPO\Planificación Mina\mine-opt\app.js

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Actualiza el estado para que el siguiente render muestre la UI de fallback
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // También puedes registrar el error en un servicio de reporte de errores
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      // Puedes renderizar cualquier UI de fallback personalizada
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
            {/* Opcional: Mostrar detalles del error en modo desarrollo */}
            {/* <details className="text-sm text-gray-500 mt-4">
              <summary>Detalles del error</summary>
              <pre className="text-left whitespace-pre-wrap">{this.state.error && this.state.error.toString()}</pre>
            </details> */}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// --- FUNCIÓN DE OPTIMIZACIÓN - AHORA LLAMA AL BACKEND PYTHON ---
// Esta función es la que reemplaza la lógica de simulación de `utils/optimizationEngine.js`
// y se comunica con el microservicio Python de PuLP.
async function runOptimization(parameters) {
  try {
    // La URL debe apuntar a la dirección donde tu microservicio Python está escuchando
    const response = await fetch('http://127.0.0.1:5000/optimize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Envía los parámetros de la UI React al Python como JSON
      body: JSON.stringify(parameters),
    });

    if (!response.ok) {
      // Si el servidor Python devuelve un código de estado HTTP de error (ej. 500),
      // intentamos leer el mensaje de error del cuerpo de la respuesta.
      const errorData = await response.json();
      throw new Error(errorData.error || `Error del servidor de optimización: ${response.status} ${response.statusText}`);
    }

    // Si la respuesta es exitosa (código 200 OK), parseamos los resultados JSON
    const optimizationResults = await response.json();
    return optimizationResults;

  } catch (error) {
    // Capturamos cualquier error de red, JSON malformado, o errores lanzados desde el servidor
    console.error('Error al comunicarse con el microservicio de optimización:', error);
    // Relanzamos el error para que `handleOptimize` en el componente App pueda manejarlo
    throw new Error('Error al ejecutar la optimización: ' + error.message);
  }
}
// --- FIN DE LA FUNCIÓN DE OPTIMIZACIÓN ---


function App() {
  // El bloque try-catch aquí es redundante si se usa ErrorBoundary y los errores se manejan en handleOptimize
  // Pero se mantiene por si hay errores durante la inicialización de React hooks o el render inicial.
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
        // Llama a la función runOptimization (que ahora se comunica con Python)
        const optimizationResults = await runOptimization(parameters);
        setResults(optimizationResults);
        setActiveTab('results'); // Cambia a la pestaña de resultados al finalizar
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
                  disabled={!results} // Deshabilita la pestaña de resultados si no hay resultados
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
            {activeTab === 'results' && !results && (
                <div className="text-center py-12">
                  <div className="icon-info text-4xl text-[var(--text-secondary)] mb-4"></div>
                  <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                    No hay resultados para mostrar
                  </h3>
                  <p className="text-[var(--text-secondary)] mb-6">
                    Ejecute la optimización desde la pestaña "Optimización" para ver los resultados.
                  </p>
                </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('App component error:', error);
    // Si un error ocurre durante el render inicial o la configuración de hooks,
    // ErrorBoundary no siempre lo atrapa directamente si no es dentro de un ciclo de vida.
    // Retornar null o una UI de fallback simple aquí es una medida de seguridad.
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-900 mb-4">Error crítico de la aplicación</h1>
          <p className="text-red-700 mb-4">No se pudo cargar la interfaz principal. Por favor, recargue.</p>
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
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);