import "../styles.css";

import { router, Stack } from "expo-router";
import * as Updates from "expo-updates";
// Convex provider and client

import { ConvexProvider, ConvexReactClient } from "convex/react";

import "react-native-get-random-values";

import React, { useEffect } from "react";
import { Alert, Text, View } from "react-native";
// import LoadingModal from "@/components/loading_modal";
import { getData, removeData } from "@/storageUtils";
import { Env } from "@env";

// import { useAction } from "convex/react";

// import type { Doc } from "@acme/api/convex/_generated/dataModel";
// import { api } from "@acme/api/convex/_generated/api";

const convex = new ConvexReactClient(Env.CONVEX_URL, {
  unsavedChangesWarning: false,
});

export default function Layout() {
  // Twitter auth login
  // const loginTwiitter = useAction(api.onboarding.loginTwitterUser);
  // const [isTwitterAuthLoading, setTwitterAuthLoading] =
  //   useState<boolean>(false);
  useEffect(() => {
    // Check if user is logged in
    onFetchUpdateAsync().catch((result) =>
      console.log(result, ":::_layout.tsx file"),
    );

    async function onFetchUpdateAsync() {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          Alert.alert(
            "Updating app",
            "Wait for latest update to be fetched...",
          );
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }

        getUserLocalData();
      } catch (error: any) {
        // You can also add an alert() to see the error message in case of an error when fetching updates.
        Alert.alert("Update error", `Error fetching latest update: ${error}`, [
          {
            style: "cancel",
            text: "Continue to app",
            onPress: () => {
              getUserLocalData();
            },
          },
        ]);
      }
    }

    function getUserLocalData() {
      try {
        const isOnboarded = getData("@enet-store/isOnboarded", true);
        console.log(isOnboarded, ":::Onboarded value");
        if (!isOnboarded) {
          // setUserIsOnbaorded(false);
          return;
        } else {
          // Check for user object and twitter auth
          const user = getData("@enet-store/user", true) as Record<string, any>;
          const token = getData("@enet-store/token", true) as Record<
            string,
            any
          >;
          console.log(token, token, ":::Token");
          console.log(user, ":::User to trigger login for");
          if (user && token) {
            router.replace({
              pathname: "/(main)/dashboard",
              params: { ...user },
            });
          }
          // else if (!user && token) {
          //   // setTwitterAuthLoading(true);
          //   // If token object is available then refresh the token and fetch new user details
          //   console.log(token, ":::Stored token");

          //   // Get user token and fetch user data
          //   const userData = await Twitter.userData({ token: token?.access });
          //   console.log(userData, ":::User data");

          //   if (!userData) {
          //     // setTwitterAuthLoading(false);
          //     Alert.alert("Failed to authenticate and login user");
          //     return;
          //   }

          //   console.log(userData?.data?.username);

          //   // const user: Doc<"user"> | undefined = await loginTwiitter({
          //   //   nickname: userData?.data?.username,
          //   // });

          //   // storeData("@enet-store/user", {
          //   //   userId: user?._id,
          //   //   nickname: userData?.data?.username.trim(),
          //   // });

          //   // setTwitterAuthLoading(false);

          //   router.push({
          //     pathname: "/(main)/dashboard",
          //     params: {
          //       userId: user?._id,
          //       nickname: userData?.data?.username.trim(),
          //     },
          //   });
          // }
          else if (user && !token) {
            router.replace({
              pathname: "/(main)/dashboard",
              params: { ...user },
            });
          } else {
            // setUserIsOnbaorded(false);
            console.log("final stand on the ambush street....");
          }
        }
      } catch (e: any) {
        // setTwitterAuthLoading(false);
        console.log(e, "::: Error onboarding");
        Alert.alert("Onboarding error", e.message ?? e.toString());
      }
    }
  }, []);

  // Handle user auto authentication after user data has been stored

  return (
    <ErrorBoundary>
      <ConvexProvider client={convex}>
        <Stack
          initialRouteName="/(onboarding)/"
          // initialRouteName="tasks"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
          <Stack.Screen name="(main)" options={{ headerShown: false }} />

          {/* <LoadingModal
          isLoadingModalVisible={isTwitterAuthLoading}
          setLoadingModalVisible={setTwitterAuthLoading}
        >
          <View className="flex w-full flex-col items-center justify-center p-4">
            <ActivityIndicator size={"large"} color={"black"} />
            <Text>Authorizing your twitter account...</Text>
          </View>
        </LoadingModal> */}
        </Stack>
      </ConvexProvider>
    </ErrorBoundary>
  );
}



class ErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next rrender will show the fallback UI
    return { hasError: true };
  }


  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.log(error, errorInfo, ":::error occurred on the app");
    // Clear state and re-direct to onboarding

    removeData("@enet-store/user");
    removeData("@enet-store/token");

    router.replace("/(onboarding)/");
  }


  render() {
    // @ts-ignore
    if (this.state?.hasError) {
      return (
        <View className="p-2 flex items-center justify-center">
          <Text className="text-white font-bolder text-lg">An error occurred while using the app</Text>
        </View>
      )
    }


    // @ts-ignore
    return this.props.children;
  }
}
