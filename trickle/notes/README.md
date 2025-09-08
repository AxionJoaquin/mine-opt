# Optimización de Transporte Minero - CMP Copiapó

## Descripción del Proyecto

Aplicación web para optimizar el transporte de material en operaciones mineras utilizando programación lineal. El sistema implementa un modelo basado en PuLP que minimiza las desviaciones de utilización de flota mientras cumple con las restricciones operativas.

## Características Principales

- **Configuración de Parámetros**: Interfaz para configurar días de operación, número de camiones, disponibilidad de flota y objetivos de producción
- **Motor de Optimización**: Simulación del modelo de programación lineal para optimizar el transporte
- **Visualización de Resultados**: Gráficos y tablas detalladas con los resultados de la optimización
- **Análisis de Utilización**: Seguimiento de la utilización real vs objetivo por día

## Estructura del Proyecto

```
/
├── index.html                    # Página principal
├── app.js                       # Componente principal de la aplicación
├── components/
│   ├── Header.js                # Encabezado de la aplicación
│   ├── ParameterInput.js        # Configuración de parámetros
│   ├── OptimizationRunner.js    # Ejecución de optimización
│   └── ResultsViewer.js         # Visualización de resultados
├── utils/
│   └── optimizationEngine.js    # Motor de optimización
└── trickle/
    └── notes/
        └── README.md           # Documentación del proyecto
```

## Modelo de Optimización

### Conjuntos
- **Períodos (P)**: Días de operación (1 a N)
- **Sólidos (S)**: Tipos de material a transportar
- **Destinos (D)**: Ubicaciones de destino para el material

### Parámetros Clave
- **Tiempo de ciclo**: Tiempo requerido para cada ruta sólido-destino
- **Disponibilidad de flota**: Porcentaje de flota disponible por día
- **Capacidad por camión**: Tonelaje que puede transportar cada camión
- **Objetivos de producción**: Tonelaje diario objetivo

### Variables de Decisión
- **x_{p,j,k}**: Tonelaje movido en el período p, del sólido j al destino k
- **z_p**: Desviación de utilización en el período p

### Función Objetivo
Minimizar la suma total de desviaciones de utilización:
```
min Σ(z_p) para p ∈ P
```

## Uso de la Aplicación

1. **Configurar Parámetros**: Establecer número de días, camiones, disponibilidad de flota y objetivos
2. **Ejecutar Optimización**: Iniciar el procesamiento del modelo
3. **Revisar Resultados**: Analizar gráficos y tablas con los resultados obtenidos

## Tecnologías Utilizadas

- React 18 para la interfaz de usuario
- TailwindCSS para estilos
- Chart.js para visualización de datos
- Lucide Icons para iconografía

---
*Última actualización: Enero 2025*