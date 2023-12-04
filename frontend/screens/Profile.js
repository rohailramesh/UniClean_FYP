// import React, { useState, useEffect } from "react";
// import { supabase } from "../lib/supabase";
// import {
//   View,
//   Alert,
//   Text,
//   TextInput,
//   ScrollView,
//   ImageBackground,
// } from "react-native";
// import { Button } from "react-native-elements";
// import { IconButton } from "react-native-paper";

// export default function Profile({ session }) {
//   const [loading, setLoading] = useState(true);
//   const [name, setName] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [email, setEmail] = useState("");

//   useEffect(() => {
//     getProfile();
//   }, [session]);

//   async function getProfile() {
//     try {
//       setLoading(true);

//       if (!session?.user) {
//         throw new Error("No user on the session!");
//       }

//       let { data, error, status } = await supabase
//         .from("profile")
//         .select(`id, name, email`) // Include the 'name' field
//         .eq("id", session.user.id)
//         .single();

//       if (error && status !== 406) {
//         throw error;
//       }
//       if (data) {
//         setName(data.name);
//         setEmail(data.email);
//       }
//     } catch (error) {
//       Alert.alert(error.message);
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function updateProfile() {
//     try {
//       setLoading(true);

//       if (!session?.user) throw new Error("No user on the session!");

//       // Check if the user already exists in the 'profile' table
//       const existingProfile = await supabase
//         .from("profile")
//         .select("id, name, email")
//         .eq("id", session.user.id)
//         .single();

//       if (!existingProfile.data) {
//         // If the user doesn't exist, insert a new profile entry
//         await supabase.from("profile").upsert({
//           id: session.user.id,
//           name: name,
//           email: session.user.email,
//         });
//       } else {
//         // If the user already exists, update the existing profile entry
//         await supabase
//           .from("profile")
//           .update({ name: name })
//           .eq("id", session.user.id);
//       }

//       Alert.alert("Success", "Profile updated");
//     } catch (error) {
//       Alert.alert(error.message);
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function updatePassword() {
//     try {
//       if (!session?.user) {
//         throw new Error("No user on the session!");
//       }

//       if (password !== confirmPassword) {
//         throw new Error("Passwords do not match!");
//       }

//       setLoading(true);

//       const { error } = await supabase.auth.updateUser({
//         password: password,
//       });

//       if (error) {
//         throw error;
//       } else {
//         Alert.alert("Success", "Password updated");
//       }
//     } catch (error) {
//       Alert.alert(error.message);
//     } finally {
//       setLoading(false);
//       setPassword("");
//       setConfirmPassword("");
//     }
//   }

//   return (
//     <View style={{ marginTop: 40, padding: 12 }}>
//       <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
//         <View
//           style={{
//             flexDirection: "row",
//             justifyContent: "space-between",
//             alignItems: "center",
//             paddingHorizontal: 20,
//             marginTop: 10,
//             borderWidth: 1,
//             borderRadius: 5,
//             marginBottom: 10,
//           }}
//         >
//           {!name ? (
//             <Text style={{ fontSize: 20, fontWeight: "bold" }}>Profile</Text>
//           ) : (
//             <Text style={{ fontSize: 20, fontWeight: "bold" }}>
//               {name}'s Profile
//             </Text>
//           )}
//           <IconButton
//             icon="location-exit"
//             onPress={() => supabase.auth.signOut()}
//           />
//         </View>
//         <View>
//           <View>
//             <View
//               style={{
//                 flexDirection: "row",
//                 alignItems: "center",
//                 justifyContent: "space-between",
//                 marginBottom: 18,
//                 paddingLeft: 6,
//                 backgroundColor: "white",
//                 borderRadius: 8,
//               }}
//             >
//               <Text style={{ fontWeight: "bold" }}>Email:</Text>
//               <TextInput
//                 value={email}
//                 placeholder={email}
//                 style={{
//                   flex: 1,
//                   marginLeft: 10,
//                   borderWidth: 0.9,
//                   borderColor: "black",
//                   borderRadius: 8,
//                   padding: 8,
//                 }}
//                 editable={false}
//               />
//             </View>
//           </View>
//           <View>
//             <View
//               style={{
//                 flexDirection: "row",
//                 alignItems: "center",
//                 justifyContent: "space-between",
//                 marginBottom: 18,
//                 paddingLeft: 6,
//                 backgroundColor: "white",
//                 borderRadius: 8,
//               }}
//             >
//               <Text style={{ fontWeight: "bold" }}>Name:</Text>
//               <TextInput
//                 value={name}
//                 onChangeText={setName}
//                 placeholder="Enter Name"
//                 style={{
//                   flex: 1,
//                   marginLeft: 10,
//                   borderWidth: 0.9,
//                   borderColor: "black",
//                   borderRadius: 8,
//                   padding: 8,
//                 }}
//               />
//             </View>
//             <Button
//               title="Save Name"
//               onPress={() => updateProfile()}
//               buttonStyle={{ backgroundColor: "black", borderRadius: 8 }}
//             />
//           </View>
//         </View>
//         <View style={{ marginTop: 15 }}>
//           <View
//             style={{
//               flexDirection: "row",
//               alignItems: "center",
//               justifyContent: "space-between",
//               marginBottom: 18,
//               paddingLeft: 6,
//               backgroundColor: "white",
//               borderRadius: 8,
//             }}
//           >
//             <Text style={{ fontWeight: "bold" }}>New Password:</Text>
//             <TextInput
//               value={password}
//               onChangeText={setPassword}
//               placeholder="Enter New Password"
//               secureTextEntry
//               style={{
//                 flex: 1,
//                 marginLeft: 10,
//                 borderWidth: 0.9,
//                 borderColor: "black",
//                 borderRadius: 8,
//                 padding: 8,
//               }}
//             />
//           </View>
//           <View
//             style={{
//               flexDirection: "row",
//               alignItems: "center",
//               justifyContent: "space-between",
//               marginBottom: 18,
//               paddingLeft: 6,
//               backgroundColor: "white",
//               borderRadius: 8,
//             }}
//           >
//             <Text style={{ fontWeight: "bold" }}>Confirm Password:</Text>
//             <TextInput
//               value={confirmPassword}
//               onChangeText={setConfirmPassword}
//               placeholder="Confirm New Password"
//               secureTextEntry
//               style={{
//                 flex: 1,
//                 marginLeft: 10,
//                 borderWidth: 0.9,
//                 borderColor: "black",
//                 borderRadius: 8,
//                 padding: 8,
//               }}
//             />
//           </View>
//           <Button
//             title="Update Password"
//             onPress={updatePassword}
//             buttonStyle={{ backgroundColor: "black", borderRadius: 8 }}
//           />
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

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
