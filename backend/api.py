from flask import Flask
from sklearn import datasets
from sklearn.model_selection import train_test_split
from flask import jsonify
from sklearn.neighbors import KNeighborsClassifier
from flask_cors import CORS
app = Flask(__name__)

CORS(app)
@app.route('/api/ml')
def predict():
    # Load the iris dataset
    iris = datasets.load_iris()
    X = iris.data  # Features
    y = iris.target  # Target variable

    # Split the data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Create a K-Nearest Neighbors classifier
    knn = KNeighborsClassifier(n_neighbors=3)

    # Train the classifier
    knn.fit(X_train, y_train)

    # Make predictions on the test set
    y_pred = knn.predict(X_test)

    # Print the accuracy of the model
    accuracy = knn.score(X_test, y_test)

    return jsonify({'accuracy': accuracy})

if __name__ == '__main__':
    app.run(host='10.47.35.156', port=5000)
# from flask import Flask, request, jsonify
# import json
# import numpy as np
# import tensorflow as tf

# app = Flask(__name__)

# # Load the model outside of the route function for efficiency
# model_path = "/Users/rohailramesh/Documents/GitHub/UniClean_FYP/backend/models"
# model_new = tf.keras.models.load_model(model_path)

# # Define the expected number of columns in your input data
# expected_column_count = 2  # Replace with the correct number of columns


# @app.route('/api/predict', methods=['POST'])
# def predict():
#     try:
#         data = request.json
#         cycle_data = data.get("cycleData", [])

#         if not cycle_data:
#             return jsonify({"error": "No cycleData provided."}), 400

#         # Convert the received data to a NumPy array
#         user_data = np.array(cycle_data)

#         if user_data.shape[1] != expected_column_count:
#             return jsonify({"error": "Invalid data format."}), 400

#         # Normalize the user data
#         max_vals = np.max(user_data, axis=0)
#         user_input_normalized = user_data / max_vals
#         sequence_length = 3
#         user_input_sequences = []

#         if len(user_input_normalized) < sequence_length:
#             return jsonify({"error": "Not enough data for prediction."}), 400

#         for i in range(len(user_input_normalized) - sequence_length + 1):
#             user_input_sequences.append(user_input_normalized[i : i + sequence_length])

#         user_input_sequences = np.array(user_input_sequences)

#         if len(user_input_sequences) == 0:
#             return jsonify({"error": "Not enough data for prediction."}), 400

#         # Make predictions using 'model_new'
#         predicted_normalized = model_new.predict(np.array([user_input_sequences[-1]]))
#         predicted = predicted_normalized * max_vals

#         predicted_cycle_length = predicted[0][0].round()
#         predicted_ovulation_day = predicted[0][1].round()

#         # Prepare the response
#         response_data = {
#             "message": "Data received and processed successfully.",
#             "predictedCycleLength": predicted_cycle_length,
#             "predictedOvulationDay": predicted_ovulation_day,
#         }

#         return jsonify(response_data)

#     except Exception as e:
#         return jsonify({"error": f"An error occurred: {str(e)}"}), 400


# if __name__ == "__main__":
#     app.run(debug=True)
