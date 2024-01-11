import React, { useEffect, useState } from "react";
import Auth from "./screens/Auth";
import HomePage from "./screens/HomePage";
import { supabase } from "./lib/supabase";
import { View } from "react-native";
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
              tabBarLabel: "Tracker",
              headerShown: false,
            }}
          ></Tab.Screen>

          <Tab.Screen
            name="Hygiene Products"
            children={() => <Products session={session} />}
            options={{
              tabBarLabel: "Hygiene Products",
              headerShown: false,
            }}
          ></Tab.Screen>
          <Tab.Screen
            name="UniAI"
            children={() => <Guidance session={session} />}
            options={{
              tabBarLabel: "Guidance",
              headerShown: false,
            }}
          ></Tab.Screen>
          <Tab.Screen
            name="Profile"
            children={() => <Profile session={session} />}
            options={{
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
