import React, { useState, useEffect } from "react";
import MapView, { Marker } from "react-native-maps";
import { View, StyleSheet, Dimensions } from "react-native";
import { LocationMarkers } from "../assets/ProductLocations";
import * as Location from "expo-location";

export default function Products({ session }) {
  const [userLocation, setUserLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync({
        askAgain: true,
      });

      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location.coords);
      setMapReady(true);
    };

    getLocation();
  }, []);

  return (
    <View style={styles.container}>
      {mapReady && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: userLocation?.latitude || 0, // Use 0 as a fallback if location is not available yet
            longitude: userLocation?.longitude || 0,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          provider="google"
          showsUserLocation
          showsMyLocationButton
          showsPointsOfInterest={false}
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
      )}
    </View>
  );
}

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
