function ParameterInput({ onParametersUpdate }) {
  try {
    const [numDays, setNumDays] = React.useState(31);
    const [numTrucks, setNumTrucks] = React.useState(8);
    const [hoursPerDay] = React.useState(24);
    
    // Default parameters from the Python model
    const defaultFleetAvailability = {
      '1': 0.58, '2': 0.75, '3': 0.60, '4': 0.77, '5': 0.85, '6': 0.78, '7': 0.64,
      '8': 0.80, '9': 0.68, '10': 0.77, '11': 0.66, '12': 0.88, '13': 0.85, '14': 0.85,
      '15': 0.79, '16': 0.88, '17': 0.85, '18': 0.77, '19': 0.88, '20': 0.65, '21': 0.76,
      '22': 0.77, '23': 0.87, '24': 0.71, '25': 0.75, '26': 0.55, '27': 0.87, '28': 0.87,
      '29': 0.86, '30': 0.82, '31': 0.77
    };
    
    const defaultTargetUtilization = 0.72;
    const defaultDailyTonnage = 70000.0;
    
    const [fleetAvailability, setFleetAvailability] = React.useState(defaultFleetAvailability);
    const [targetUtilization, setTargetUtilization] = React.useState(defaultTargetUtilization);
    const [dailyTonnage, setDailyTonnage] = React.useState(defaultDailyTonnage);

    React.useEffect(() => {
      const parameters = {
        numDays,
        numTrucks,
        hoursPerDay,
        fleetAvailability,
        targetUtilization,
        dailyTonnage
      };
      onParametersUpdate(parameters);
    }, [numDays, numTrucks, fleetAvailability, targetUtilization, dailyTonnage]);

    const handleFleetAvailabilityChange = (day, value) => {
      setFleetAvailability(prev => ({
        ...prev,
        [day]: parseFloat(value) || 0
      }));
    };

    const resetToDefaults = () => {
      setFleetAvailability(defaultFleetAvailability);
      setTargetUtilization(defaultTargetUtilization);
      setDailyTonnage(defaultDailyTonnage);
    };

    return (
      <div className="space-y-8" data-name="parameter-input" data-file="components/ParameterInput.js">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            Configuración de Parámetros
          </h2>
          <button 
            onClick={resetToDefaults}
            className="btn btn-secondary"
          >
            <div className="icon-refresh-cw text-sm mr-2 inline-block"></div>
            Restaurar Valores por Defecto
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* General Parameters */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">
              Parámetros Generales
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Número de Días
                </label>
                <input
                  type="number"
                  value={numDays}
                  onChange={(e) => setNumDays(parseInt(e.target.value) || 31)}
                  min="1"
                  max="365"
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Número de Camiones
                </label>
                <input
                  type="number"
                  value={numTrucks}
                  onChange={(e) => setNumTrucks(parseInt(e.target.value) || 8)}
                  min="1"
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Utilización Objetivo (%)
                </label>
                <input
                  type="number"
                  value={targetUtilization * 100}
                  onChange={(e) => setTargetUtilization((parseFloat(e.target.value) || 72) / 100)}
                  min="0"
                  max="100"
                  step="0.1"
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Tonelaje Diario Objetivo (Ton)
                </label>
                <input
                  type="number"
                  value={dailyTonnage}
                  onChange={(e) => setDailyTonnage(parseFloat(e.target.value) || 70000)}
                  min="0"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Fleet Availability */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">
              Disponibilidad de Flota por Día
            </h3>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {Array.from({ length: numDays }, (_, i) => (
                <div key={i + 1} className="flex items-center space-x-3">
                  <label className="w-16 text-sm font-medium text-[var(--text-secondary)]">
                    Día {i + 1}:
                  </label>
                  <input
                    type="number"
                    value={fleetAvailability[`${i + 1}`] || 0}
                    onChange={(e) => handleFleetAvailabilityChange(`${i + 1}`, e.target.value)}
                    min="0"
                    max="1"
                    step="0.01"
                    className="input-field flex-1"
                  />
                  <span className="text-xs text-[var(--text-secondary)] w-8">
                    {Math.round((fleetAvailability[`${i + 1}`] || 0) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="icon-info text-lg text-blue-500 mr-3 mt-0.5"></div>
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                Información sobre los Parámetros
              </h4>
              <p className="text-sm text-blue-700">
                Estos parámetros controlan el modelo de optimización. La disponibilidad de flota 
                debe estar entre 0 y 1 (donde 1 = 100% disponible). La utilización objetivo 
                típicamente se mantiene alrededor del 72%.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('ParameterInput component error:', error);
    return null;
  }
}