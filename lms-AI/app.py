from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os

app = Flask(__name__)
CORS(app)

# Load model with error handling
try:
    model = joblib.load('model/student_grade_predictor_v1.0.joblib')
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

@app.route('/predict', methods=['POST'])
def predict():
    if not model:
        return jsonify({'error': 'Model not loaded'}), 500
    
    try:
        data = request.json
        study_hours = float(data['study_hours'])
        attendance = float(data['attendance'])
        
        prediction = model.predict([[study_hours, attendance]])[0]
        return jsonify({'grade': prediction})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)