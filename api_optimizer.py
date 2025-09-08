# C:\Axion\COPIAPO\Planificación Mina\mine-opt\api_optimizer.py

from flask import Flask, request, jsonify
from flask_cors import CORS # Necesario para permitir llamadas desde tu navegador

# Importa tu función de optimización desde el nuevo archivo
# Asegúrate de que la ruta sea correcta según donde guardes optimization_model.py
# Si lo pones en la misma carpeta:
# from optimization_model import run_optimization_model
# Si lo pones en backend/optimization_model.py:
from backend.optimization_model import run_optimization_model 

app = Flask(__name__)
CORS(app) # Esto es CRUCIAL para que tu JS en el navegador pueda comunicarse con este servidor Python.

@app.route('/optimize', methods=['POST'])
def optimize_route():
    # Recibe los datos JSON enviados desde el frontend (tu app.js)
    data = request.get_json()

    if not data:
        return jsonify({"error": "No se recibieron datos JSON válidos."}), 400

    print("Parámetros recibidos para optimización:", data) # Para depuración

    # Llama a tu función de optimización con los parámetros
    optimization_results = run_optimization_model(data)

    # Verifica si la optimización devolvió un error
    if optimization_results.get('error'):
        # Si hay un error de PuLP o un error interno en la función, lo reporta
        print("Error durante la optimización:", optimization_results['error'])
        return jsonify(optimization_results), 500
    else:
        # Si todo salió bien, devuelve los resultados en formato JSON
        print("Optimización completada con éxito. Estado:", optimization_results['status'])
        return jsonify(optimization_results), 200

if __name__ == '__main__':
    # Esto inicia el microservicio de Flask.
    # Se ejecutará en http://127.0.0.1:5000 por defecto.
    # El puerto 5000 es un puerto común para desarrollo.
    print("Iniciando microservicio de optimización en http://127.0.0.1:5000")
    print("Mantén esta ventana de terminal abierta para que el servicio esté activo.")
    app.run(debug=True, port=5000) # debug=True te da mensajes de error útiles en el terminal