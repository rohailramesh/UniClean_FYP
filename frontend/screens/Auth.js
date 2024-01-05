import React, { useState } from "react";
import { Alert, View, Text, TextInput, Button, StyleSheet } from "react-native";
import { supabase } from "../lib/supabase";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUserName] = useState("");
  const [fullname, setFullName] = useState("");
  // Add more fields that are in the profiles table

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
  };

  async function handleAuthentication() {
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            username: username,
            fullname: fullname,
          },
        },
      });
      Alert.alert("Success", "Please verify your email and login");
      setEmail("");
      setPassword("");
      setUserName("");
      setFullName("");
      if (error) Alert.alert(error.message);
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) Alert.alert(error.message);
    }

    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{isSignUp ? "Sign Up" : "Sign In"}</Text>
      {isSignUp && (
        <>
          <TextInput
            value={fullname}
            onChangeText={setFullName}
            placeholder="Full Name"
            style={styles.input}
          />
          <TextInput
            value={username}
            onChangeText={setUserName}
            placeholder="Username"
            style={styles.input}
          />
        </>
      )}
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        style={styles.input}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        style={styles.input}
      />
      <Button
        title={isSignUp ? "Sign Up" : "Sign In"}
        onPress={handleAuthentication}
      />
      <Button
        title={isSignUp ? "Already a user? Sign In" : "New user? Sign Up"}
        onPress={toggleSignUp}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    marginTop: 150,
  },
  heading: {
    fontSize: 26,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#bbb",
    padding: 10,
    borderRadius: 0,
    marginBottom: 15,
  },
});
