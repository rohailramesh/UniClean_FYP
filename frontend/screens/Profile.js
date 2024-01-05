import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { supabase } from "../lib/supabase";
import { Button } from "react-native-elements";

export default function Profile({ session }) {
  //   const user = session?.user;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Text style={styles.welcomeText}>Profile Screen</Text>
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
