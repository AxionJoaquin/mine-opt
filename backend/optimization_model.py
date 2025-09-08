# C:\Axion\COPIAPO\Planificación Mina\mine-opt\backend\optimization_model.py

import pulp
import pandas as pd
import json

# --- 1. Definición de Conjuntos (Sets) - Datos Estáticos del Modelo ---
# Estos son valores fijos del modelo de negocio, no vienen del usuario.

# Sólidos
SOLIDS = [
    'Acopios_Mineral_2',
    'Adicional_Patio_Tolva',
    'F1_1015_0',
    'F2_1165_0',
    'F2_1177_5',
    'F3_1177_5',
    'F3_1190_0'
]

# Destinos
DESTINATIONS = [
    'Acopio_1',
    'Acopio_M2',
    'BONE',
    'BOSE',
    'DR',
    'Planta'
]

# T_{j, k}: Tiempo de ciclo del sólido j al destino k en minutos.
RAW_TIME_CYCLE_MINUTES = {
    ('Acopios_Mineral_2', 'Planta'): 11.7,
    ('F1_1015_0', 'Planta'): 18.0,
    ('F3_1177_5', 'Planta'): 13.5,
    ('F3_1190_0', 'Planta'): 12.9,
    ('F1_1015_0', 'BOSE'): 30.1,
    ('F1_1015_0', 'Acopio_1'): 20.6,
    ('F1_1015_0', 'Acopio_M2'): 22.3,
    ('F2_1177_5', 'BOSE'): 27.4,
    ('F2_1177_5', 'Acopio_1'): 16.6,
    ('F2_1177_5', 'Acopio_M2'): 17.9,
    ('F2_1165_0', 'BOSE'): 23.2,
    ('F3_1190_0', 'BONE'): 18.4,
    ('F3_1190_0', 'Acopio_1'): 18.4,
    ('F3_1190_0', 'Acopio_M2'): 11.8,
    ('F3_1177_5', 'BOSE'): 25.6,
    ('F3_1177_5', 'Acopio_1'): 16.4,
    ('F3_1177_5', 'Acopio_M2'): 17.7,
    ('Adicional_Patio_Tolva', 'DR'): 29.2
}

# Convertir tiempos de ciclo a horas (para la fórmula de utilización)
TIME_CYCLE_HOURS = {k: v / 60.0 for k, v in RAW_TIME_CYCLE_MINUTES.items()}

# Combinaciones válidas de sólido-destino
JK_COMBINATIONS = list(TIME_CYCLE_HOURS.keys())

# Ton_{k}: Tonelaje movido por camión al destino k en un ciclo.
TONNAGE_PER_TRUCK_DEST = {
    'Planta': 224.0,
    'Acopio_1': 224.0,
    'Acopio_M2': 224.0,
    'BOSE': 200.0,
    'BONE': 200.0,
    'DR': 200.0,
}

# REF_{j, k}: Rendimiento efectivo para la ruta sólido j al destino k (Ton_k / T_j_k).
EFFECTIVE_YIELD_JK = {}
for (j, k) in JK_COMBINATIONS:
    if TIME_CYCLE_HOURS[(j, k)] > 0: # Evitar división por cero
        EFFECTIVE_YIELD_JK[(j, k)] = TONNAGE_PER_TRUCK_DEST[k] / TIME_CYCLE_HOURS[(j, k)]
    else:
        EFFECTIVE_YIELD_JK[(j, k)] = 0 # Considerar cómo manejar rutas con tiempo de ciclo 0
        print(f"Advertencia: Ruta {j}-{k} tiene tiempo de ciclo 0, rendimiento efectivo establecido a 0.")


# Tonelaje total disponible a extraer por cada par origen destino (para todo el período)
TOTAL_AVAILABLE_TONNAGE_JK = {
    ('Acopios_Mineral_2', 'Planta'): 6000,
    ('F1_1015_0', 'Planta'): 58000,
    ('F3_1177_5', 'Planta'): 202000,
    ('F3_1190_0', 'Planta'): 190000,
    ('F1_1015_0', 'BOSE'): 80543,
    ('F1_1015_0', 'Acopio_1'): 114462,
    ('F1_1015_0', 'Acopio_M2'): 21395,
    ('F2_1177_5', 'BOSE'): 179881,
    ('F2_1177_5', 'Acopio_1'): 50355,
    ('F2_1177_5', 'Acopio_M2'): 96926,
    ('F2_1165_0', 'BOSE'): 502663,
    ('F3_1190_0', 'BONE'): 420289,
    ('F3_1190_0', 'Acopio_1'): 49006,
    ('F3_1190_0', 'Acopio_M2'): 43413,
    ('F3_1177_5', 'BOSE'): 32983,
    ('F3_1177_5', 'Acopio_1'): 129680,
    ('F3_1177_5', 'Acopio_M2'): 51128,
    ('Adicional_Patio_Tolva', 'DR'): 60000
}


def run_optimization_model(parameters):
    """
    Ejecuta el modelo de optimización de transporte minero con los parámetros dados.

    Args:
        parameters (dict): Un diccionario con los siguientes campos:
            - numDays (int): Número de días a optimizar.
            - numTrucks (int): Número de camiones disponibles.
            - hoursPerDay (int): Horas de operación por día.
            - fleetAvailability (dict): Disponibilidad física de la flota por día (0 a 1).
                                       Las claves deben ser strings (ej: '1', '2', etc.).
            - targetUtilization (float): Utilización objetivo general de la flota (0 a 1).
            - dailyTonnage (float): Tonelaje diario objetivo a mover.

    Returns:
        dict: Un diccionario con los resultados de la optimización, incluyendo:
            - status (str): Estado de la solución (Óptima, No Óptima, etc.).
            - objectiveValue (float): Valor de la función objetivo.
            - utilizationSummary (list): Lista de dicts con utilización real, objetivo y desviación por día.
            - dailyTonnage (list): Lista de dicts con el tonelaje movido real por día.
            - routeAllocations (dict): Dict de dicts con el tonelaje asignado por ruta y día.
            - avgUtilization (float): Utilización promedio de la flota en el período.
            - error (str, opcional): Mensaje de error si la optimización falla.
    """
    try:
        # --- 2. Parámetros (Valores Dinámicos de la Aplicación) ---
        num_days = int(parameters.get('numDays', 31))
        num_trucks = int(parameters.get('numTrucks', 8))
        hours_per_day = int(parameters.get('hoursPerDay', 24))
        fleet_availability_p = {str(k): float(v) for k, v in parameters.get('fleetAvailability', {}).items()}
        target_utilization_global = float(parameters.get('targetUtilization', 0.72))
        daily_tonnage_global = float(parameters.get('dailyTonnage', 70000.0))

        # Períodos (Días)
        P = [f'{i+1}' for i in range(num_days)]

        # Asegurar que fleet_availability_p tenga todos los días o usar un default.
        # Si un día no viene, se podría asumir un promedio o un valor por defecto.
        # Aquí, se usa el valor del frontend o un default de 0.75 si no existe para un día.
        for p_day in P:
            if p_day not in fleet_availability_p:
                fleet_availability_p[p_day] = 0.75 # Default si no lo envía el frontend

        # tau_p: Utilización objetivo del periodo p (expande el valor global a todos los días)
        target_utilization_p = {p: target_utilization_global for p in P}

        # mu_p: Tonelaje a mover el periodo p (expande el valor global a todos los días)
        total_tonnage_to_move_p = {p: daily_tonnage_global for p in P}
        
        # Disponible de tonelaje por origen-destino por día (dividir el total disponible entre los días)
        # Esto asume una distribución uniforme del tonelaje disponible a lo largo de los días
        available_tonnage_daily_jk = {
            (j, k): TOTAL_AVAILABLE_TONNAGE_JK.get((j, k), 0) / num_days
            for (j, k) in JK_COMBINATIONS
        }

        # --- 3. Crear el Problema de Optimización ---
        model = pulp.LpProblem("CMP_Copiapo_Optimization", pulp.LpMinimize)

        # --- 4. Variables de Decisión ---

        # x_{p, j, k}: Tonelaje movido el periodo p en la ruta del sólido j al destino k
        x = pulp.LpVariable.dicts("tonnage_moved",
                                  ((p, j, k) for p in P for j, k in JK_COMBINATIONS),
                                  lowBound=0,
                                  cat='Continuous')

        # z_p: Diferencia respecto al target de utilización en el periodo p (absoluto)
        z = pulp.LpVariable.dicts("deviation_from_target",
                                  P,
                                  lowBound=0,
                                  cat='Continuous')

        # --- 5. Función Objetivo ---
        # min sum(z_p for p in P)
        model += pulp.lpSum(z[p] for p in P), "Minimize_Total_Deviation"

        # --- 6. Restricciones ---

        # Restricción 2: La suma del tonelaje movido en un periodo debe ser igual al tonelaje objetivo para ese periodo.
        for p in P:
            model += pulp.lpSum(x[(p, j, k)] for j, k in JK_COMBINATIONS) == total_tonnage_to_move_p[p], \
                     f"Total_Tonnage_Requirement_Period_{p}"

        # Restricciones 3 y 4: Definen z_p como el valor absoluto de la diferencia entre la utilización real y la objetivo.
        for p in P:
            df_p = fleet_availability_p.get(p, 0.75) # Usar el valor del frontend o default
            
            total_time_required_for_day_p = pulp.lpSum(
                x[(p, j, k)] / EFFECTIVE_YIELD_JK[(j, k)]
                for j, k in JK_COMBINATIONS if EFFECTIVE_YIELD_JK[(j, k)] > 0
            )

            available_machine_hours_for_day_p = hours_per_day * df_p * num_trucks
            
            if available_machine_hours_for_day_p > 0:
                U_p_expression = total_time_required_for_day_p / available_machine_hours_for_day_p
                model += U_p_expression - target_utilization_p[p] <= z[p], f"Deviation_Lower_Bound_Period_{p}"
                model += target_utilization_p[p] - U_p_expression <= z[p], f"Deviation_Upper_Bound_Period_{p}"
            else:
                # Si no hay capacidad (0 camiones, 0 horas, 0 disponibilidad), no se puede mover tonelaje
                for j, k in JK_COMBINATIONS:
                    model += x[(p, j, k)] == 0, f"No_Tonnage_No_Capacity_Day_{p}_Route_{j}_{k}"
                # En este caso, la desviación será al menos el target de utilización
                model += z[p] >= target_utilization_p[p], f"Deviation_High_No_Capacity_Day_{p}"


        # No exceder el tonelaje disponible por día para cada sólido-destino
        for j, k in JK_COMBINATIONS:
            for p in P:
                model += x[(p, j, k)] <= available_tonnage_daily_jk[(j, k)], \
                        f"Max_Tonnage_for_Solid_{j}_to_{k}_Day_{p}"

        # --- 7. Resolver el Problema ---
        solver = pulp.PULP_CBC_CMD(msg=0, timeLimit=60) # Limitar tiempo a 60 segundos
        model.solve(solver)

        # --- 8. Preparar Resultados para el Frontend ---
        results = {
            'status': pulp.LpStatus[model.status],
            'objectiveValue': None,
            'utilizationSummary': [],
            'dailyTonnage': [],
            'routeAllocations': {},
            'avgUtilization': None
        }

        if model.status == 1:
            results['objectiveValue'] = pulp.value(model.objective)

            total_real_utilization_sum = 0
            for p in P:
                day_total_tonnage = 0
                day_utilization_time = 0 # Tiempo total requerido en horas para el día p
                day_allocations = {}

                for j, k in JK_COMBINATIONS:
                    tonnage_val = x[(p, j, k)].varValue if x[(p, j, k)].varValue is not None else 0
                    day_allocations[f"{j}-{k}"] = tonnage_val
                    day_total_tonnage += tonnage_val

                    if EFFECTIVE_YIELD_JK[(j, k)] > 0:
                        day_utilization_time += tonnage_val / EFFECTIVE_YIELD_JK[(j, k)]

                results['routeAllocations'][p] = day_allocations

                df_p = fleet_availability_p.get(p, 0.75) # Usar el valor del frontend o default
                available_machine_hours_for_day_p = hours_per_day * df_p * num_trucks
                
                real_utilization = 0
                if available_machine_hours_for_day_p > 0:
                    real_utilization = day_utilization_time / available_machine_hours_for_day_p

                deviation_val = z[p].varValue if z[p].varValue is not None else 0

                results['utilizationSummary'].append({
                    'period': p,
                    'realUtilization': real_utilization,
                    'targetUtilization': target_utilization_p[p],
                    'deviation': deviation_val
                })
                results['dailyTonnage'].append({
                    'period': p,
                    'tonnage': day_total_tonnage
                })
                total_real_utilization_sum += real_utilization

            results['avgUtilization'] = total_real_utilization_sum / num_days if num_days > 0 else 0
        else:
            results['error'] = f"El modelo no encontró una solución óptima o factible. Estado: {pulp.LpStatus[model.status]}"

        return results

    except Exception as e:
        return {'status': 'Error', 'error': str(e)}

# --- Bloque para probar el script directamente si es necesario ---
if __name__ == "__main__":
    test_parameters = {
        'numDays': 31,
        'numTrucks': 8,
        'hoursPerDay': 24,
        'fleetAvailability': {
            '1': 0.58, '2': 0.75, '3': 0.60, '4': 0.77, '5': 0.85, '6': 0.78, '7': 0.64,
            '8': 0.80, '9': 0.68, '10': 0.77, '11': 0.66, '12': 0.88, '13': 0.85, '14': 0.85,
            '15': 0.79, '16': 0.88, '17': 0.85, '18': 0.77, '19': 0.88, '20': 0.65, '21': 0.76,
            '22': 0.77, '23': 0.87, '24': 0.71, '25': 0.75, '26': 0.55, '27': 0.87, '28': 0.87,
            '29': 0.86, '30': 0.82, '31': 0.77
        },
        'targetUtilization': 0.72,
        'dailyTonnage': 70000.0
    }

    print("Ejecutando modelo de optimización con parámetros de prueba...")
    results = run_optimization_model(test_parameters)

    if results.get('error'):
        print(f"Error durante la optimización: {results['error']}")
    else:
        print("\n--- Resultados de Optimización ---")
        print(f"Estado de la solución: {results['status']}")
        print(f"Valor de la Función Objetivo (Suma de Desviaciones): {results['objectiveValue']:.4f}")
        print(f"Utilización Promedio: {(results['avgUtilization'] * 100):.2f}%")
        # print(json.dumps(results, indent=2)) # Descomentar para ver el JSON completo