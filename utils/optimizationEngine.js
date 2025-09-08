// En utils/optimizationEngine.js o directamente en app.js si lo vas a eliminar

// Elimina todas las constantes SOLIDS, DESTINATIONS, TIME_CYCLES, etc., de aquí.
// Toda esa lógica de "simulación" ya no es necesaria.

async function runOptimization(parameters) {
  try {
    const response = await fetch('http://127.0.0.1:5000/optimize', { // Asegúrate de que la URL coincida con tu backend
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parameters),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error HTTP: ${response.status}`);
    }

    const optimizationResults = await response.json();
    return optimizationResults;

  } catch (error) {
    console.error('Error al comunicarse con el backend de optimización:', error);
    throw new Error('Error al ejecutar la optimización: ' + error.message);
  }
}

// Ahora, si tenías un archivo `utils\optimizationEngine.js`, su contenido se reduciría a esta función `runOptimization`.
// Si esta función ya estaba en `app.js`, simplemente reemplazas su implementación.