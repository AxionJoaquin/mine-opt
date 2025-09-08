function ResultsViewer({ results }) {
  try {
    const [activeResultTab, setActiveResultTab] = React.useState('summary');
    
    React.useEffect(() => {
      if (results && activeResultTab === 'charts') {
        // Create utilization chart
        setTimeout(() => {
          const utilizationCtx = document.getElementById('utilizationChart');
          if (utilizationCtx && results.utilizationSummary) {
            new ChartJS(utilizationCtx, {
              type: 'line',
              data: {
                labels: results.utilizationSummary.map(item => `Día ${item.period}`),
                datasets: [{
                  label: 'Utilización Real',
                  data: results.utilizationSummary.map(item => item.realUtilization * 100),
                  borderColor: 'rgb(30, 64, 175)',
                  backgroundColor: 'rgba(30, 64, 175, 0.1)',
                  tension: 0.4
                }, {
                  label: 'Utilización Objetivo',
                  data: results.utilizationSummary.map(item => item.targetUtilization * 100),
                  borderColor: 'rgb(245, 158, 11)',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  borderDash: [5, 5]
                }]
              },
              options: {
                responsive: true,
                plugins: {
                  legend: { display: true, position: 'top' },
                  title: { display: true, text: 'Utilización de Flota por Día (%)' }
                },
                scales: {
                  y: { beginAtZero: true, max: 100 }
                }
              }
            });
          }
          
          // Create tonnage chart
          const tonnageCtx = document.getElementById('tonnageChart');
          if (tonnageCtx && results.dailyTonnage) {
            new ChartJS(tonnageCtx, {
              type: 'bar',
              data: {
                labels: results.dailyTonnage.map(item => `Día ${item.period}`),
                datasets: [{
                  label: 'Tonelaje Movido',
                  data: results.dailyTonnage.map(item => item.tonnage),
                  backgroundColor: 'rgba(5, 150, 105, 0.6)',
                  borderColor: 'rgb(5, 150, 105)',
                  borderWidth: 1
                }]
              },
              options: {
                responsive: true,
                plugins: {
                  legend: { display: false },
                  title: { display: true, text: 'Tonelaje Diario Movido' }
                },
                scales: {
                  y: { beginAtZero: true }
                }
              }
            });
          }
        }, 100);
      }
    }, [results, activeResultTab]);

    return (
      <div className="space-y-8" data-name="results-viewer" data-file="components/ResultsViewer.js">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            Resultados de Optimización
          </h2>
          <p className="text-[var(--text-secondary)]">
            Análisis de los resultados del modelo de optimización de transporte.
          </p>
        </div>

        {/* Result Tabs */}
        <div className="border-b border-[var(--border-color)]">
          <nav className="flex space-x-8">
            {['summary', 'charts', 'details'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveResultTab(tab)}
                className={`pb-2 border-b-2 font-medium text-sm capitalize ${
                  activeResultTab === tab
                    ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tab === 'summary' ? 'Resumen' : 
                 tab === 'charts' ? 'Gráficos' : 'Detalles'}
              </button>
            ))}
          </nav>
        </div>

        {/* Summary Tab */}
        {activeResultTab === 'summary' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6">
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">Estado de Solución</h3>
              <div className="text-center">
                <div className={`text-2xl font-bold ${results.status === 'Optimal' ? 'text-green-600' : 'text-red-600'}`}>
                  {results.status === 'Optimal' ? 'Óptima' : 'No Óptima'}
                </div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">Estado del modelo</div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">Función Objetivo</h3>
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--primary-color)]">
                  {results.objectiveValue?.toFixed(4) || 'N/A'}
                </div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">Suma de desviaciones</div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">Utilización Promedio</h3>
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--accent-color)]">
                  {results.avgUtilization ? `${(results.avgUtilization * 100).toFixed(1)}%` : 'N/A'}
                </div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">Promedio del período</div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Tab */}
        {activeResultTab === 'charts' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card p-6">
              <canvas id="utilizationChart" width="400" height="200"></canvas>
            </div>
            <div className="card p-6">
              <canvas id="tonnageChart" width="400" height="200"></canvas>
            </div>
          </div>
        )}

        {/* Details Tab */}
        {activeResultTab === 'details' && results.utilizationSummary && (
          <div className="space-y-6">
            <div className="card overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-[var(--border-color)]">
                <h3 className="font-semibold text-[var(--text-primary)]">Utilización por Día</h3>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Día</th>
                      <th>Utilización Real</th>
                      <th>Utilización Objetivo</th>
                      <th>Desviación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.utilizationSummary.map((item, index) => (
                      <tr key={index}>
                        <td>{item.period}</td>
                        <td>{(item.realUtilization * 100).toFixed(2)}%</td>
                        <td>{(item.targetUtilization * 100).toFixed(2)}%</td>
                        <td>{item.deviation?.toFixed(4) || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('ResultsViewer component error:', error);
    return null;
  }
}
