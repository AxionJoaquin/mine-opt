function OptimizationRunner({ parameters, isOptimizing, onOptimize }) {
  try {
    if (!parameters) {
      return (
        <div className="text-center py-12" data-name="optimization-runner" data-file="components/OptimizationRunner.js">
          <div className="icon-alert-circle text-4xl text-[var(--warning-color)] mb-4"></div>
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            Configuración Requerida
          </h3>
          <p className="text-[var(--text-secondary)] mb-6">
            Por favor, configure los parámetros en la pestaña anterior antes de ejecutar la optimización.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-8" data-name="optimization-runner" data-file="components/OptimizationRunner.js">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            Ejecutar Optimización
          </h2>
          <p className="text-[var(--text-secondary)]">
            Revise los parámetros configurados y ejecute el modelo de optimización de transporte.
          </p>
        </div>

        {/* Parameters Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--text-primary)]">Configuración General</h3>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <div className="icon-settings text-sm text-blue-600"></div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Días:</span>
                <span className="font-medium">{parameters.numDays}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Camiones:</span>
                <span className="font-medium">{parameters.numTrucks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Horas/día:</span>
                <span className="font-medium">{parameters.hoursPerDay}</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--text-primary)]">Objetivos</h3>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <div className="icon-target text-sm text-green-600"></div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Utilización:</span>
                <span className="font-medium">{(parameters.targetUtilization * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Tonelaje diario:</span>
                <span className="font-medium">{parameters.dailyTonnage.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--text-primary)]">Disponibilidad Promedio</h3>
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <div className="icon-truck text-sm text-yellow-600"></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--primary-color)]">
                {(Object.values(parameters.fleetAvailability).reduce((a, b) => a + b, 0) / Object.values(parameters.fleetAvailability).length * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-[var(--text-secondary)]">Promedio de flota</div>
            </div>
          </div>
        </div>

        {/* Optimization Controls */}
        <div className="card p-8">
          <div className="text-center space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                Modelo de Optimización Listo
              </h3>
              <p className="text-[var(--text-secondary)]">
                El modelo utilizará programación lineal para minimizar las desviaciones de utilización 
                mientras cumple con las restricciones de capacidad y disponibilidad.
              </p>
            </div>

            <div className="flex justify-center">
              <button
                onClick={onOptimize}
                disabled={isOptimizing}
                className={`btn btn-success text-lg px-8 py-3 ${isOptimizing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isOptimizing ? (
                  <>
                    <div className="icon-loader text-lg mr-3 inline-block animate-spin"></div>
                    Optimizando...
                  </>
                ) : (
                  <>
                    <div className="icon-play text-lg mr-3 inline-block"></div>
                    Ejecutar Optimización
                  </>
                )}
              </button>
            </div>

            {isOptimizing && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-center">
                  <div className="icon-clock text-blue-500 mr-2"></div>
                  <span className="text-sm text-blue-700">
                    Procesando el modelo de optimización... Esto puede tomar unos momentos.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Algorithm Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-[var(--text-primary)] mb-3">
            Acerca del Algoritmo de Optimización
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[var(--text-secondary)]">
            <div>
              <strong>Objetivo:</strong> Minimizar desviaciones de utilización de flota
            </div>
            <div>
              <strong>Método:</strong> Programación Lineal (Solver PuLP)
            </div>
            <div>
              <strong>Variables:</strong> Tonelaje movido por período, sólido y destino
            </div>
            <div>
              <strong>Restricciones:</strong> Capacidad, disponibilidad y objetivos de producción
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('OptimizationRunner component error:', error);
    return null;
  }
}