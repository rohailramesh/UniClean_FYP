import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  // Button,
  Alert,
  FlatList,
  StyleSheet,
  ScrollView,
  ImageBackground,
} from "react-native";
import { DatePickerInput } from "react-native-paper-dates";
import { IconButton, Card } from "react-native-paper";
import { supabase } from "../lib/supabase";
import { Button } from "react-native-elements";

export default function HomePage({ session }) {
  const user = session?.user;
  const [dataPoints, setDataPoints] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [ovulationDay, setOvulationDay] = useState("");
  const [predictedResults, setPredictedResults] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const userFullName = user?.user_metadata.fullname;

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
        alert("Please enter a valid start date within the last 12 months.");
        return;
      }

      // Check if entered end date is within the last 10 months
      if (
        enteredEndDate > currentDate ||
        enteredEndDate <
          new Date(currentDate.getFullYear(), currentDate.getMonth() - 12, 1)
      ) {
        alert("Please enter a valid end date within the last 12 months.");
        return;
      }

      // Calculate cycle length and ovulation date
      const timeDifference =
        enteredEndDate.getTime() - enteredStartDate.getTime();
      const dayDifference = Math.round(timeDifference / (1000 * 60 * 60 * 24));
      const cycleLength = dayDifference;

      const ovulationDate = new Date(enteredStartDate);
      ovulationDate.setDate(ovulationDate.getDate() + parseInt(ovulationDay));

      if (editingIndex !== null) {
        // If editing, update the existing data point
        const updatedDataPoints = [...dataPoints];
        updatedDataPoints[editingIndex] = {
          startDate,
          endDate,
          cycleLength,
          ovulationDate,
          ovulationDay,
        };
        setDataPoints(updatedDataPoints);
        setEditingIndex(null);
      } else {
        // If not editing, add a new data point
        setDataPoints([
          ...dataPoints,
          { startDate, endDate, cycleLength, ovulationDate, ovulationDay },
        ]);
      }

      setStartDate("");
      setEndDate("");
      setOvulationDay("");
    } else {
      alert(
        "Please enter valid values for Start Date, End Date, and Ovulation Day."
      );
    }
  };
  const handleEditDataPoint = (index) => {
    // Set the values of the data point to be edited in the form
    const dataPointToEdit = dataPoints[index];
    setStartDate(dataPointToEdit.startDate);
    setEndDate(dataPointToEdit.endDate);
    setOvulationDay(dataPointToEdit.ovulationDay);
    setEditingIndex(index);
  };

  const handleDeleteDataPoint = (index) => {
    // Implement logic to delete the data point at the specified index
    const remainingDataPoints = [...dataPoints];
    remainingDataPoints.splice(index, 1);
    setDataPoints(remainingDataPoints);
  };

  const handleSubmit = async () => {
    try {
      if (dataPoints.length < 1) {
        alert("Please enter at least 1 data points.");
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
        .order("end_date", { ascending: false });
      // .range(0, 9); // Fetch the last 10 cycles

      if (cycleDataError) {
        console.error("Error fetching cycle data:", cycleDataError);
        Alert.alert("Error", "An error occurred while fetching cycle data.");
        return;
      }

      if (cycleData.length < 5) {
        alert("Atleast 10 data points are required for accurate prediction.");
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
      const serverUrl = "http://192.168.1.123:8000/api/predict";

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

        setPredictedResults({
          predictedCycleLength: responseData.predictedCycleLength,
          predictedOvulationDay: responseData.predictedOvulationDay,
          predictedStartDate: predictedStartDate.toLocaleDateString(),
          predictedEndDate: predictedEndDate.toLocaleDateString(),
          predictedOvulationDate: predictedOvulationDate.toLocaleDateString(),
          predictedLutealPhaseLength: predictedLutealPhaseLength,
        });

        // Prevent duplicated data from being added to prediction_data table in the database
        const { data: existingPredictionData } = await supabase
          .from("prediction_data")
          .select("user_id")
          .eq("user_id", user.id);

        if (existingPredictionData.length < 1) {
          // Insert prediction data into prediction_data table
          const { data, error } = await supabase
            .from("prediction_data")
            .insert([
              {
                user_id: user.id,
                predicted_cycle_length: responseData.predictedCycleLength,
                predicted_luteal_length: predictedLutealPhaseLength,
                predicted_ovulation_day: responseData.predictedOvulationDay,
                predicted_start_date: predictedStartDate,
                predicted_end_date: predictedEndDate,
                predicted_ovulation_date: predictedOvulationDate,
                predicted_period_start_date: predictedStartDate,
              },
            ]);

          if (error) {
            console.error("Error:", error);
            Alert.alert(
              "Error",
              "An error occurred while storing prediction data. Please try again."
            );
            return;
          }

          alert("Prediction data stored successfully!");
        }
        // update a pre-existing prediction data row in the database if any of the values have changed instead of inserting a new row
        else {
          const { data, error } = await supabase
            .from("prediction_data")
            .update({
              predicted_cycle_length: responseData.predictedCycleLength,
              predicted_luteal_length: predictedLutealPhaseLength,
              predicted_ovulation_day: responseData.predictedOvulationDay,
              predicted_start_date: predictedStartDate,
              predicted_end_date: predictedEndDate,
              predicted_ovulation_date: predictedOvulationDate,
              predicted_period_start_date: predictedStartDate,
            })
            .eq("user_id", user.id);

          if (error) {
            console.error("Error:", error);
            Alert.alert(
              "Error",
              "An error occurred while updating prediction data. Please try again."
            );
            return;
          }

          alert("Prediction data updated successfully!");
        }
      } else {
        console.error("No data");
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    }
  };

  return (
    <ImageBackground
      source={require("../assets/homepage-bg1.jpg")}
      style={styles.backgroundImage}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.headerContainer}>
          <Text>UniClean</Text>
          <Text>Welcome, {user?.user_metadata.username}</Text>
          <IconButton
            icon="location-exit"
            iconColor="black"
            onPress={() => supabase.auth.signOut()}
          />
        </View>
        <View style={styles.container}>
          <View style={styles.inlineText}>
            <Text>Cycle Start Date</Text>
            <Text>Cycle End Date</Text>
          </View>
          <View style={styles.inlineInputContainer}>
            <DatePickerInput
              value={startDate}
              placeholder="Start Date"
              displayFormat="YYYY-MM-DD"
              onChange={(value) => setStartDate(value)}
              style={styles.datePciker}
            />
            <DatePickerInput
              value={endDate}
              placeholder="End Date"
              displayFormat="YYYY-MM-DD"
              onChange={(value) => setEndDate(value)}
              style={styles.datePciker}
            />
          </View>
          <TextInput
            placeholder="Ovulation Day... (Eg: 14)"
            placeholderTextColor={"black"}
            onChangeText={(text) => setOvulationDay(text)}
            value={ovulationDay}
            keyboardType="numeric"
            style={styles.ovulationDateInput}
          />
          <View style={styles.buttons}>
            <Button
              title="Add cycle(s)"
              onPress={handleAddDataPoint}
              color={"white"}
              buttonStyle={[styles.button]}
            />
            <Button
              title="Save cycle(s)"
              onPress={handleSubmit}
              color={"white"}
              buttonStyle={[styles.button]}
            />
            <Button
              title="Predict"
              onPress={handlePredictionRequest}
              color={"white"}
              buttonStyle={[styles.button]}
            />
          </View>
          <View style={styles.cycleCard}>
            {dataPoints.map((item, index) => (
              <Card key={index} style={styles.card}>
                <Card.Content>
                  <Text>Start Date: {item.startDate.toLocaleDateString()}</Text>
                  <Text>End Date: {item.endDate.toLocaleDateString()}</Text>
                  <Text>Ovulation Day: {item.ovulationDay}</Text>
                </Card.Content>
                <Card.Actions style={styles.editButtons}>
                  <Button
                    title="Edit"
                    onPress={() => handleEditDataPoint(index)}
                    buttonStyle={[styles.button]}
                  />
                  <Button
                    title="Delete"
                    onPress={() => handleDeleteDataPoint(index)}
                    buttonStyle={[styles.button]}
                  />
                </Card.Actions>
              </Card>
            ))}
          </View>

          {/* Display predicted results */}
          {predictedResults && (
            <View style={styles.predictions}>
              <Card style={styles.predictionCard}>
                <Card.Title
                  title={userFullName + "'s upcoming cycle"}
                  titleStyle={{ fontSize: 20, fontWeight: "bold" }}
                />
                <Card.Content>
                  <Text style={styles.predictionText}>
                    Start Date: {predictedResults.predictedStartDate}
                  </Text>
                  <Text style={styles.predictionText}>
                    End Date: {predictedResults.predictedEndDate}
                  </Text>
                  <Text style={styles.predictionText}>
                    Cycle Length: {predictedResults.predictedCycleLength} days
                  </Text>
                  <Text style={styles.predictionText}>
                    Luteal Phase Length:{" "}
                    {predictedResults.predictedLutealPhaseLength} days
                  </Text>

                  <Text style={styles.predictionText}>
                    Ovulation Date: {predictedResults.predictedOvulationDate}{" "}
                    (Day: {predictedResults.predictedOvulationDay})
                  </Text>
                </Card.Content>
              </Card>
              <Card style={[styles.predictionCard, styles.extraInfoCard]}>
                <Card.Content>
                  <Text style={styles.moreDetailsText}>
                    Access UniCare screen for more details.
                  </Text>
                </Card.Content>
              </Card>
            </View>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover", // or "stretch"
  },
  cycleCard: {
    margin: 10,
    width: "99%",
    marginBottom: 30,
    gap: -15,
    marginTop: 10,
    padding: 10,
  },
  card: {
    margin: 10,
  },

  editButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },

  inlineText: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingLeft: 60,
    paddingRight: 80,
    marginTop: -30,
  },

  ovulationDateInput: {
    width: "90%",
    borderColor: "#bbb",
    padding: 12,
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: "#fff",
    marginTop: 20,
  },

  inlineInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 5,
    width: "100%",
    paddingLeft: 20,
    paddingRight: 20,
    // marginTop: 10,
  },
  datePciker: {
    marginTop: 10,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 70,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 3,
    width: "100%",
    paddingLeft: 12,
    paddingRight: 12,
  },
  button: {
    backgroundColor: "black",
    marginLeft: 10,
    marginRight: 10,
  },
  predictions: {
    width: "95%",
    marginTop: -55,
  },
  predictionCard: {
    margin: 10,
  },
  predictionText: {
    marginBottom: 8,
  },
  moreDetailsText: {
    fontStyle: "italic",
    textAlign: "center",
    fontWeight: "bold",
  },
  extraInfoCard: {
    marginTop: 0,
  },
});
