import React, { useEffect, useState } from "react";
import Auth from "./screens/Auth";
import HomePage from "./screens/HomePage";
import { supabase } from "./lib/supabase";
import { View, Image } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Products from "./screens/Products";
import Guidance from "./screens/Guidance";
import Profile from "./screens/Profile";

const Tab = createBottomTabNavigator();

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });

    // Fetch the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  return (
    <NavigationContainer>
      {session ? (
        <Tab.Navigator>
          <Tab.Screen
            name=" My Tracker"
            children={() => <HomePage session={session} />}
            options={{
              tabBarIcon: ({ focused }) => (
                <Image
                  source={require("./assets/icons/period.png")}
                  style={{
                    width: 25,
                    height: 25,
                    tintColor: focused ? "#007AFF" : "#8E8E93",
                  }}
                />
              ),
              tabBarLabel: "Tracker",
              headerShown: false,
            }}
          ></Tab.Screen>
          <Tab.Screen
            name="UniCare"
            children={() => <Guidance session={session} />}
            options={{
              tabBarIcon: ({ focused }) => (
                <Image
                  source={require("./assets/icons/patient.png")}
                  style={{
                    width: 25,
                    height: 25,
                    tintColor: focused ? "#007AFF" : "#8E8E93",
                  }}
                />
              ),
              tabBarLabel: "UniCare",
              headerShown: false,
            }}
          ></Tab.Screen>
          <Tab.Screen
            name="Hygiene Products"
            children={() => <Products session={session} />}
            options={{
              tabBarIcon: ({ focused }) => (
                <Image
                  source={require("./assets/icons/hygiene-products.png")}
                  style={{
                    width: 25,
                    height: 25,
                    tintColor: focused ? "#007AFF" : "#8E8E93",
                  }}
                />
              ),
              tabBarLabel: "Hygiene Products",
              headerShown: false,
            }}
          ></Tab.Screen>

          <Tab.Screen
            name="Profile"
            children={() => <Profile session={session} />}
            options={{
              tabBarIcon: ({ focused }) => (
                <Image
                  source={require("./assets/icons/user.png")}
                  style={{
                    width: 25,
                    height: 25,
                    tintColor: focused ? "#007AFF" : "#8E8E93",
                  }}
                />
              ),
              tabBarLabel: "Profile",
              headerShown: false,
            }}
          ></Tab.Screen>
        </Tab.Navigator>
      ) : (
        <Auth />
      )}
    </NavigationContainer>
  );
}
