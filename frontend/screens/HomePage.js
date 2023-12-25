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
import { DatePickerInput } from "react-native-paper-dates";
// import { TextInput } from "react-native-paper";
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
      // Add validation to ensure the user is entering the last 10 cycles
      const currentDate = new Date();
      const enteredStartDate = new Date(startDate);
      const enteredEndDate = new Date(endDate);

      // Check if entered start date is within the last 10 months
      if (
        enteredStartDate > currentDate ||
        enteredStartDate <
          new Date(currentDate.getFullYear(), currentDate.getMonth() - 12, 1)
      ) {
        alert("Please enter a valid start date within the last 10 months.");
        return;
      }

      // Check if entered end date is within the last 10 months
      if (
        enteredEndDate > currentDate ||
        enteredEndDate <
          new Date(currentDate.getFullYear(), currentDate.getMonth() - 12, 1)
      ) {
        alert("Please enter a valid end date within the last 10 months.");
        return;
      }

      // Calculate cycle length and ovulation date
      const timeDifference =
        enteredEndDate.getTime() - enteredStartDate.getTime();
      const dayDifference = Math.round(timeDifference / (1000 * 60 * 60 * 24));
      const cycleLength = dayDifference;

      const ovulationDate = new Date(enteredStartDate);
      ovulationDate.setDate(ovulationDate.getDate() + parseInt(ovulationDay));

      // Continue with your logic for adding data points
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
        .select("start_date, end_date, cycle_length, ovulation_day")
        .eq("user_id", user.id)
        .order("end_date", { ascending: false })
        .range(0, 9); // Fetch the last 10 cycles

      // Calculate average cycle length

      if (cycleDataError) {
        console.error("Error fetching cycle data:", cycleDataError);
        Alert.alert("Error", "An error occurred while fetching cycle data.");
        return;
      }

      if (cycleData.length < 5) {
        alert("Please enter at least 5 data points.");
        return;
      }

      // Get the latest entered data
      const latestEntry = cycleData[0];
      console.log("Latest entry:\n", latestEntry);

      // Log the fetched cycleData in the desired format
      const formattedCycleData = cycleData.map(
        ({ cycle_length, ovulation_day }) => [
          parseInt(cycle_length),
          parseInt(ovulation_day),
        ]
      );

      // console.log("Fetched cycleData:\n", formattedCycleData);

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
        // Calculate predicted dates based on the latest entry
        // const { cycle_length, ovulation_day } = latestEntry;
        const predictedStartDate = new Date(latestEntry.end_date);
        predictedStartDate.setDate(predictedStartDate.getDate() + 1); // Predicted start date is the day after the last end date
        const predictedEndDate = new Date(predictedStartDate);
        predictedEndDate.setDate(
          predictedEndDate.getDate() + responseData.predictedCycleLength
        );
        const predictedOvulationDate = new Date(predictedStartDate);
        predictedOvulationDate.setDate(
          predictedStartDate.getDate() + responseData.predictedOvulationDay
        );

        const tempOvulationDate = new Date(predictedOvulationDate);
        tempOvulationDate.setDate(tempOvulationDate.getDate() + 1);

        const predictedLutealPhaseLength =
          (tempOvulationDate - predictedStartDate) / (1000 * 60 * 60 * 24);

        // alert if luteal phase length is less than 11 days
        if (predictedLutealPhaseLength < 11) {
          alert(
            "Your predicted luteal phase length is less than 11 days. Please consult your doctor."
          );
        }

        const existingPrediction = await supabase
          .from("prediction_data")
          .select()
          .eq("user_id", user.id)
          .eq("predicted_start_date", predictedStartDate)
          .eq("predicted_end_date", predictedEndDate)
          .eq("predicted_cycle_length", responseData.predictedCycleLength)
          .eq("predicted_ovulation_date", predictedOvulationDate)
          .eq("predicted_ovulation_day", responseData.predictedOvulationDay)
          .eq("predicted_period_start_date", predictedStartDate)
          .eq("predicted_luteal_length", predictedLutealPhaseLength)
          .single();

        if (existingPrediction.data) {
          // If the exact same entry exists, update the record
          const { data: updatedData, error: updateError } = await supabase
            .from("prediction_data")
            .update({
              predicted_start_date: predictedStartDate,
              predicted_end_date: predictedEndDate,
              predicted_cycle_length: responseData.predictedCycleLength,
              predicted_ovulation_date: predictedOvulationDate,
              predicted_ovulation_day: responseData.predictedOvulationDay,
              predicted_period_start_date: predictedStartDate,
              predicted_luteal_length: predictedLutealPhaseLength,
            })
            .eq("id", existingPrediction.data.id);

          if (updateError) {
            console.error("Error updating predicted data:", updateError);
            Alert.alert(
              "Error",
              "An error occurred while updating predicted data. Please try again."
            );
            return;
          }
          alert("Prediction data updated successfully!");
        } else {
          // If the exact same entry does not exist, insert a new record
          const { data: insertedData, error: insertError } = await supabase
            .from("prediction_data")
            .insert([
              {
                user_id: user.id,
                predicted_start_date: predictedStartDate,
                predicted_end_date: predictedEndDate,
                predicted_cycle_length: responseData.predictedCycleLength,
                predicted_ovulation_date: predictedOvulationDate,
                predicted_ovulation_day: responseData.predictedOvulationDay,
                predicted_period_start_date: predictedStartDate,
                predicted_luteal_length: predictedLutealPhaseLength,
              },
            ]);

          if (insertError) {
            console.error("Error inserting predicted data:", insertError);
            Alert.alert(
              "Error",
              "An error occurred while storing predicted data. Please try again."
            );
            return;
          }

          alert("Prediction data stored successfully!");
        }

        setPredictedResults({
          predictedCycleLength: responseData.predictedCycleLength,
          predictedOvulationDay: responseData.predictedOvulationDay,
          predictedStartDate: predictedStartDate.toLocaleDateString(),
          predictedEndDate: predictedEndDate.toLocaleDateString(),
          predictedOvulationDate: predictedOvulationDate.toLocaleDateString(),
          predictedLutealPhaseLength: predictedLutealPhaseLength,
        });
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
        <DatePickerInput
          value={startDate}
          placeholder="Start Date"
          displayFormat="YYYY-MM-DD"
          onChange={(value) => setStartDate(value)}
        />
        <DatePickerInput
          value={endDate}
          placeholder="End Date"
          displayFormat="YYYY-MM-DD"
          onChange={(value) => setEndDate(value)}
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
              Predicted Luteal Phase Length:
              {predictedResults.predictedLutealPhaseLength}
            </Text>
            <Text>
              Predicted Ovulation Day: {predictedResults.predictedOvulationDay}
            </Text>
            <Text>
              Predicted Cycle/Period Start Date:{" "}
              {predictedResults.predictedStartDate}
            </Text>
            <Text>
              Predicted Cycle End Date: {predictedResults.predictedEndDate}
            </Text>
            <Text>
              Predicted Ovulation Date:{" "}
              {predictedResults.predictedOvulationDate}
            </Text>
          </View>
        )}

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
