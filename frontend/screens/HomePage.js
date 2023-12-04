import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  FlatList,
  StyleSheet,
  ScrollView,
} from "react-native";
import { supabase } from "../lib/supabase";

export default function HomePage({ session }) {
  const user = session?.user;
  const [dataPoints, setDataPoints] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [ovulationDay, setOvulationDay] = useState("");
  const [predictedResults, setPredictedResults] = useState(null);

  const handleAddDataPoint = () => {
    if (startDate && endDate && ovulationDay) {
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);

      const timeDifference = endDateObj.getTime() - startDateObj.getTime();
      const dayDifference = Math.round(timeDifference / (1000 * 60 * 60 * 24));

      const cycleLength = dayDifference;

      const ovulationDate = new Date(startDate);
      ovulationDate.setDate(ovulationDate.getDate() + parseInt(ovulationDay));

      setDataPoints([
        ...dataPoints,
        { startDate, endDate, cycleLength, ovulationDate, ovulationDay },
      ]);
      setStartDate("");
      setEndDate("");
      setOvulationDay("");
    } else {
      alert(
        "Please enter valid values for Start Date, End Date, and Ovulation Day."
      );
    }
  };

  const handleSubmit = async () => {
    try {
      if (dataPoints.length < 1) {
        alert("Please enter at least 5 data points.");
        return;
      }

      // Insert data into cycle_data table
      const { data, error } = await supabase.from("cycle_data").insert(
        dataPoints.map((point) => ({
          user_id: user.id,
          start_date: point.startDate,
          end_date: point.endDate,
          cycle_length: point.cycleLength,
          ovulation_date: point.ovulationDate,
          ovulation_day: parseInt(point.ovulationDay),
        }))
      );

      if (error) {
        console.error("Error:", error);
        Alert.alert(
          "Error",
          "An error occurred while storing cycle data. Please try again."
        );
        return;
      }

      alert("Cycle data stored successfully!");

      // Clear form and dataPoints
      setStartDate("");
      setEndDate("");
      setOvulationDay("");
      setDataPoints([]);
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    }
  };

  const handlePredictionRequest = async () => {
    try {
      // Fetch cycle data for the current user from the database
      const { data: cycleData, error: cycleDataError } = await supabase
        .from("cycle_data")
        .select("cycle_length, ovulation_day")
        .eq("user_id", user.id);

      if (cycleDataError) {
        console.error("Error fetching cycle data:", cycleDataError);
        Alert.alert("Error", "An error occurred while fetching cycle data.");
        return;
      }

      if (cycleData.length < 5) {
        alert("Please enter at least 5 data points.");
        return;
      }

      // Log the fetched cycleData in the desired format
      const formattedCycleData = cycleData.map(
        ({ cycle_length, ovulation_day }) => [
          parseInt(cycle_length),
          parseInt(ovulation_day),
        ]
      );

      console.log("Fetched cycleData:\n", formattedCycleData);

      // Send fetched cycle data for predictions
      const serverUrl = "http://192.168.1.149:8000/api/predict";

      const response = await fetch(serverUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cycleData: formattedCycleData }),
      });

      const responseData = await response.json();

      if (responseData) {
        setPredictedResults(responseData);
      } else {
        console.error("No data");
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Text style={styles.welcomeText}>
          {user ? `Welcome, ${user.email}!` : "Welcome!"}
        </Text>
        <TextInput
          placeholder="Start Date (YYYY-MM-DD)"
          onChangeText={(text) => setStartDate(text)}
          value={startDate}
        />
        <TextInput
          placeholder="End Date (YYYY-MM-DD)"
          onChangeText={(text) => setEndDate(text)}
          value={endDate}
        />
        <TextInput
          placeholder="Ovulation Day"
          onChangeText={(text) => setOvulationDay(text)}
          value={ovulationDay}
          keyboardType="numeric"
        />
        <Button title="Add Data Point" onPress={handleAddDataPoint} />
        <Button title="Submit" onPress={handleSubmit} />
        <Button title="Predict" onPress={handlePredictionRequest} />

        {/* Display predicted results */}
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
            <Text>{`Data Point ${index + 1}: Start Date - ${
              item.startDate
            }, End Date - ${item.endDate}, Cycle Length - ${
              item.cycleLength
            }, Ovulation Date - ${item.ovulationDate}, Ovulation Day - ${
              item.ovulationDay
            }`}</Text>
          )}
        />
        <Button
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.button}
          titleStyle={styles.buttonText}
          onPress={() => supabase.auth.signOut()}
          title="Sign Out"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "black",
    marginBottom: 20,
  },
  buttonContainer: {
    width: "80%",
    marginVertical: 20,
  },
});
