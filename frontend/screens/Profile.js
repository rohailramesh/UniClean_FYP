import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  ImageBackground,
} from "react-native";
import { Button } from "react-native-elements";
import { supabase } from "../lib/supabase";
import { IconButton } from "react-native-paper";

export default function Profile({ session }) {
  const [loading, setLoading] = useState(true);
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [fullname, setFullName] = useState("");
  const [uniEmail, setUniEmail] = useState("");

  useEffect(() => {
    getProfile();
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);

      if (!session?.user) {
        throw new Error("No user on the session!");
      }

      let { data, error, status } = await supabase
        .from("profiles")
        .select(`id, username, email, fullname, uniEmail`)
        .eq("id", session.user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }
      if (data) {
        setUserName(data.username);
        setEmail(data.email);
        setFullName(data.fullname);
        setUniEmail(data.uniEmail);
      }
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile() {
    try {
      setLoading(true);

      if (!session?.user) throw new Error("No user on the session!");

      let { error } = await supabase.from("profiles").upsert({
        id: session?.user.id,
        // username: username,
        uniEmail: uniEmail,
      });

      if (error) {
        throw error;
      } else {
        // setUserName(username);
        setUniEmail(uniEmail);
        alert("Profile updated successfully");
      }
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function updatePassword() {
    try {
      if (!session?.user) {
        throw new Error("No user on the session!");
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match!");
      }

      setLoading(true);

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      } else {
        alert("Password updated successfully");
        // console.log("Password updated successfully");
      }
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
      setPassword("");
      setConfirmPassword("");
    }
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../assets/profile-bg2.jpg")}
        style={styles.backgroundImage}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.headerContainer}>
            {!username ? (
              <Text style={styles.headerText}>Profile</Text>
            ) : (
              <Text style={styles.headerText}>{username}'s Profile</Text>
            )}
          </View>
          <View style={styles.fieldContainer}>
            <Text style={styles.boldText}>Name:</Text>
            <TextInput
              value={fullname}
              placeholder={fullname}
              style={styles.input}
              editable={false}
            />
          </View>
          <View style={styles.fieldContainer}>
            <Text style={styles.boldText}>Email:</Text>
            <TextInput
              value={email}
              placeholder={email}
              style={styles.input}
              editable={false}
            />
          </View>
          <View style={styles.fieldContainer}>
            <Text style={styles.boldText}>University Email:</Text>
            <TextInput
              value={uniEmail}
              onChangeText={setUniEmail}
              placeholder={uniEmail}
              style={styles.input}
            />
          </View>
          <View>
            <View style={styles.fieldContainer}>
              <Text style={styles.boldText}>New Password:</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter New Password"
                secureTextEntry
                style={styles.input}
              />
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.boldText}>Confirm Password:</Text>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm New Password"
                secureTextEntry
                style={styles.input}
              />
            </View>
          </View>
          <View style={styles.inlineInputContainer}>
            <Button
              title="Update Uni Email"
              onPress={updateProfile}
              buttonStyle={[styles.button, styles.roundedButton]}
            />
            <Button
              title="Update Password"
              onPress={updatePassword}
              buttonStyle={[styles.button, styles.roundedButton]}
            />
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover", // or "stretch"
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
  button: {
    backgroundColor: "black", // Customize button background color
    marginLeft: 10,
    marginRight: 10,
  },
  buttonText: {
    color: "white", // Customize button text color
  },
  inlineInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 2,
    width: "100%",
    paddingLeft: 20,
    paddingRight: 20,
    marginTop: 50,
  },
  fieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  boldText: {
    fontWeight: "bold",
  },
});
