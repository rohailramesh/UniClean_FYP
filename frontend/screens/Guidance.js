import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
} from "react-native";
import { Card } from "react-native-paper";
import { supabase } from "../lib/supabase";
import { IconButton } from "react-native-paper";
import Botpress from "../components/botpress";

export default function Guidance({ session }) {
  const user = session?.user;
  const [predictedResults, setPredictedResults] = useState(null);
  const [predictedStartDate, setPredictedStartDate] = useState(null);
  const [predictedEndDate, setPredictedEndDate] = useState(null);
  const [predictedCycleLength, setPredictedCycleLength] = useState(null);
  const [predictedLutealPhaseLength, setPredictedLutealPhaseLength] =
    useState(null);
  const [predictedOvulationDate, setPredictedOvulationDate] = useState(null);
  const [predictedOvulationDay, setPredictedOvulationDay] = useState(null);
  const [daysDifference, setDaysDifference] = useState(null);
  const userFullName = user?.user_metadata.fullname;

  useEffect(() => {
    // Fetch predicted results from the database and set them to the state
    async function fetchPredictedData() {
      try {
        const { data, error } = await supabase
          .from("prediction_data")
          .select("*")
          .eq("user_id", user.id);
        if (error) {
          console.error("Error fetching predicted data:", error.message);
        } else {
          if (data && data.length > 0) {
            const prediction = data; // Assuming there is only one prediction
            setPredictedResults(prediction);
            setPredictedStartDate(
              formatDate(prediction[0].predicted_start_date)
            );
            setPredictedEndDate(formatDate(prediction[0].predicted_end_date));
            setPredictedCycleLength(prediction[0].predicted_cycle_length);
            setPredictedLutealPhaseLength(
              prediction[0].predicted_luteal_length
            );
            setPredictedOvulationDate(
              formatDate(prediction[0].predicted_ovulation_date)
            );
            setPredictedOvulationDay(prediction[0].predicted_ovulation_day);
            const today = new Date(); // Create a new Date object
            today.setHours(0, 0, 0, 0);
            console.log("Today's date:", today);
            const predictedStartDate = new Date(
              prediction[0].predicted_start_date
            );
            predictedStartDate.setHours(0, 0, 0, 0);
            console.log("Predicted start date:", predictedStartDate);
            const differenceInTime =
              predictedStartDate.getTime() - today.getTime();
            console.log("Difference in time:", differenceInTime);
            const differenceInDays = differenceInTime / (1000 * 3600 * 24);
            console.log("Difference in days:", differenceInDays);
            setDaysDifference(differenceInDays);
          } else {
            setPredictedResults(null);
            console.log("No predicted data found");
          }
        }
      } catch (error) {
        console.error("Error fetching predicted data:", error.message);
      }
    }
    const formatDate = (dateString) => {
      const options = { day: "2-digit", month: "2-digit", year: "numeric" };
      return new Date(dateString).toLocaleDateString(undefined, options);
    };

    fetchPredictedData();
  }, []); // Run the effect only once on component mount

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
        <View>
          {predictedResults && predictedResults.length > 0 ? (
            <View style={styles.predictions}>
              <Card style={styles.predictionCard}>
                <Card.Title
                  title={userFullName + "'s upcoming cycle"}
                  titleStyle={{ fontSize: 20, fontWeight: "bold" }}
                />
                <Card.Content>
                  <Text style={styles.predictionText}>
                    Start Date: {predictedStartDate}
                  </Text>
                  <Text style={styles.predictionText}>
                    End Date: {predictedEndDate}
                  </Text>
                  <Text style={styles.predictionText}>
                    Cycle Length: {predictedCycleLength} days
                  </Text>
                  <Text style={styles.predictionText}>
                    Luteal Phase Length: {predictedLutealPhaseLength} days
                  </Text>
                  <Text style={styles.predictionText}>
                    Ovulation Date: {predictedOvulationDate} (Day:{" "}
                    {predictedOvulationDay})
                  </Text>
                </Card.Content>
              </Card>
            </View>
          ) : (
            <View style={styles.predictions}>
              <Card style={styles.predictionCard}>
                <Card.Content>
                  <Text>No predictions available</Text>
                </Card.Content>
              </Card>
            </View>
          )}
        </View>

        <View style={styles.productGuidance}>
          <Text style={styles.sectionHeader}>Hygiene Products</Text>
          <Card>
            <Card.Content>
              <Text>
                Your next period is expected to start in {daysDifference} day(s)
                ({predictedStartDate}).
              </Text>
              <Text>
                You will receive two scheduled reminders the day before your
                period starts to collect personal hygiene products from your
                nearest free pickup location.
              </Text>
              <Text style={styles.productInfoText}>
                Please check the "UniProducts" tab for more information on how
                to get to your nearest location.
              </Text>
            </Card.Content>
          </Card>
        </View>
        <View style={styles.lutealPhaseGuidance}>
          <Text style={styles.sectionHeader}>Luteal Phase</Text>
          <Card>
            <Card.Title
              title={
                "Your luteal phase length" +
                predictedLutealPhaseLength +
                " days"
              }
              titleStyle={{ fontWeight: "bold" }}
            />
          </Card>
          <View style={styles.extraInfoCard}>
            <Card>
              <Card.Content>
                <Text style={styles.moreDetailsText}>
                  Want to learn about your cycles? Ask UniChat.
                </Text>
              </Card.Content>
            </Card>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
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
  predictions: {
    width: "100%",
  },
  predictionCard: {
    margin: 10,
  },
  predictionText: {
    marginBottom: 8,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
  },
  productGuidance: {
    width: "100%",
    paddingLeft: 10,
    paddingRight: 10,
    marginBottom: 20,
  },
  lutealPhaseGuidance: {
    width: "100%",
    paddingLeft: 10,
    paddingRight: 10,
  },
  tableContainer: {
    margin: 20,
  },
  moreDetailsText: {
    fontStyle: "italic",
    textAlign: "center",
    fontWeight: "bold",
  },
  extraInfoCard: {
    marginTop: 10,
    width: "100%",
  },
  productInfoText: {
    fontStyle: "italic",
    textAlign: "center",
    fontWeight: "bold",
  },
});
