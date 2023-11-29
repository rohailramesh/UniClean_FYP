import React, { useState } from "react";
import { Alert, View, Text, TextInput, Button, StyleSheet } from "react-native";
import { supabase } from "../lib/supabase";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
  };

  async function handleAuthentication() {
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });
      Alert.alert("Success", "Please verify your email and login");
      setEmail("");
      setPassword("");
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

// import React, { useState, useEffect } from "react";
// import {
//   Alert,
//   StyleSheet,
//   View,
//   KeyboardAvoidingView,
//   Text,
// } from "react-native";
// import { supabase } from "../lib/supabase";
// import { Button, Input, Icon } from "react-native-elements";

// export default function Auth() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [isSignUp, setIsSignUp] = useState(false);
//   const [secureTextEntry, setSecureTextEntry] = useState(true);

//   async function handleAuthentication() {
//     setLoading(true);

//     if (isSignUp) {
//       const { error } = await supabase.auth.signUp({
//         email: email,
//         password: password,
//       });
//       Alert.alert("Success", "Please verify your email and login");
//       setEmail("");
//       setPassword("");
//       if (error) Alert.alert(error.message);
//     } else {
//       const { error } = await supabase.auth.signInWithPassword({
//         email: email,
//         password: password,
//       });

//       if (error) Alert.alert(error.message);
//     }

//     setLoading(false);
//   }

//   return (
//     <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
//       <View style={styles.container}>
//         <View>
//           <Text style={[styles.appName]}>UniClean</Text>
//         </View>

//         <View style={[styles.verticallySpaced]}>
//           <Input
//             label="Email"
//             leftIcon={{
//               type: "font-awesome",
//               name: "envelope",
//               color: "white",
//             }}
//             onChangeText={(text) => setEmail(text)}
//             value={email}
//             placeholder="email@address.com"
//             autoCapitalize="none"
//             style={{ color: "black" }}
//           />
//         </View>

//         <View style={styles.verticallySpaced}>
//           <Input
//             label="Password"
//             leftIcon={{ type: "font-awesome", name: "lock", color: "bl" }}
//             rightIcon={
//               <Icon
//                 type="font-awesome"
//                 name={secureTextEntry ? "eye-slash" : "eye"}
//                 color="white"
//                 onPress={() => setSecureTextEntry(!secureTextEntry)}
//               />
//             }
//             onChangeText={(text) => setPassword(text)}
//             value={password}
//             secureTextEntry={secureTextEntry}
//             placeholder="Password"
//             autoCapitalize="none"
//             style={{ color: "black" }}
//           />
//         </View>
//         <View style={[styles.verticallySpaced]}>
//           <Button
//             title={isSignUp ? "Sign Up" : "Sign In"}
//             disabled={loading}
//             onPress={() => handleAuthentication()}
//             buttonStyle={styles.button} // Customize button background color
//             titleStyle={styles.buttonText} // Customize button text color
//           />
//         </View>
//         <View style={styles.tabs}>
//           <Button
//             title="Sign In"
//             type="clear"
//             titleStyle={[
//               styles.tabText,
//               isSignUp ? styles.inactiveTabText : styles.activeTabText,
//             ]}
//             onPress={() => setIsSignUp(false)}
//             buttonStyle={[styles.button, styles.roundedButton]}
//           />
//           <Button
//             title="Sign Up"
//             type="clear"
//             titleStyle={[
//               styles.tabText,
//               isSignUp ? styles.activeTabText : styles.inactiveTabText,
//             ]}
//             onPress={() => setIsSignUp(true)}
//             buttonStyle={[styles.button, styles.roundedButton]}
//           />
//         </View>
//       </View>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center", // Center vertically
//     padding: 12,
//     marginTop: 275,
//   },
//   backgroundImage: {
//     flex: 1, // Take up the entire screen
//     resizeMode: "cover", // Adjust the image size to cover the entire container
//   },
//   verticallySpaced: {
//     paddingTop: 4,
//     paddingBottom: 4,
//     alignSelf: "stretch",
//     marginTop: 20,
//   },
//   button: {
//     backgroundColor: "black", // Customize button background color
//   },
//   buttonText: {
//     color: "white", // Customize button text color
//   },
//   tabs: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 100,
//     paddingRight: 20,
//     gap: 5,
//   },
//   tabText: {
//     fontSize: 14,
//     fontWeight: "bold",
//     textAlign: "center",
//     padding: 5,
//     width: "50%",
//   },
//   inactiveTabText: {
//     color: "grey",
//   },
//   activeTabText: {
//     color: "black",
//   },

//   roundedButton: {
//     borderRadius: 5, // Adjust the value as needed
//   },
// });
