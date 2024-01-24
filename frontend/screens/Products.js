import React, { useState, useEffect } from "react";
import MapView, { Marker, Circle } from "react-native-maps";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  ActivityIndicator,
  Image,
} from "react-native";
import { LocationMarkers } from "../assets/ProductLocations";
import * as Location from "expo-location";
import customMapStyle from "../assets/MapStyle";

export default function Products({ session }) {
  const [userLocation, setUserLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [sortedMarkers, setSortedMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [closestMarker, setClosestMarker] = useState(null);
  const [secondClosestMarker, setSecondClosestMarker] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.001,
    longitudeDelta: 0.001,
  });

  useEffect(() => {
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync({
        askAgain: true,
      });

      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        setLoading(false);
        return;
      }

      try {
        let initialLocation = await Location.getCurrentPositionAsync({});
        setUserLocation(initialLocation.coords);
        setMapRegion({
          latitude: initialLocation.coords.latitude,
          longitude: initialLocation.coords.longitude,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        });
        setLoading(false);

        let location = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            distanceInterval: 1,
          },
          (newLocation) => {
            setUserLocation(newLocation.coords);
            updateMarkers(newLocation.coords);
          },
          (error) => {
            console.error("Error getting location:", error);
          }
        );

        return () => location.remove();
      } catch (error) {
        console.error("Error getting initial location:", error);
        setLoading(false);
      }
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
    setSecondClosestMarker(distances[1]);
    setMapRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.001,
      longitudeDelta: 0.001,
    });
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
    setLoading(true);
    if (userLocation) {
      updateMarkers(userLocation);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Finding nearest pickup locations... </Text>
          <Text>This may take a few seconds.</Text>
        </View>
      ) : (
        <>
          <MapView
            style={styles.map}
            region={mapRegion}
            provider="google"
            customMapStyle={customMapStyle}
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
                  }  ${closestMarker.distance.toFixed(4)} km away`}
                  description={`Where to find them:\n${closestMarker.directions}\nProducts availability: Tampons - Yes,\nSanitary pads - Yes`}
                  pinColor="red" // Use the default red pin color
                  zIndex={0}
                />
              </>
            )}

            {secondClosestMarker && (
              <>
                <Circle
                  key="circle"
                  center={{
                    latitude: secondClosestMarker.latitude,
                    longitude: secondClosestMarker.longitude,
                  }}
                  radius={10}
                  strokeWidth={2}
                  strokeColor="rgba(0,0,255,0.3)"
                  fillColor="rgba(0,0,255,0.3)"
                />
                <Marker
                  key="marker"
                  coordinate={{
                    latitude: secondClosestMarker.latitude,
                    longitude: secondClosestMarker.longitude,
                  }}
                  title={`${
                    secondClosestMarker.title
                  }  ${secondClosestMarker.distance.toFixed(4)} km away`}
                  description={`Where to find them:\n${secondClosestMarker.directions}\nProducts availability: Tampons - Yes,\nSanitary pads - Yes`}
                  // pinColor="green"
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
                  4
                )} km away`}
                description={`${marker.distance.toFixed(4)} km away`}
              />
            ))}
            <Text style={styles.nearLocationsHeader}>
              {sortedMarkers.filter((marker) => marker.distance <= 1).length}{" "}
              location(s) within 1 km of your current location{"\n"}
              Click on the markers to see more details.
            </Text>
          </MapView>
          {/* <Button title="Refresh Map" onPress={handleRefresh} /> */}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    marginBottom: 60,
  },
  nearLocationsHeader: {
    position: "absolute",
    top: 130,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 1,
    minHeight: 50,
    minWidth: "100%",
    flex: 1,
    textAlign: "center",
  },
});
