import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Button,
} from "react-native";
import { Card } from "react-native-paper";
import { supabase } from "../lib/supabase";
import { IconButton } from "react-native-paper";
import axios from "axios";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import LottieView from "lottie-react-native";
import CalendarAnimation from "../utils/CalendarAnimation.json";
import LocationAnimation from "../utils/LocationAnimation.json";
import TimeAnimation from "../utils/TimeAnimation.json";

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
  const [periodStartDate, setPeriodStartDate] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [notificationTimeHour, setNotificationTimeHour] = useState(null);
  const [notificationTimeMinute, setNotificationTimeMinute] = useState(null);
  const [userFullName, setUserFullName] = useState("");
  const [lutealPhaseCounter, setLutealPhaseCounter] = useState(null);

  const fetchUserFullName = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("fullname")
        .eq("id", user.id);

      if (error) {
        console.error("Error fetching user's full name:", error);
        Alert.alert(
          "Error",
          "An error occurred while fetching user's full name."
        );
        return;
      }

      if (data.length > 0) {
        setUserFullName(data[0].fullname);
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    }
  };

  // run the fetchUserFullName function when the component mounts
  useEffect(() => {
    fetchUserFullName();
  }, []);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  useEffect(() => {
    if (notificationTimeHour !== null && notificationTimeMinute !== null) {
      // Both hour and minute are set, proceed with sending notification
      sendNotification();
    }
  }, [notificationTimeHour, notificationTimeMinute]);

  const handleConfirm = (time) => {
    // console.log("Time:", time);
    // console.log("Hours:", time.getHours());
    // console.log("Minutes:", time.getMinutes());

    // Set the notification time immediately
    setNotificationTimeHour(time.getHours());
    setNotificationTimeMinute(time.getMinutes());

    // Hide the date picker
    hideDatePicker();
  };

  const sendNotification = async () => {
    const currentDate = new Date();
    // currentDate.setHours(0, 0, 0, 0);
    // console.log("Current date:", currentDate);

    // Check if periodStartDate is not null
    if (periodStartDate) {
      const notificationDate = new Date(periodStartDate);
      notificationDate.setDate(notificationDate.getDate() - 1);
      // console.log("Notification time hour:", notificationTimeHour);
      // console.log("Notification time minute:", notificationTimeMinute);
      notificationDate.setHours(notificationTimeHour, notificationTimeMinute);
      // console.log("Notification date:", notificationDate);

      // Calculate the time difference in milliseconds
      const timeDifference = notificationDate.getTime() - currentDate.getTime();
      // console.log("Time difference:", timeDifference);
      if (timeDifference > 0) {
        // Prepare the post body for NativeNotify API
        setTimeout(async () => {
          const notificationBody = {
            appId: 17728,
            appToken: "TG4wD6XhTpNs69DfbtVLbo",
            title: "Upcoming Period",
            body: `Your period is expected to start tomorrow (${predictedStartDate}). Collect your free hygiene products from your nearest pickup location`,
            dateSent: new Date().toLocaleString(),
            // You can add pushData or bigPictureURL if needed
          };

          // Send a POST request to the NativeNotify API
          try {
            const response = await axios.post(
              "https://app.nativenotify.com/api/notification",
              notificationBody
            );

            // Check the response and handle accordingly
            if (response.status === 201) {
              console.log(
                "Notification sent successfully. Status:",
                response.status
              );
            } else {
              console.error(
                "Failed to send notification. Unexpected Status:",
                response.status
              );
            }
          } catch (error) {
            console.error("Error sending notification:", error);
          }
        }, timeDifference);
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

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
          setPredictedStartDate(formatDate(prediction[0].predicted_start_date));
          setPredictedEndDate(formatDate(prediction[0].predicted_end_date));
          setPredictedCycleLength(prediction[0].predicted_cycle_length);
          setPredictedLutealPhaseLength(prediction[0].predicted_luteal_length);
          setPredictedOvulationDate(
            formatDate(prediction[0].predicted_ovulation_date)
          );
          setPredictedOvulationDay(prediction[0].predicted_ovulation_day);
          setLutealPhaseCounter(prediction[0].shortLutealPhaseCounter);
          const today = new Date(); // Create a new Date object
          today.setHours(0, 0, 0, 0);
          // console.log("Today's date:", today);
          const predictedStartDate = new Date(
            prediction[0].predicted_start_date
          );
          predictedStartDate.setHours(0, 0, 0, 0);
          // console.log("Predicted date:", predictedStartDate);
          setPeriodStartDate(predictedStartDate);
          const differenceInTime =
            predictedStartDate.getTime() - today.getTime();
          // console.log("Difference in time:", differenceInTime);
          const differenceInDays = differenceInTime / (1000 * 3600 * 24);
          // console.log("Difference in days:", differenceInDays);
          setDaysDifference(differenceInDays);
        } else {
          setPredictedResults(null);
          // console.log("No predicted data found");
        }
      }
    } catch (error) {
      console.error("Error fetching predicted data:", error.message);
    }
  }

  useEffect(() => {
    // Fetch predicted results from the database and set them to the state

    fetchPredictedData();
    // sendNotification();
  }, [predictedStartDate]); // Run the effect only once on component mount

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
                  <Button
                    title="Refresh"
                    onPress={() => fetchPredictedData()}
                  />
                </Card.Content>
              </Card>
              <View style={styles.HomePageAnimation}>
                <LottieView
                  source={CalendarAnimation} // Replace with your animation source
                  autoPlay
                  loop
                  style={styles.CalendarAnimation}
                />
              </View>
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
              {predictedResults && predictedResults.length ? (
                daysDifference <= 0 ? (
                  <Text>
                    Your period has already started.{"\n"}
                    {/* {"\n"} */}
                  </Text>
                ) : (
                  <Text>
                    Your next period is expected to start in {daysDifference}{" "}
                    day(s) ({predictedStartDate}).
                    {"\n"}
                    {"\n"}
                  </Text>
                )
              ) : (
                <Text>
                  No data found to make predictions.
                  {"\n"}
                </Text>
              )}

              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="time"
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
              />
              <Text>
                Period reminder is currently set to {""}
                {notificationTimeHour}:{notificationTimeMinute} a day before
                your period starts.
              </Text>
              <Button title="Update reminder time" onPress={showDatePicker} />
              <Text style={styles.productInfoText}>
                Please check the "UniProducts" tab for more information on how
                to get to your nearest location.
              </Text>
            </Card.Content>
          </Card>
          <View style={styles.HomePageAnimation}>
            <LottieView
              source={LocationAnimation} // Replace with your animation source
              autoPlay
              loop
              style={styles.LocationAnimation}
            />
          </View>
        </View>
        <View style={styles.lutealPhaseGuidance}>
          <Text style={styles.sectionHeader}>Luteal Phase</Text>
          <Card>
            <Card.Content>
              <Text>
                <Text style={{ fontWeight: "bold" }}>
                  Safe luteal phase length:
                </Text>{" "}
                11 days or more
                {"\n"}
                {"\n"}
                {predictedResults && predictedResults.length ? (
                  predictedLutealPhaseLength < 11 ? (
                    <>
                      <Text>
                        <Text style={{ fontWeight: "bold" }}>
                          Upcoming cycle's luteal phase length:{" "}
                        </Text>
                        {predictedLutealPhaseLength} days {"\n"}
                      </Text>
                      <Text>
                        {"\n"}
                        <Text style={{ fontWeight: "bold" }}>
                          Number of alerts received for previous cycles:{" "}
                        </Text>
                        {lutealPhaseCounter}
                        {"\n"}
                        {lutealPhaseCounter < 3 ? (
                          <>
                            {"\n"}
                            <Text>
                              No immediate attention required. If you have any
                              concerns, use UniChat for more information and
                              next steps.
                            </Text>
                          </>
                        ) : (
                          <>
                            {"\n"}
                            <Text>
                              <Text
                                style={{
                                  fontWeight: "bold",
                                  fontSize: 24,
                                  alignContent: "center",
                                  textAlign: "center",
                                }}
                              >
                                ⚠️WARNING⚠️{" "}
                              </Text>
                              {"\n"}Three or more alerts received. Please
                              consult a healthcare provider for further
                              evaluation.
                            </Text>
                          </>
                        )}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text>
                        Your luteal phase length for the upcoming cycle will be{" "}
                        {predictedLutealPhaseLength} days. {"\n"}
                      </Text>
                      <Text style={styles.moreDetailsText}>
                        {"\n"}
                        You require no immediate medical attention right now.
                      </Text>
                    </>
                  )
                ) : (
                  <Text>No data found to make predictions. {"\n"}</Text>
                )}
              </Text>
            </Card.Content>
            <View style={styles.HomePageAnimation}>
              <LottieView
                source={TimeAnimation} // Replace with your animation source
                autoPlay
                loop
                style={styles.TimeAnimation}
              />
            </View>
          </Card>
          <View style={styles.extraInfoCard}>
            <Card>
              <Card.Content>
                <Text style={styles.moreDetailsText}>
                  Not sure what to do? Head over to UniChat.
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
  CalendarAnimation: {
    width: 180,
    height: 200,
    marginTop: -120,
    marginLeft: 120,
  },
  LocationAnimation: {
    width: 70,
    height: 200,
    marginTop: -130,
    marginLeft: 165,
  },
  TimeAnimation: {
    width: 150,
    height: 200,
    marginTop: -20,
    marginLeft: 70,
    marginBottom: -50,
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
    marginBottom: -40,
    marginTop: -70,
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
    marginTop: 10,
    fontStyle: "italic",
    textAlign: "center",
    fontWeight: "bold",
  },
  notificationTimeInput: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
});
