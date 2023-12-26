import React, { useState, useEffect } from "react";
import MapView, { Marker, Circle } from "react-native-maps";
import { View, StyleSheet, Dimensions, Button } from "react-native";
import { LocationMarkers } from "../assets/ProductLocations";
import * as Location from "expo-location";

export default function Products({ session }) {
  const [userLocation, setUserLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [sortedMarkers, setSortedMarkers] = useState([]);
  const [closestMarker, setClosestMarker] = useState(null);

  useEffect(() => {
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync({
        askAgain: true,
      });

      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let initialLocation = await Location.getCurrentPositionAsync({});
      setUserLocation(initialLocation.coords);

      let location = await Location.watchPositionAsync(
        {},
        (newLocation) => {
          setUserLocation(newLocation.coords);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );

      return () => location.remove();
    };

    getLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      updateMarkers(userLocation);
    }
  }, [userLocation]);

  const updateMarkers = (location) => {
    const distances = LocationMarkers.map((marker) => {
      const distance = haversine(
        location.latitude,
        location.longitude,
        marker.latitude,
        marker.longitude
      );
      return { ...marker, distance };
    });

    distances.sort((a, b) => a.distance - b.distance);
    setSortedMarkers(distances);
    setClosestMarker(distances[0]);
  };

  const haversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  const toRadians = (degrees) => {
    return (degrees * Math.PI) / 180;
  };

  const handleRefresh = () => {
    if (userLocation) {
      updateMarkers(userLocation);
    }
  };

  return (
    <View style={styles.container}>
      {userLocation && (
        <>
          <MapView
            style={styles.map}
            region={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            provider="google"
            showsUserLocation
            showsMyLocationButton
            showsPointsOfInterest={false}
          >
            {closestMarker && (
              <>
                <Circle
                  key="circle"
                  center={{
                    latitude: closestMarker.latitude,
                    longitude: closestMarker.longitude,
                  }}
                  radius={10}
                  strokeWidth={2}
                  strokeColor="rgba(255,0,0,0.5)"
                  fillColor="rgba(255,0,0,0.2)"
                />
                <Marker
                  key="marker"
                  coordinate={{
                    latitude: closestMarker.latitude,
                    longitude: closestMarker.longitude,
                  }}
                  title={`${
                    closestMarker.title
                  } - ${closestMarker.distance.toFixed(2)} km away`}
                  description={`${closestMarker.distance.toFixed(2)} km away`}
                />
              </>
            )}

            {sortedMarkers.map((marker, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: marker.latitude,
                  longitude: marker.longitude,
                }}
                title={`${marker.title} - ${marker.distance.toFixed(
                  2
                )} km away`}
                description={`${marker.distance.toFixed(2)} km away`}
              />
            ))}
          </MapView>
          <Button title="Refresh Map" onPress={handleRefresh} />
        </>
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
