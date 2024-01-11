import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
  StyleSheet,
  View,
  Alert,
  Text,
  TextInput,
  ScrollView,
  ImageBackground,
} from "react-native";
import { Button } from "react-native-elements";
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
        .select(`id, username, email, fullname, uniEmail`) // Include the 'name' field
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
      Alert.alert(error.message);
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
        username: username,
        uniEmail: uniEmail,
      });

      if (error) {
        throw error;
      } else {
        setUserName(username);
        Alert.alert(
          "Username saved sucessfully",
          "Log back in to see updated username"
        );
      }
    } catch (error) {
      Alert.alert(error.message);
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
        Alert.alert("Success", "Password updated");
      }
    } catch (error) {
      Alert.alert(error.message);
    } finally {
      setLoading(false);
      setPassword("");
      setConfirmPassword("");
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* <Text>{session?.user?.email || "No user"}</Text> */}
        <View>
          {!username ? <Text>Profile</Text> : <Text>{username}'s Profile</Text>}
        </View>
        <View>
          <View>
            <View>
              <Text>Email:</Text>
              <TextInput value={email} placeholder={email} editable={false} />
              <Text>University Email:</Text>
              <TextInput
                value={uniEmail}
                onChangeText={setUniEmail}
                placeholder="Enter University Email"
              />
            </View>
          </View>
          <View>
            <View>
              <Text>Username:</Text>
              <TextInput
                value={username}
                onChangeText={setUserName}
                placeholder="Enter Username"
              />
            </View>
            <Button
              title="Save Username"
              onPress={() => {
                setUserName(username); // Set the nameSaved state to true
                updateProfile();
              }}
            />
          </View>
        </View>
        <View>
          <View>
            <Text>New Password:</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter New Password"
              secureTextEntry
              // style={styles.input}
            />
          </View>
          <View>
            <Text>Confirm Password:</Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm New Password"
              secureTextEntry
              // style={styles.input}
            />
          </View>
          <Button
            title="Update Password"
            onPress={updatePassword}
            // buttonStyle={[styles.button, styles.roundedButton]}
          />
          <Button
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.button}
            titleStyle={styles.buttonText}
            onPress={() => supabase.auth.signOut()}
            title="Sign Out"
          />
        </View>
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

// import React from "react";
// import { View, Text, StyleSheet, ScrollView } from "react-native";
// import { supabase } from "../lib/supabase";
// import { Button } from "react-native-elements";

// export default function Profile({ session }) {
//   //   const user = session?.user;

//   return (
//     <View style={styles.container}>
//       <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
//         <Text style={styles.welcomeText}>Profile Screen</Text>
//         <Button
//           containerStyle={styles.buttonContainer}
//           buttonStyle={styles.button}
//           titleStyle={styles.buttonText}
//           onPress={() => supabase.auth.signOut()}
//           title="Sign Out"
//         />
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     // flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: 50,
//   },
//   welcomeText: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "black",
//     marginBottom: 20,
//   },
//   buttonContainer: {
//     width: "80%",
//     marginVertical: 20,
//   },
// });
