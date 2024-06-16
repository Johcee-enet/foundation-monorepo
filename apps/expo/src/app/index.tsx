// ---------------?---------------@---------------!---------------

// ? file is the first render of screen after the auto gen splash screen
// ? handles auto login and redirection based on auth state
// ? handles authenticaton both 3rd party and internal authentications
// ? initializes twitter oauth2 logic and handles callback after authing
// ? reads and updates local storage data
// @
// ! might block launch and proper start if redirection is not handled properly
// ! might throw unwanted delays in Promise logic

// import type { TokenResponse } from "expo-auth-session";
import {
  // useEffect,
  useState,
} from "react";
import {
  // ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  // TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Link, router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
// import LoadingModal from "@/components/loading_modal";
import { storeData } from "@/storageUtils";
// import { FontAwesome6 } from "@expo/vector-icons";
import { useAction } from "convex/react";

import { api } from "@acme/api/convex/_generated/api";

export default function Register() {
  const [email, setEmail] = useState("");
  const [referreeCode, setReferreeCode] = useState<string>();
  const [password, setPassword] = useState("");
  // const [userIsOnboarded, setUserIsOnbaorded] = useState(false);
  const [authState, setAuthState] = useState<"login" | "signup">("signup");

  const initiateUser = useAction(api.onboarding.initializeNewUser);
  const loginUser = useAction(api.onboarding.loginUser);

  // const storeNickname = useMutation(api.onboarding.storeNickname);
  // const isNicknameValid = useMutation(api.onboarding.isNicknameValid);
  // const loginTwitterUser = useAction(api.onboarding.loginTwitterUser);

  return (
    <SafeAreaView className="bg-[#EBEBEB]">
      <KeyboardAvoidingView behavior={"position"}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView className="min-h-screen w-full bg-white">
            <View className="flex h-auto w-full flex-col items-center justify-center gap-4 rounded-b-[35px] bg-[#EBEBEB] py-6">
              <Image
                source={require("../../assets/foundation_logo.png")}
                style={{ width: 170, height: 170, alignItems: "center" }}
              />
              <Text
                style={{ fontSize: 24 }}
                className="font-[nunito] text-[24px] font-bold tracking-normal"
              >
                Welcome to Foundation
              </Text>
              <Text className="font-[nunito] text-[14px] font-light tracking-widest">
                THE Web3 STANDARD
              </Text>
            </View>
            <View className="flex h-auto w-full flex-col items-center justify-center px-[20px] py-5">
              <View style={{ marginVertical: 10 }} />
              <TextInput
                placeholder="Email address"
                className="mb-[16px] w-full rounded-md bg-[#EBEBEB] px-6 py-4 font-[nunito] text-lg font-medium text-black placeholder:font-light placeholder:text-black"
                onChangeText={(text) => setEmail(text)}
              />
              {authState === "signup" && (
                <TextInput
                  placeholder="Referral"
                  className="w-full rounded-md bg-[#EBEBEB] px-6 py-4 font-[nunito] text-lg font-medium text-black placeholder:font-light placeholder:text-black"
                  value={referreeCode}
                  onChangeText={(text) => setReferreeCode(text)}
                />
              )}
              {authState === "login" && (
                <TextInput
                  placeholder="Password"
                  value={password}
                  className="w-full rounded-md bg-[#EBEBEB] px-6 py-4 font-[nunito] text-lg font-medium text-black placeholder:font-light placeholder:text-black"
                  onChangeText={(text) => setPassword(text)}
                />
              )}
              <View className="w-full items-end justify-center">
                {authState === "signup" && (
                  <Link
                    className="font-[nunito] text-lg font-semibold text-blue-500"
                    href="/"
                    onPress={(e) => {
                      e.preventDefault();
                      // storeData("@enet-store/isOnboarded", true);

                      setAuthState("login");
                    }}
                  >
                    Login
                  </Link>
                )}
                {authState === "login" && (
                  <Link
                    className="font-[nunito] text-lg font-semibold text-blue-500"
                    href="/"
                    onPress={(e) => {
                      e.preventDefault();
                      // storeData("@enet-store/isOnboarded", false);

                      setAuthState("signup");
                    }}
                  >
                    Signup
                  </Link>
                )}
              </View>
            </View>

            <View className="flex-1" />

            <View
              className="flex h-auto w-full flex-col items-center justify-center px-[20px]"
              style={{ marginVertical: 120 }}
            >
              <View className="flex w-full flex-row items-center justify-center gap-3">
                <Link
                  suppressHighlighting
                  href="/#"
                  className="flex flex-1 items-center justify-center overflow-hidden rounded-lg bg-black p-4 text-center font-[nunito] text-lg font-normal text-white transition-colors"
                  onPress={async (e) => {
                    try {
                      e.preventDefault();
                      // return router.push("/(main)/history");
                      //

                      // TODO: If user is onboarded already, then login
                      if (authState === "login") {
                        if (!email.length || !password.length) {
                          return Alert.alert(
                            "Onbaording error",
                            "Valid email or password must be entered",
                          );
                        }

                        const user = await loginUser({ email, password });
                        const userId = user?._id;
                        // Store data to local storage
                        storeData("@enet-store/isOnboarded", true);
                        storeData("@enet-store/user", {
                          email,
                          userId,
                          nickname: user?.nickname,
                        });

                        return router.push({
                          pathname: "/(main)/dashboard",
                          params: { email, userId, nickname: user?.nickname },
                        });
                      }

                      if (!email.length) {
                        return Alert.alert(
                          "Onbaording error",
                          "Valid email must be entered",
                        );
                      }

                      // TODO: call server convex function to store users email and referral then send OTP to email address
                      const userId = await initiateUser({
                        referreeCode: referreeCode,
                        email: email.trim(),
                      });

                      console.log(userId, ":::Result of stored user");

                      // Store data to local storage
                      storeData("@enet-store/user", { email, userId });
                      storeData("@enet-store/isOnboarded", true);

                      router.push({
                        pathname: "/(onboarding)/password",
                        params: { email, userId },
                      });
                    } catch (e: any) {
                      Alert.alert("Onboarding error", e.message);
                    }
                  }}
                >
                  {authState === "login" ? "Login" : "Signup"}
                </Link>
              </View>

              <Text
                style={{ marginTop: 25 }}
                className="mx-5 text-center font-[nunito] text-lg leading-6 text-black"
              >
                By continuing, you agree to our{" "}
                <Link
                  // suppressHighlighting
                  className="text-[#15BDCF]"
                  href="/#"
                  onPress={async (e) => {
                    e.preventDefault();
                    // Call bottom sheet slider to display terms
                    await WebBrowser.openBrowserAsync(
                      "https://enetecosystem.gitbook.io/foundation/terms-and-conditions",
                    );
                  }}
                >
                  terms of service
                </Link>{" "}
                and{" "}
                <Link
                  // suppressHighlighting
                  className="text-[#15BDCF]"
                  href="/#"
                  onPress={async (e) => {
                    e.preventDefault();
                    await WebBrowser.openBrowserAsync(
                      "https://enetecosystem.gitbook.io/foundation/privacy-policy",
                    );
                  }}
                >
                  privacy policy
                </Link>
                .
              </Text>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
