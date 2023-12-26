import React from "react";
import MapView, { Callout, Circle, Marker } from "react-native-maps";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { supabase } from "../lib/supabase";
import { Button } from "react-native-elements";
import { LocationMarkers } from "../assets/ProductLocations";

export default function Products({ session }) {
  // const user = session?.user;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        // initial region is the current location of the user
        initialRegion={{
          latitude: 51.523220481851524,
          longitude: -0.04035115242004395,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        provider="google"
      >
        {LocationMarkers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.title}
          />
        ))}
      </MapView>
    </View>
  );
}

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
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});
