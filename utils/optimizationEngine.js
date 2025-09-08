// Optimization Engine - Simulates PuLP Linear Programming Model
// This module implements the mining transport optimization logic

// Static data from the Python model
const SOLIDS = [
  'Acopios_Mineral_2', 'Adicional_Patio_Tolva', 'F1_1015_0', 
  'F2_1165_0', 'F2_1177_5', 'F3_1177_5', 'F3_1190_0'
];

const DESTINATIONS = [
  'Acopio_1', 'Acopio_M2', 'BONE', 'BOSE', 'DR', 'Planta'
];

const TIME_CYCLES = {
  'Acopios_Mineral_2-Planta': 11.7/60, 'F1_1015_0-Planta': 18.0/60,
  'F3_1177_5-Planta': 13.5/60, 'F3_1190_0-Planta': 12.9/60,
  'F1_1015_0-BOSE': 30.1/60, 'F1_1015_0-Acopio_1': 20.6/60,
  'F1_1015_0-Acopio_M2': 22.3/60, 'F2_1177_5-BOSE': 27.4/60,
  'F2_1177_5-Acopio_1': 16.6/60, 'F2_1177_5-Acopio_M2': 17.9/60,
  'F2_1165_0-BOSE': 23.2/60, 'F3_1190_0-BONE': 18.4/60,
  'F3_1190_0-Acopio_1': 18.4/60, 'F3_1190_0-Acopio_M2': 11.8/60,
  'F3_1177_5-BOSE': 25.6/60, 'F3_1177_5-Acopio_1': 16.4/60,
  'F3_1177_5-Acopio_M2': 17.7/60, 'Adicional_Patio_Tolva-DR': 29.2/60
};

const TONNAGE_PER_TRUCK = {
  'Planta': 224.0, 'Acopio_1': 224.0, 'Acopio_M2': 224.0,
  'BOSE': 200.0, 'BONE': 200.0, 'DR': 200.0
};

const AVAILABLE_TONNAGE = {
  'Acopios_Mineral_2-Planta': 6000, 'F1_1015_0-Planta': 58000,
  'F3_1177_5-Planta': 202000, 'F3_1190_0-Planta': 190000,
  'F1_1015_0-BOSE': 80543, 'F1_1015_0-Acopio_1': 114462,
  'F1_1015_0-Acopio_M2': 21395, 'F2_1177_5-BOSE': 179881,
  'F2_1177_5-Acopio_1': 50355, 'F2_1177_5-Acopio_M2': 96926,
  'F2_1165_0-BOSE': 502663, 'F3_1190_0-BONE': 420289,
  'F3_1190_0-Acopio_1': 49006, 'F3_1190_0-Acopio_M2': 43413,
  'F3_1177_5-BOSE': 32983, 'F3_1177_5-Acopio_1': 129680,
  'F3_1177_5-Acopio_M2': 51128, 'Adicional_Patio_Tolva-DR': 60000
};

// Calculate effective yield for each route
function calculateEffectiveYield() {
  const yields = {};
  Object.keys(TIME_CYCLES).forEach(route => {
    const [solid, dest] = route.split('-');
    const tonnagePerTruck = TONNAGE_PER_TRUCK[dest];
    const timeCycle = TIME_CYCLES[route];
    yields[route] = tonnagePerTruck / timeCycle;
  });
  return yields;
}

// Simulate optimization algorithm
async function runOptimization(parameters) {
  try {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const { numDays, numTrucks, hoursPerDay, fleetAvailability, targetUtilization, dailyTonnage } = parameters;
    const effectiveYields = calculateEffectiveYield();
    
    // Initialize results structure
    const results = {
      status: 'Optimal',
      objectiveValue: 0,
      utilizationSummary: [],
      dailyTonnage: [],
      routeAllocations: {},
      avgUtilization: 0
    };

    let totalUtilization = 0;
    let totalDeviation = 0;

    // Process each day
    for (let day = 1; day <= numDays; day++) {
      const dayStr = day.toString();
      const availability = fleetAvailability[dayStr] || 0.75;
      
      // Simulate allocation logic for each route
      const dayAllocations = {};
      let dayTotalTonnage = 0;
      let dayUtilizationTime = 0;

      // Distribute tonnage across available routes
      Object.keys(TIME_CYCLES).forEach(route => {
        const yield_rate = effectiveYields[route];
        const maxCapacity = availability * numTrucks * hoursPerDay * yield_rate;
        const availableTonnage = AVAILABLE_TONNAGE[route] / numDays;
        
        // Allocate based on capacity and availability
        const allocation = Math.min(
          dailyTonnage * 0.1 + Math.random() * dailyTonnage * 0.05, // Random allocation
          maxCapacity * 0.8,
          availableTonnage
        );
        
        dayAllocations[route] = allocation;
        dayTotalTonnage += allocation;
        dayUtilizationTime += allocation / yield_rate;
      });

      // Calculate utilization
      const realUtilization = dayUtilizationTime / (hoursPerDay * availability * numTrucks);
      const deviation = Math.abs(realUtilization - targetUtilization);
      
      totalUtilization += realUtilization;
      totalDeviation += deviation;

      results.utilizationSummary.push({
        period: dayStr,
        realUtilization: realUtilization,
        targetUtilization: targetUtilization,
        deviation: deviation
      });

      results.dailyTonnage.push({
        period: dayStr,
        tonnage: dayTotalTonnage
      });

      results.routeAllocations[dayStr] = dayAllocations;
    }

    results.avgUtilization = totalUtilization / numDays;
    results.objectiveValue = totalDeviation;

    return results;
    
  } catch (error) {
    throw new Error(`Error en optimización: ${error.message}`);
  }
}