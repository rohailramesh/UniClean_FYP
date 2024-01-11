import React, { useState } from "react";
import {
  Alert,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { supabase } from "../lib/supabase";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUserName] = useState("");
  const [fullname, setFullName] = useState("");

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

      if (error) {
        Alert.alert("Error", "Sign up failed. Please try again");
      } else {
        Alert.alert("Success", "Please verify your email and login");
        setEmail("");
        setPassword("");
        setUserName("");
        setFullName("");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        Alert.alert("Error", "Sign in failed. Please try again");
      }
    }

    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../assets/loginBG.jpg")}
        style={styles.backgroundImage}
      >
        <View style={{ height: 760 }}>
          <Text style={styles.heading}>UniClean</Text>
          {isSignUp && (
            <>
              <View style={styles.inputContainer}>
                <View style={styles.inlineInputContainer}>
                  <TextInput
                    value={fullname}
                    onChangeText={setFullName}
                    placeholder="Full Name"
                    style={styles.signupInput}
                  />
                  <TextInput
                    value={username}
                    onChangeText={setUserName}
                    placeholder="Username"
                    style={styles.signupInput}
                  />
                </View>
              </View>
            </>
          )}
          <View style={styles.inputContainer}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              style={isSignUp ? styles.signupInput : styles.signinInput}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry
              style={isSignUp ? styles.signupInput : styles.signinInput}
            />
          </View>
          <TouchableOpacity
            onPress={handleAuthentication}
            style={styles.buttonLogin}
          >
            <Text style={{ color: "black" }}>
              {isSignUp ? "Sign Up" : "Sign In"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleSignUp} style={{ marginTop: 10 }}>
            <Text style={{ color: "black", textAlign: "center" }}>
              {isSignUp ? "Already a user? Sign In" : "New user? Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  inputContainer: {
    paddingLeft: 30,
    paddingRight: 30,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  heading: {
    fontSize: 26,
    marginBottom: 20,
    color: "black",
    textAlign: "center",
  },
  signupInput: {
    width: "100%",
    borderColor: "#bbb",
    padding: 12,
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  signinInput: {
    width: "100%",
    borderColor: "#ccc",
    padding: 18,
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: "#f5f5f5",
  },
  inlineInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 7,
    width: "49%",
  },
  buttonLogin: {
    borderWidth: 2,
    alignItems: "center",
    padding: 10,
    borderRadius: 5,
    borderColor: "black",
    paddingLeft: 30,
    paddingRight: 30,
    marginLeft: 30,
    marginRight: 30,
    marginTop: 10,
  },
});

// import React, { useState } from "react";
// import {
//   Alert,
//   View,
//   Text,
//   TextInput,
//   Button,
//   StyleSheet,
//   ImageBackground,
// } from "react-native";
// import { supabase } from "../lib/supabase";

// export default function Auth() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [isSignUp, setIsSignUp] = useState(false);
//   const [username, setUserName] = useState("");
//   const [fullname, setFullName] = useState("");
//   // Add more fields that are in the profiles table

//   const toggleSignUp = () => {
//     setIsSignUp(!isSignUp);
//   };

//   async function handleAuthentication() {
//     setLoading(true);

//     if (isSignUp) {
//       const { error } = await supabase.auth.signUp({
//         email: email,
//         password: password,
//         options: {
//           data: {
//             username: username,
//             fullname: fullname,
//           },
//         },
//       });
//       Alert.alert("Success", "Please verify your email and login");
//       setEmail("");
//       setPassword("");
//       setUserName("");
//       setFullName("");
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
//     <View style={styles.container}>
//       <ImageBackground
//         source={require("../assets/signinBG.jpg")}
//         style={styles.backgroundImage}
//       >
//         <Text style={styles.heading}>{isSignUp ? "Sign Up" : "Sign In"}</Text>
//         {isSignUp && (
//           <>
//             <TextInput
//               value={fullname}
//               onChangeText={setFullName}
//               placeholder="Full Name"
//               style={styles.input}
//             />
//             <TextInput
//               value={username}
//               onChangeText={setUserName}
//               placeholder="Username"
//               style={styles.input}
//             />
//           </>
//         )}
//         <TextInput
//           value={email}
//           onChangeText={setEmail}
//           placeholder="Email"
//           style={styles.input}
//         />
//         <TextInput
//           value={password}
//           onChangeText={setPassword}
//           placeholder="Password"
//           secureTextEntry
//           style={styles.input}
//         />
//         <Button
//           title={isSignUp ? "Sign Up" : "Sign In"}
//           onPress={handleAuthentication}
//         />
//         <Button
//           title={isSignUp ? "Already a user? Sign In" : "New user? Sign Up"}
//           onPress={toggleSignUp}
//         />
//       </ImageBackground>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     justifyContent: "center",
//     marginTop: 150,
//   },
//   heading: {
//     fontSize: 26,
//     marginBottom: 20,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#bbb",
//     padding: 10,
//     borderRadius: 0,
//     marginBottom: 15,
//   },
// });
