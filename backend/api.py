import json
from flask import Flask, request, jsonify
import numpy as np
from flask_cors import CORS
import tensorflow as tf
app = Flask(__name__)
CORS(app, origins=["http://localhost:19006"])

# Load the model outside of the view function for efficiency
model_new = tf.keras.models.load_model("/Users/rohailramesh/Documents/GitHub/UniClean_FYP/backend/models/best_model.h5")

# Define the expected number of columns in your input data
expected_column_count = 2  # Replace with the correct number of columns

@app.route('/api/predict', methods=['POST'])
def predict_view():
    try:
        data = request.json
        cycle_data = data.get("cycleData", [])

        if not cycle_data:
            return jsonify({"error": "No cycleData provided."}), 400

        # Convert the received data to a NumPy array
        user_data = np.array(cycle_data)

        if user_data.shape[1] != expected_column_count:
            return jsonify({"error": "Invalid data format."}), 400

        # Normalize the user data
        max_vals = np.max(user_data, axis=0)
        user_input_normalized = user_data / max_vals
        sequence_length = 3
        user_input_sequences = []

        if len(user_input_normalized) < sequence_length:
            return jsonify({"error": "Not enough data for prediction."}), 400

        for i in range(len(user_input_normalized) - sequence_length + 1):
            user_input_sequences.append(user_input_normalized[i : i + sequence_length])

        user_input_sequences = np.array(user_input_sequences)

        if len(user_input_sequences) == 0:
            return jsonify({"error": "Not enough data for prediction."}), 400

        # Make predictions using 'model_new'
        predicted_normalized = model_new.predict(np.array([user_input_sequences[-1]]))
        predicted = predicted_normalized * max_vals

        predicted_cycle_length = predicted[0][0].round()
        predicted_ovulation_day = predicted[0][1].round()

        # Prepare the response
        response_data = {
            "message": "Data received and processed successfully.",
            "predictedCycleLength": predicted_cycle_length,
            "predictedOvulationDay": predicted_ovulation_day,
        }

        return jsonify(response_data)

    except json.JSONDecodeError as e:
        return jsonify({"error": "Invalid JSON data in the request."}), 400

    except Exception as e:
        return jsonify({"error": "An error occurred while processing the data."}), 400


if __name__ == '__main__':
    # run app in debug mode on port 8000
    app.run(debug=True, port=8000, host='0.0.0.0')
