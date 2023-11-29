import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
} from "react-native";

export default function CycleDataForm() {
  const [formData, setFormData] = useState([]);
  const [currentCycle, setCurrentCycle] = useState("");
  const [currentOvulationDay, setCurrentOvulationDay] = useState("");
  const [predictedCycleLength, setPredictedCycleLength] = useState(null);
  const [predictedOvulationDay, setPredictedOvulationDay] = useState(null);
  const [predictedLutealPhaseLength, setPredictedLutealPhaseLength] =
    useState(null);

  const handleAddPair = () => {
    if (isValidInput(currentCycle) && isValidInput(currentOvulationDay)) {
      const cycleLength = parseInt(currentCycle);
      const ovulationDay = parseInt(currentOvulationDay);
      setFormData([...formData, [cycleLength, ovulationDay]]);
      setCurrentCycle("");
      setCurrentOvulationDay("");
    } else {
      alert(
        "Please enter valid integer values for Cycle Length and Ovulation Day."
      );
    }
  };

  const calculateLutealPhaseLength = (cycleLength, ovulationDay) => {
    if (cycleLength && ovulationDay) {
      const lutealPhaseLength = cycleLength - ovulationDay;
      setPredictedLutealPhaseLength(lutealPhaseLength);

      if (lutealPhaseLength < 10) {
        console.log(
          "Luteal phase length is less than 10 days: ",
          lutealPhaseLength
        );
      } else {
        console.log(
          "Luteal phase length is more than 10 days: ",
          lutealPhaseLength
        );
      }
    }
  };

  useEffect(() => {
    // This will run after predictedLutealPhaseLength is updated
    if (predictedLutealPhaseLength !== null) {
      console.log("Predicted Luteal Phase Length:", predictedLutealPhaseLength);
    }
  }, [predictedLutealPhaseLength]);

  const isValidInput = (input) => {
    // Use regex to check if the input is a valid integer
    return /^-?\d+$/.test(input);
  };

  const handleSubmit = () => {
    if (formData.length < 5) {
      alert("Please enter at least 5 data points.");
      return;
    }
    const dataToSend = JSON.stringify({ cycleData: formData });

    fetch("http://192.168.1.149:8000/api/predict/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: dataToSend,
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData) {
          setPredictedCycleLength(responseData.predictedCycleLength);
          setPredictedOvulationDay(responseData.predictedOvulationDay);
          calculateLutealPhaseLength(
            responseData.predictedCycleLength,
            responseData.predictedOvulationDay
          );
        } else {
          console.error("No data");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter Minimum 10 Cycle Data Pairs:</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Cycle Length"
          onChangeText={(text) => setCurrentCycle(text)}
          value={currentCycle}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Ovulation Day"
          onChangeText={(text) => setCurrentOvulationDay(text)}
          value={currentOvulationDay}
          keyboardType="numeric"
        />
        <Button title="Add Pair" onPress={handleAddPair} />
      </View>
      <View style={styles.dataList}>
        <Text style={styles.label}>Entered Data:</Text>
        <FlatList
          data={formData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <Text>{`Pair ${index + 1}: Cycle Length - ${
              item[0]
            }, Ovulation Day - ${item[1]}`}</Text>
          )}
        />
      </View>
      <Button title="Submit" onPress={handleSubmit} />
      {predictedCycleLength !== null && predictedOvulationDay !== null && (
        <View style={styles.predictionContainer}>
          <Text style={styles.label}>Predicted Cycle Length:</Text>
          <Text>{predictedCycleLength}</Text>
          <Text style={styles.label}>Predicted Ovulation Day:</Text>
          <Text>{predictedOvulationDay}</Text>
          <Text style={styles.label}>Predicted Luteal Phase Length:</Text>
          <Text>{predictedLutealPhaseLength}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  dataList: {
    marginTop: 20,
  },
  predictionContainer: {
    marginTop: 20,
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 5,
  },
});
