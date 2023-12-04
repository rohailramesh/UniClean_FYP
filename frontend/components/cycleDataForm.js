import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  FlatList,
  StyleSheet,
} from "react-native";

const CycleDataForm = () => {
  const [dataPoints, setDataPoints] = useState([]);
  const [currentCycle, setCurrentCycle] = useState("");
  const [currentOvulationDay, setCurrentOvulationDay] = useState("");
  const [predictedResults, setPredictedResults] = useState(null);

  const handleAddPair = () => {
    if (isValidInput(currentCycle) && isValidInput(currentOvulationDay)) {
      setDataPoints([
        ...dataPoints,
        [parseInt(currentCycle), parseInt(currentOvulationDay)],
      ]);
      setCurrentCycle("");
      setCurrentOvulationDay("");
    } else {
      alert(
        "Please enter valid integer values for Cycle Length and Ovulation Day."
      );
    }
  };

  const isValidInput = (input) => {
    return /^-?\d+$/.test(input);
  };

  const handleSubmit = async () => {
    try {
      if (dataPoints.length < 5) {
        alert("Please enter at least 5 data points.");
        return;
      }

      const serverUrl = "http://192.168.1.149:8000/api/predict";

      const response = await fetch(serverUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cycleData: dataPoints }),
      });

      const responseData = await response.json();

      if (responseData) {
        setPredictedResults(responseData);
      } else {
        console.error("No data");
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert(
        "Error",
        "An error occurred while predicting. Please try again."
      );
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Cycle Length"
        onChangeText={(text) => setCurrentCycle(text)}
        value={currentCycle}
        keyboardType="numeric"
      />
      <TextInput
        placeholder="Ovulation Day"
        onChangeText={(text) => setCurrentOvulationDay(text)}
        value={currentOvulationDay}
        keyboardType="numeric"
      />
      <Button title="Add Pair" onPress={handleAddPair} />
      <Button title="Submit" onPress={handleSubmit} />

      {predictedResults && (
        <View>
          <Text>
            Predicted Cycle Length: {predictedResults.predictedCycleLength}
          </Text>
          <Text>
            Predicted Ovulation Day: {predictedResults.predictedOvulationDay}
          </Text>
        </View>
      )}

      <FlatList
        data={dataPoints}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <Text>{`Pair ${index + 1}: Cycle Length - ${
            item[0]
          }, Ovulation Day - ${item[1]}`}</Text>
        )}
      />
    </View>
  );
};

export default CycleDataForm;

const styles = StyleSheet.create({
  container: {
    padding: 50,
  },
});
