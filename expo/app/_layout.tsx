import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback, useEffect, useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { RequestsProvider } from "@/contexts/RequestsContext";
import { WipProvider } from "@/contexts/WipContext";

void SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore — native splash may not be available in Expo Go */
});

const queryClient = new QueryClient();

/** Waits until auth is done bootstrapping, then hides the native splash.
 *  Falls back to a 5 s timeout so the user never gets stuck. */
function SplashGate({ onReady }: { onReady: () => void }) {
  const { isLoading } = useAuth();
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;

    if (!isLoading) {
      calledRef.current = true;
      onReady();
      return;
    }

    const timeout = setTimeout(() => {
      if (!calledRef.current) {
        calledRef.current = true;
        onReady();
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [isLoading, onReady]);

  return null;
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Atrás" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen
        name="request-service"
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="request-tracking"
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="checkout"
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="payments-test"
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const hideSplash = useCallback(() => {
    void SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <SplashGate onReady={hideSplash} />
          <WipProvider>
            <RequestsProvider>
              <RootLayoutNav />
            </RequestsProvider>
          </WipProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
