import React from "react";
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  ScrollView,
} from "react-native";
import { supabase } from "../lib/supabase";
import { Button } from "react-native-elements";
import CycleDataForm from "../components/cycleDataForm";

export default function HomePage({ session }) {
  const user = session?.user;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Text style={styles.welcomeText}>
          {user ? `Welcome, ${user.email}!` : "Welcome!"}
        </Text>
        <CycleDataForm />
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
    // flex: 1,
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
