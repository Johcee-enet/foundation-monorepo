import type { BottomSheetMethods } from "@devvie/bottom-sheet";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  // Modal,
  View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import {
  SafeAreaView,
  useSafeAreaFrame,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { makeRedirectUri, useAuthRequest } from "expo-auth-session";
import { Image } from "expo-image";
import { router, Stack, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { delay } from "@/appUtils";
// import { checkCountdown } from "@/appUtils";
import ClaimModal from "@/components/claim_modal";
import DashboardHeader from "@/components/dashboard_header";
import Input from "@/components/input";
import LoadingModal from "@/components/loading_modal";
import { Overview } from "@/components/overview_card";
import { StatsCard } from "@/components/stats_card";
import TaskBoostCard, {
  icons,
  TaskRenderer,
} from "@/components/task_boost_card";
import { getData, removeData, storeData } from "@/storageUtils";
import { Twitter, TwitterAuth } from "@/twitterUtils";
import BottomSheet from "@devvie/bottom-sheet";
import { Env } from "@env";
import {
  FontAwesome,
  FontAwesome6,
  MaterialIcons,
  Octicons,
} from "@expo/vector-icons";
import { useAction, useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { addHours, differenceInSeconds } from "date-fns";

import type { Doc, Id } from "@acme/api/convex/_generated/dataModel";
import { api } from "@acme/api/convex/_generated/api";

export type EventType = Partial<Doc<"events">> & {
  company: Partial<Doc<"company">> & { logoUrl: string };
};
// type Network = "twitter" | "discord" | "telegram" | "website";
// type ActionType = "follow" | "post" | "join" | "visit";

WebBrowser.maybeCompleteAuthSession();
const discovery = {
  authorizationEndpoint: "https://twitter.com/i/oauth2/authorize",
  tokenEndpoint: "https://twitter.com/i/oauth2/token",
  revocationEndpoint: "https://twitter.com/i/oauth2/revoke",
};

export default function DashboardPage() {
  const params = useLocalSearchParams();

  const { top, bottom } = useSafeAreaInsets();
  const { height } = useSafeAreaFrame();
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch users data
  const userDetail = useQuery(api.queries.getUserDetails, {
    userId: params?.userId as Id<"user">,
  });

  const [claimModalVisible, setClaimModalVisible] = useState(false);
  const [eventSheetContent, setEventSheetContent] = useState<
    EventType | undefined
  >();
  const [taskSheetContent, setTaskSheetContent] = useState<
    Doc<"tasks"> | undefined
  >();

  // Referral prompt controls
  const [isReferralPromptModalVisible, setReferralPromptModalVisible] =
    useState<boolean>(false);
  const [referreeCode, setReferreeCode] = useState<string>();

  const claimReward = useMutation(api.mutations.claimRewards);
  const triggerMiner = useMutation(api.mutations.triggerMining);

  // Get tasks and events

  const fetchEvents = useQuery(api.queries.fetchEvents, {
    userId: params?.userId as Id<"user">,
  });

  // Redeem referral
  const redeemReferral = useMutation(api.mutations.redeemReferralCode);

  // EVent bottom sheet
  const eventSheetRef = useRef<BottomSheetMethods>(null);
  const taskSheetRef = useRef<BottomSheetMethods>(null);

  const adConfig = useQuery(api.queries.getAdsConfig);

  // console.log(bottom, top, ":::Bottom Top, size", height, height - top);

  // Embeding
  // const [tweetEmbedHeight, setTweetEmbedHeight] = useState<number>();
  const [remaining, setRemaining] = useState<string>();

  useEffect(() => {
    if (
      !(userDetail?.mineActive ?? false) &&
      (userDetail?.redeemableCount ?? 0) > 0
    ) {
      setClaimModalVisible(true);
    }
  }, [userDetail?.mineActive, userDetail?.redeemableCount, userDetail]);

  // Check if user just onboarded and prompt to enter a referral code
  useEffect(() => {
    const promptHasBeenShown = getData("@enet-store/referralPromptShown", true);
    const isTwitterAuthed = getData("@enet-store/token", true);

    if (!isTwitterAuthed) {
      setTwitterAuthModalVisible(true);
    }

    // setReferralPromptModalVisible(true);
    if (!promptHasBeenShown || typeof promptHasBeenShown === "undefined") {
      console.log(promptHasBeenShown, ":::Inside condition");
      setReferralPromptModalVisible(true);
    }
  }, []);

  const [isBoostLoadingVisible, setBoostLoadingModalVisible] = useState(false);

  // handle tasks cycle
  const [isLoadingModalVisible, setLoadingModalVisible] = useState(false);
  const rewardTaskXpCount = useMutation(api.mutations.rewardTaskXp);
  const rewardEventXpCount = useMutation(api.mutations.rewardEventXp);
  const updateEventAction = useMutation(api.mutations.updateEventsForUser);
  const activateBoost = useMutation(api.mutations.activateBoost);

  // Twitter auth refactor
  const [isTwitterAuthLoading, setTwitterAuthLoading] =
    useState<boolean>(false);

  const redirectUri = makeRedirectUri({
    // native: "com.enetminer.enet/",
    scheme: "com.enetminer.enet",
    path: "/(main)/dashboard",
    isTripleSlashed: true,
    queryParams: {
      userId: params?.userId as Id<"user">,
    },
  });

  // Twitter auth test
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: Env.TWITTER_CLIENT_ID,
      redirectUri,
      usePKCE: true,
      scopes: [
        "tweet.read",
        "tweet.write",
        "users.read",
        "like.write",
        "list.read",
        "follows.write",
        "space.read",
        "follows.read",
        "list.read",
        "offline.access",
      ],
    },
    discovery,
  );

  // Handle useAuthRequest response after twitter callback
  useEffect(() => {
    if (response && response?.type === "success") {
      const { code } = response.params;
      exchangeCodeForToken(code!)
        .then((result) => {
          console.log(result, ":::Result of code exchange");
        })
        .catch((error: any) =>
          console.log(
            error.message ?? error.toString(),
            ":::Error for code exchange",
          ),
        );
    }

    async function exchangeCodeForToken(code: string) {
      try {
        // Get TwitterAuth namespace
        if (code && redirectUri && request) {
          // setTwitterAuthLoading(true);
          const tokenResponse = await TwitterAuth.exchangeCodeForToken({
            code,
            clientId: Env.TWITTER_CLIENT_ID,
            redirectUrl: redirectUri,
            codeVerifier: request.codeVerifier!,
          });
          console.log(tokenResponse, ":::Token response");

          // const isOnboarded = getData("@enet-store/isOnboarded", true);

          // if (isOnboarded) {
          //   // if user has already onbaorded
          //   setTwitterAuthLoading(true);

          //   if (tokenResponse) {
          //     storeData("@enet-store/token", {
          //       access: tokenResponse?.access_token,
          //       refresh: tokenResponse?.refresh_token,
          //     });
          //     const userData = await Twitter.userData({
          //       token: tokenResponse?.access_token,
          //     });
          //     console.log(userData, ":::User data");

          //     // Get user by nickname
          //     const user = await loginTwitterUser({
          //       nickname: userData?.data.username,
          //     });

          //     const userId = user._id;

          //     storeData("@enet-store/user", {
          //       userId,
          //       nickname: userData?.data?.username.trim(),
          //     });
          //     setTwitterAuthLoading(false);

          //     return router.push({
          //       pathname: "/(main)/dashboard",
          //       params: { userId, nickname: userData?.data?.username.trim() },
          //     });
          //   }
          // } else {
          if (tokenResponse) {
            const userData = await Twitter.userData({
              token: tokenResponse?.access_token,
            });
            console.log(userData, ":::User data");
            storeData("@enet-store/token", {
              access: tokenResponse?.access_token,
              refresh: tokenResponse?.refresh_token,
            });

            // TODO: Create user if not already created and store email and username as nickname
            // const isValid = await isNicknameValid({
            //   nickname: userData?.data?.username.trim(),
            // });

            // if (isValid) {
            //   const userId = await storeNickname({
            //     nickname: userData?.data?.username.trim(),
            //     referreeCode,
            //   });
            //   storeData("@enet-store/user", {
            //     userId,
            //     nickname: userData?.data?.username.trim(),
            //   });
            //   setTwitterAuthLoading(false);

            //   // Store the returned data
            //   storeData("@enet-store/isOnboarded", true);
            //   storeData("@enet-store/token", {
            //     access: tokenResponse?.access_token,
            //     refresh: tokenResponse?.refresh_token,
            //   });

            //   router.push({
            //     pathname: "/(main)/dashboard",
            //     params: { userId, nickname: userData?.data?.username.trim() },
            //   });
            // } else {
            //   setTwitterAuthLoading(false);
            //   return Alert.alert(
            //     "Nickname/Username is already in use, try another one",
            //   );
            // }
          }
        }

        setTwitterAuthModalVisible(false);

        // Get basic user info before proceeding
        // }
      } catch (err: any) {
        // setTwitterAuthModalVisible(true);
        console.log(err.message ?? err.toString(), ":::Error");
        throw new Error(err);
      }
    }
  }, [response, redirectUri, request]);

  const [twitterAuthModalVisible, setTwitterAuthModalVisible] = useState(false);

  const checkAndShowTwitterAuthModal = () => {
    // const localUser = getData("@enet-store/user");
    const localTwitterAuthToken = getData("@enet-store/token", true);

    if (!localTwitterAuthToken) {
      // TODO
      setTwitterAuthModalVisible(true);
    }
  };

  return (
    <SafeAreaView
      className="bg-background"
      edges={["right", "bottom", "left"]}
      style={{ flex: 1, backgroundColor: "yellow" }}
    >
      <KeyboardAvoidingView behavior={"position"}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View
            style={{ height: height }}
            className="relative h-screen min-h-screen w-full"
          >
            <View
              // style={{ bottom: bottom + 92 }}
              style={{
                height: 90,
                bottom: 90 - Math.max(bottom, 17),
              }}
              className="absolute left-0 right-0 z-50 flex w-full flex-col items-center justify-center gap-1 bg-white"
            >
              {!userDetail?.mineActive &&
                (userDetail?.redeemableCount ?? 0) <= 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        "Start mining",
                        "Are you sure you want to start mining?",
                        [
                          {
                            text: "Cancel",
                            style: "cancel",
                            onPress: () => {
                              /**/
                            },
                          },
                          {
                            text: "Start",
                            // style: "destructive",
                            onPress: () => {
                              (async () => {
                                // DONE✅: Mining logic
                                await triggerMiner({
                                  userId:
                                    userDetail?._id ??
                                    (params?.userId as Id<"user">),
                                });
                              })().catch((error) => console.log(error));
                            },
                          },
                        ],
                      );
                    }}
                    className="flex flex-row items-center gap-3 rounded-full border border-gray-600 px-4 py-3 shadow-lg drop-shadow-md"
                  >
                    <Text className="font-[nunito]">Start Mining</Text>
                    <Octicons name="database" size={20} color="black" />
                  </TouchableOpacity>
                )}

              {userDetail?.mineActive && userDetail?.redeemableCount >= 0 && (
                <TouchableOpacity className="flex flex-row items-center gap-3 rounded-full border border-gray-600 bg-black px-4 py-3 shadow-lg drop-shadow-md">
                  <Text className="font-[nunito] font-medium text-white">
                    Mining at {userDetail?.miningRate} $FOUND/hr
                  </Text>
                  <Octicons name="database" size={20} color="white" />
                </TouchableOpacity>
              )}

              {!userDetail?.mineActive &&
                (userDetail?.redeemableCount ?? 0) > 0 && (
                  <TouchableOpacity
                    onPress={() => setClaimModalVisible(true)}
                    className="flex flex-row items-center gap-3 rounded-full border border-gray-600 bg-black px-4 py-3 shadow-lg drop-shadow-md"
                  >
                    <Text className="font-[nunito] font-medium text-white">
                      Claim reward $FOUND {userDetail?.redeemableCount}
                    </Text>
                    {/* <Octicons name="database" size={20} color="white" /> */}
                  </TouchableOpacity>
                )}

              <ClaimModal
                isClaimModalVisible={claimModalVisible}
                setClaimModalVisible={setClaimModalVisible}
              >
                {/*<View className="w-full relative items-center justify-center flex-1"> */}

                <LinearGradient
                  colors={["#000000", "#D9D9D9"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={{
                    display: "flex",
                    position: "absolute",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    top: 160,
                    left: 6,
                    right: 6,
                    borderRadius: 10,
                    padding: 8,
                    height: 114,
                  }}
                >
                  <View className="flex h-full w-full flex-col items-center justify-between rounded-md bg-white p-3">
                    <View className="flex w-full flex-row items-center justify-between">
                      <View className="flex flex-row items-center justify-center gap-2">
                        <Image
                          source={require("../../../assets/main/icons/claim-icon.png")}
                          style={{ width: 47, height: 47 }}
                          contentFit="cover"
                        />
                        <View className="flex flex-col items-start justify-center gap-1">
                          <Text className="flex items-center text-lg font-normal text-black">
                            +
                            {(userDetail?.miningRate ?? 0) *
                              (userDetail?.mineHours ?? 0)}{" "}
                            $FOUND/
                            {userDetail?.mineHours}hour
                          </Text>
                          {/* <Text className="font-lighter text-sm text-black">
                            Mined by Auto Bot
                          </Text> */}
                        </View>
                      </View>
                      <TouchableOpacity
                        className="items-center justify-center rounded-xl bg-black px-8 py-3"
                        onPress={async () => {
                          setClaimModalVisible(false);
                          try {
                            await claimReward({
                              userId: params?.userId as Id<"user">,
                            });
                          } catch (e: any) {
                            return Alert.alert(
                              "Claim error",
                              e.message ?? e.toString(),
                            );
                          }
                          Alert.alert(
                            "Claim rewards",
                            "Your reward has been successfuly claimed, you can restart mining at any time",
                          );
                        }}
                      >
                        <Text className="text-white">Claim</Text>
                      </TouchableOpacity>
                    </View>
                    <Text>
                      {
                        [
                          "Boost your Auto Mining Bot to increase your mining time",
                          "Auto Mining will be enabled after one hour of inactivity.",
                          "Boost your Mining Speed to earn more $FOUND per hour",
                        ][Math.floor(Math.random() * 3)]
                      }
                    </Text>
                  </View>
                </LinearGradient>

                {/* </View> */}
              </ClaimModal>
            </View>
            <ScrollView
              className="z-40 min-h-full w-full bg-[#F5F5F5]"
              contentInsetAdjustmentBehavior="always"
              style={{ height: height - top }}
              showsVerticalScrollIndicator={false}
            >
              <Stack.Screen
                options={{
                  headerShown: true,
                  header: () => (
                    <DashboardHeader
                      top={top}
                      modalVisible={modalVisible}
                      setModalVisible={setModalVisible}
                      nickname={
                        userDetail?.nickname ?? (params.nickname as string)
                      }
                    />
                  ),
                }}
              />

              <TouchableOpacity
                activeOpacity={1}
                className="flex h-full w-full flex-col px-[20px] pb-32"
              >
                {/* Modal for referral popup */}
                <LoadingModal
                  isLoadingModalVisible={isReferralPromptModalVisible}
                  setLoadingModalVisible={setReferralPromptModalVisible}
                  tapToClose={false}
                >
                  <View
                    style={{
                      position: "absolute",
                      top: 180,
                      left: 6,
                      right: 6,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      justifyContent: "center",
                      backgroundColor: "white",
                      minHeight: 200,
                      borderRadius: 20,
                      gap: 10,
                      padding: 24,
                    }}
                  >
                    <View>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "700",
                          fontFamily: "nunito",
                          color: "black",
                          textAlign: "left",
                        }}
                      >
                        Enter referral code
                      </Text>

                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "500",
                          fontFamily: "nunito",
                          color: "black",
                          textAlign: "left",
                        }}
                      >
                        If you where referred by someone, enter their referral
                        code to get 1000XP points
                      </Text>
                    </View>

                    <Input
                      placeholder="Referral code"
                      style={{
                        width: "100%",
                        height: 42,
                        backgroundColor: "#EBEBEB",
                        borderRadius: 8,
                        paddingHorizontal: 12,
                      }}
                      onChangeText={(text: string) => {
                        setReferreeCode(text);
                      }}
                    />

                    <View
                      style={{
                        flexDirection: "row",
                        width: "100%",
                        gap: 4,
                        display: "flex",
                      }}
                    >
                      <TouchableOpacity
                        style={{
                          // width: "100%",
                          flex: 1,
                          backgroundColor: "transparent",
                          borderWidth: 1,
                          borderColor: "black",
                          borderRadius: 8,
                          padding: 12,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onPress={() => {
                          removeData("@enet-store/token");
                          storeData("@enet-store/referralPromptShown", true);
                          setReferralPromptModalVisible(false);
                          checkAndShowTwitterAuthModal();
                        }}
                      >
                        <Text
                          style={{
                            color: "black",
                            fontSize: 14,
                            fontWeight: "700",
                          }}
                        >
                          Cancel
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          // width: "100%",
                          flex: 1,
                          backgroundColor: "black",
                          borderRadius: 8,
                          padding: 12,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onPress={async () => {
                          try {
                            await redeemReferral({
                              referreeCode: referreeCode!,
                              nickname:
                                userDetail?.nickname ??
                                (params?.nickname as string),
                              userId:
                                (params?.userId as Id<"user">) ??
                                userDetail?._id,
                            });

                            storeData("@enet-store/referralPromptShown", true);
                            setReferralPromptModalVisible(false);
                            checkAndShowTwitterAuthModal();
                          } catch (error: any) {
                            const errorMessage =
                              error instanceof ConvexError
                                ? (error.data as { message: string }).message
                                : "Unexpected error occurred";
                            storeData("@enet-store/referralPromptShown", true);
                            setReferralPromptModalVisible(false);
                            return Alert.alert(errorMessage);
                          }
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontSize: 14,
                            fontWeight: "700",
                          }}
                        >
                          Submit
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </LoadingModal>

                {/* Twitter auth modal */}
                <LoadingModal
                  isLoadingModalVisible={twitterAuthModalVisible}
                  setLoadingModalVisible={setTwitterAuthModalVisible}
                  tapToClose={false}
                >
                  <View
                    style={{
                      position: "absolute",
                      top: 180,
                      left: 6,
                      right: 6,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      justifyContent: "center",
                      backgroundColor: "white",
                      minHeight: 200,
                      borderRadius: 20,
                      gap: 10,
                      padding: 24,
                    }}
                  >
                    <View>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "700",
                          fontFamily: "nunito",
                          color: "black",
                          textAlign: "left",
                        }}
                      >
                        Add twitter account
                      </Text>

                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "500",
                          fontFamily: "nunito",
                          color: "black",
                          textAlign: "left",
                        }}
                      >
                        Authenticate your twitter account to get full access to
                        app feaatures
                      </Text>
                    </View>

                    <TouchableOpacity
                      disabled={!request}
                      style={{ gap: 10 }}
                      className="flex w-full flex-row items-center justify-center gap-3 overflow-hidden rounded-lg bg-black p-4 text-center font-[nunito] text-lg font-normal text-white transition-colors"
                      onPress={async (e) => {
                        e.preventDefault();

                        console.log("Twitter button", redirectUri);

                        await promptAsync({
                          dismissButtonStyle: "close",
                        });
                      }}
                    >
                      <Text className="mr-2 text-white">Authenticate with</Text>
                      <FontAwesome6 name="x-twitter" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                </LoadingModal>

                <StatsCard
                  minedCount={userDetail?.minedCount ?? 0}
                  miningRate={userDetail?.miningRate ?? 0}
                  xpEarned={userDetail?.xpCount ?? 0}
                  redeemableCount={userDetail?.redeemableCount ?? 0}
                  userDetail={userDetail}
                />

                {
                  /* Conditional render ad image  */
                  adConfig && (
                    <TouchableOpacity
                      onPress={async () => {
                        await WebBrowser.openBrowserAsync(adConfig.link);
                      }}
                      style={{
                        position: "relative",
                        marginVertical: 14,
                        backgroundColor: adConfig?.color,
                        borderRadius: 8,
                      }}
                    >
                      <Text
                        style={{
                          position: "absolute",
                          top: 20,
                          left: 20,
                          color: "black",
                          backgroundColor: "white",
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          borderRadius: 8,
                          zIndex: 30,
                          fontSize: 13,
                          fontWeight: "700",
                        }}
                      >
                        Ad
                      </Text>
                      <Image
                        source={{
                          uri: adConfig.adUrl!,
                        }}
                        style={{
                          // width: "100%",
                          borderRadius: 18,
                          // flex: 1,
                          aspectRatio: 16 / 9,
                        }}
                        contentFit="contain"
                      />
                    </TouchableOpacity>
                  )
                }

                <View
                  style={{ marginTop: 17 }}
                  className="flex w-full flex-col gap-2"
                >
                  <Text
                    style={{ fontSize: 16, fontWeight: "600" }}
                    className="font-[nunito]"
                  >
                    Overview
                  </Text>
                  <Overview
                    totalUsers={userDetail?.referralXp ?? 0}
                    referrals={userDetail?.referralCount ?? 0}
                    referralCode={userDetail?.referralCode ?? "REFCOD"}
                    globalRank={userDetail?.globalRank ?? 1000}
                  />
                </View>

                <TouchableOpacity
                  onPress={() =>
                    router.push({ pathname: "/(main)/referral", params })
                  }
                  style={{ marginTop: 37 }}
                  className="flex w-full flex-row items-center justify-start gap-4 rounded-xl border border-dashed border-[#B3B2B2]/50 bg-[#EBEBEB] p-4"
                >
                  <Image
                    source={require("../../../assets/main/invite.png")}
                    style={{ width: 50, height: 50 }}
                    alt="Referre"
                  />
                  <View className="flex flex-1 flex-col items-start justify-center gap-1">
                    <Text
                      style={{ fontSize: 15, fontWeight: "400" }}
                      className="font-[nunito] text-black"
                    >
                      Invite Friends
                    </Text>
                    <Text
                      style={{ fontSize: 13, fontWeight: "400" }}
                      className="text-light text-wrap font-[nunito] text-[10.5px] text-[#989898]"
                    >
                      The more users you refer, the more $FOUND you earn
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Task and boosts */}
                <View style={{ marginTop: 36 }} className="w-full flex-1">
                  <TaskBoostCard
                    // eventSheetRef={eventSheetRef}
                    onEventPressed={(eventIndex: number) => {
                      console.log(eventIndex, ":::events index");
                      setEventSheetContent((fetchEvents ?? [])[eventIndex]);
                      // @ts-expect-error eventsheet open
                      eventSheetRef.current.open();
                    }}
                    completedTasks={userDetail?.completedTasks}
                    eventsJoined={userDetail?.eventsJoined}
                    onTaskPressed={async (task: Doc<"tasks">) => {
                      if (!task) {
                        Alert.alert("No task found");
                        return;
                      }

                      if (
                        task?.action.channel !== "twitter" &&
                        task?.action.type !== "post"
                      ) {
                        // Handle all other channel and actions

                        await WebBrowser.openBrowserAsync(
                          task?.action.link ?? "",
                        )
                          .then((result: any) => {
                            console.log(
                              result,
                              ":::Task_come back result - follow",
                            );
                          })
                          .catch((err) => {
                            console.log(err, ":::Error occurred in task");
                            Alert.alert(
                              "An error occurred trying to finish task",
                            );
                          });

                        await delay(3.5); // induce a 4 secs delay

                        await rewardTaskXpCount({
                          userId: params.userId as Id<"user">,
                          taskId: task?._id,
                          xpCount: task?.reward,
                        });
                        setTaskSheetContent(undefined);
                      } else if (
                        task?.action.channel === "twitter" &&
                        task?.action.type === "follow"
                      ) {
                        try {
                          // Call twitter follow API handler
                          // console.log("Handle follow API");
                          // setLoadingModalVisible(true); // Set loader

                          // const token = getData(
                          //   "@enet-store/token",
                          //   true,
                          // ) as Record<string, any>; // Get token

                          // console.log(token, ":::token");

                          // // Do a lookup of the account name to get an Id
                          // const accountData = await Twitter.userLookup({
                          //   token: token.access,
                          //   userName: task.action.link,
                          // });

                          // if (accountData?.data) {
                          //   console.log(accountData, "User name is found");
                          // }

                          // const followData = await Twitter.follow({
                          //   token: token?.access,
                          //   profileId: accountData?.data?.id,
                          // });

                          await WebBrowser.openBrowserAsync(
                            task?.action.link ?? "",
                          )
                            .then((result) => {
                              console.log(
                                result,
                                ":::Task_come back result - post",
                              );

                              return result;
                            })
                            .catch((err) => {
                              console.log(err, ":::Error occurred in task");
                              Alert.alert(
                                "An error occurred trying to finish task",
                              );
                            });

                          await delay(3.5); // induce a 4 secs delay

                          await rewardTaskXpCount({
                            userId: params.userId as Id<"user">,
                            taskId: task?._id,
                            xpCount: task?.reward,
                          });

                          setTaskSheetContent(undefined);

                          // console.log(followData, ":::data from follow");

                          // await rewardTaskXpCount({
                          //   userId: params.userId as Id<"user">,
                          //   taskId: task?._id,
                          //   xpCount: task?.reward,
                          // });
                          // setLoadingModalVisible(false);
                        } catch (err: any) {
                          console.log(err, ":::Error following account");
                          Alert.alert(
                            "Task error",
                            "An error occurred trying to follow account",
                          );
                        }
                      } else {
                        // setTaskSheetContent(task);
                        // @ts-expect-error eventsheet open
                        // taskSheetRef.current.open();

                        await WebBrowser.openBrowserAsync(
                          task?.action.link ?? "",
                        )
                          .then((result) => {
                            console.log(
                              result,
                              ":::Task_come back result - normal",
                            );
                          })
                          .catch((err) => {
                            console.log(err, ":::Error occurred in task");
                            Alert.alert(
                              "An error occurred trying to finish task",
                            );
                          });

                        await delay(3.5); // induce a 4 secs delay

                        await rewardTaskXpCount({
                          userId: params.userId as Id<"user">,
                          taskId: task?._id,
                          xpCount: task?.reward,
                        });

                        setTaskSheetContent(undefined);
                      }
                    }}
                    onBoostPressed={async (boost: any) => {
                      // console.log(boost, ":::selected boosts!");
                      // TODO: activate boost
                      setBoostLoadingModalVisible(true);
                      try {
                        await activateBoost({
                          userId: params?.userId as Id<"user">,
                          boost: {
                            ...boost,
                          },
                        });
                        setBoostLoadingModalVisible(false);
                      } catch (error: any) {
                        setBoostLoadingModalVisible(false);
                        console.log(
                          error,
                          ":::Convex Error",
                          error instanceof ConvexError,
                        );

                        const errorMessage =
                          // Check whether the error is an application error
                          error instanceof ConvexError
                            ? // Access data and cast it to the type we expect
                              (error.data as { message: string }).message
                            : // Must be some developer error,
                              // and prod deployments will not
                              // reveal any more information about it
                              // to the client
                              "Unexpected error occurred";
                        return Alert.alert(errorMessage);
                      }
                    }}
                    events={fetchEvents}
                  />
                  <LoadingModal
                    isLoadingModalVisible={isLoadingModalVisible}
                    setLoadingModalVisible={setLoadingModalVisible}
                  >
                    <View
                      style={{
                        position: "absolute",
                        top: 180,
                        left: 6,
                        right: 6,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "white",
                        minHeight: 200,
                        borderRadius: 20,
                        gap: 10,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "700",
                          fontFamily: "nunito",
                          color: "black",
                        }}
                      >
                        Finishing task...
                      </Text>
                      <ActivityIndicator size={"large"} color={"black"} />
                    </View>
                  </LoadingModal>
                  <LoadingModal
                    isLoadingModalVisible={isBoostLoadingVisible}
                    setLoadingModalVisible={setBoostLoadingModalVisible}
                  >
                    <View
                      style={{
                        position: "absolute",
                        top: 180,
                        left: 6,
                        right: 6,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "white",
                        minHeight: 200,
                        borderRadius: 20,
                        gap: 10,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "700",
                          fontFamily: "nunito",
                          color: "black",
                        }}
                      >
                        Activating Boost
                      </Text>
                      <ActivityIndicator size={"large"} color={"black"} />
                    </View>
                  </LoadingModal>
                  <LoadingModal
                    isLoadingModalVisible={isTwitterAuthLoading}
                    setLoadingModalVisible={setTwitterAuthLoading}
                  >
                    <View className="flex w-full flex-col items-center justify-center p-4">
                      <ActivityIndicator size={"large"} color={"black"} />
                      <Text>Authorizing your twitter account...</Text>
                    </View>
                  </LoadingModal>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      <BottomSheet
        ref={eventSheetRef}
        height="90%"
        style={{ backgroundColor: "#FFFFFF", zIndex: 50 }}
      >
        <View
          style={{ height: "100%", width: "100%" }}
          className="flex h-full w-full flex-col items-center gap-4 rounded-lg px-4"
        >
          {/* <Text>{eventSheetContent && eventSheetContent.title}</Text> */}
          <View className="flex w-full flex-row items-center justify-center gap-4">
            {/* <View className="rounded-lg bg-gray-700/30 p-2"> */}
            <Image
              source={{ uri: eventSheetContent?.company?.logoUrl }}
              style={{
                width: 45,
                height: 45,
                borderRadius: 8,
                padding: 6,
                backgroundColor: "#EBEBEB",
              }}
              contentFit="cover"
            />
            {/* </View> */}
            <View className="flex flex-col items-start justify-center gap-2 ">
              <Text
                style={{ fontSize: 16, fontWeight: "500" }}
                className="font-[nunito] text-lg font-bold text-black"
              >
                {eventSheetContent?.title}
              </Text>
              <Text
                style={{ color: "#989898", fontSize: 12, fontWeight: "600" }}
                className="font-[nunito]"
              >
                Reward:
                {// @ts-expect-error eventsheet open
                eventSheetContent?.reward.toLocaleString("en-US")}{" "}
                XP
              </Text>
            </View>
          </View>
          <ScrollView
            nestedScrollEnabled
            indicatorStyle="default"
            style={{ width: "100%" }}
          >
            <View
              style={{
                flex: 1,
                width: "100%",
                paddingHorizontal: 4,
                marginTop: 15,
              }}
            >
              {eventSheetContent &&
                eventSheetContent?.actions?.map((action, index) => (
                  <TouchableOpacity
                    onPress={async () => {
                      try {
                        // Check if completed
                        if (
                          userDetail?.eventsJoined
                            ?.find(
                              (joined) =>
                                joined.eventId === eventSheetContent._id,
                            )
                            ?.actions.some(
                              (act) =>
                                act.completed && act.name === action.name,
                            )
                        ) {
                          return Alert.alert("Event action has been completed");
                        }
                        // router.push({ pathname: task.link, params });
                        // OPen with Webbrowser and update event action after
                        await WebBrowser.openBrowserAsync(action.link);
                        await delay(3.5); // induce a 4 secs delay
                        await updateEventAction({
                          userId:
                            (params?.userId as Id<"user">) ?? userDetail?._id,
                          eventId: eventSheetContent?._id as Id<"events">,
                          actionName: action?.name,
                        });
                      } catch (err: any) {
                        console.log(err, ":::Error updating action");
                        Alert.alert(
                          "Action error",
                          "There was an error performing that action",
                        );
                      }
                    }}
                    key={index}
                    style={{
                      marginBottom: 43,
                      width: "100%",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 16,
                      display: "flex",
                    }}
                  >
                    <View className="rounded-xl bg-[#EBEBEB] p-4">
                      {icons[action?.channel]}
                    </View>
                    <View className="flex flex-col items-start justify-center gap-2">
                      <Text className="font-[nunito] text-lg">
                        {action?.name}
                      </Text>
                      {/* <Text className=" font-[nunito]">
                  +{action?.reward.toLocaleString("en-US")} XP
                </Text> */}
                    </View>
                    <View className="flex-1" />
                    {userDetail?.eventsJoined
                      ?.find(
                        (joined) => joined.eventId === eventSheetContent._id,
                      )
                      ?.actions.some(
                        (act) => act.completed && act.name === action.name,
                      ) ? (
                      <FontAwesome
                        name="check-circle"
                        size={24}
                        color="black"
                      />
                    ) : (
                      <MaterialIcons
                        name="keyboard-arrow-right"
                        size={24}
                        color="black"
                      />
                    )}
                  </TouchableOpacity>
                ))}
            </View>
          </ScrollView>
          <View style={{ marginBottom: 52 }} className="w-full">
            <TouchableOpacity
              onPress={async () => {
                try {
                  if (
                    userDetail?.eventsJoined?.find(
                      (joined) => joined.eventId === eventSheetContent?._id,
                    )?.completed
                  ) {
                    Alert.alert("Already claimed", "", [
                      {
                        onPress: () => {
                          /**/
                        },
                        style: "cancel",
                      },
                    ]);
                    // @ts-expect-error eventsheet close
                    eventSheetRef.current.close();
                  } else {
                    if (
                      userDetail?.eventsJoined
                        ?.find(
                          (joined) => joined.eventId === eventSheetContent?._id,
                        )
                        ?.actions.some((act) => !act.completed)
                    ) {
                      Alert.alert(
                        "Actions not completed!",
                        "You must complete all actions before claiming reward",
                      );
                      return;
                    }

                    await rewardEventXpCount({
                      userId: (params?.userId as Id<"user">) ?? userDetail?._id,
                      eventId: eventSheetContent?._id as Id<"events">,
                      xpCount: eventSheetContent?.reward ?? 0,
                    });

                    // @ts-expect-error eventsheet close
                    eventSheetRef.current.close();

                    // Push to congrats screen
                    router.push({
                      pathname: "/congrats",
                      params: { ...params, xpCount: eventSheetContent?.reward },
                    });
                  }
                } catch (err: any) {
                  console.log(err, "::::error claiming event reward");
                  Alert.alert(
                    "Claim reward error",
                    "An error occurred while claiming reward",
                  );
                }
              }}
              disabled={
                userDetail?.eventsJoined?.find(
                  (joined) => joined.eventId === eventSheetContent?._id,
                )?.completed ?? true
              }
              style={[
                {
                  backgroundColor: "black",
                  width: "100%",
                  height: 57,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 9,
                },
                userDetail?.eventsJoined?.find(
                  (joined) => joined.eventId === eventSheetContent?._id,
                )?.completed && { opacity: 0.5 },
              ]}
            >
              <Text style={{ color: "white", fontSize: 15, fontWeight: "500" }}>
                Claim Reward
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheet>
      {/* Tasks sheet */}
      <BottomSheet
        ref={taskSheetRef}
        height="90%"
        style={{ backgroundColor: "#DADADA", zIndex: 50 }}
      >
        <TaskRenderer
          task={taskSheetContent!}
          // @ts-expect-error eventsheet open
          onCloseEvent={() => taskSheetRef.current.close()}
          renderView={({ task, embedData }) => {
            return (
              <View className="flex h-full w-full flex-col gap-4">
                <View className="mt-3 flex w-full flex-1 overflow-hidden rounded-2xl">
                  <WebView
                    originWhitelist={["*"]}
                    scalesPageToFit={false}
                    source={{ html: embedData?.html ?? "" }}
                  />
                </View>
                <View className="flex flex-col gap-0">
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      fontFamily: "nunito",
                    }}
                    className="font-[nunito]"
                  >
                    Instructions
                  </Text>
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      gap: 5,
                      width: "100%",
                    }}
                  >
                    <Text style={{ fontSize: 24 }}>{"\u2022"}</Text>
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "400",
                        fontFamily: "nunito",
                      }}
                      className="font-[nunito]"
                    >
                      Press the LIKE & REPOST button to automatically LIKE &
                      REPOST without redirecting you.
                    </Text>
                  </View>
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      gap: 5,
                      width: "100%",
                    }}
                  >
                    <Text style={{ fontSize: 24 }}>{"\u2022"}</Text>
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "400",
                        fontFamily: "nunito",
                      }}
                      className="font-[nunito]"
                    >
                      Press the Proceed button to verify{" "}
                    </Text>
                  </View>
                </View>
                <View className="flex w-full flex-col gap-2">
                  <View className="flex w-full flex-row gap-2">
                    <View className="flex-1">
                      <TouchableOpacity
                        onPress={() => {
                          // Mark
                          // Alert.alert("Liking post....");
                        }}
                        style={{
                          backgroundColor: "black",
                          paddingVertical: 10,
                          borderRadius: 5,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text style={{ color: "white" }}>LIKE</Text>
                      </TouchableOpacity>
                    </View>

                    <View className="flex-1">
                      <TouchableOpacity
                        onPress={() => {
                          // Mark
                        }}
                        style={{
                          backgroundColor: "black",
                          paddingVertical: 10,
                          borderRadius: 5,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text style={{ color: "white" }}>REPOST</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      // Mark
                      // @ts-expect-error eventsheet close
                      taskSheetRef.current.close();
                    }}
                    style={{
                      backgroundColor: "black",
                      paddingVertical: 10,
                      borderRadius: 5,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: "white" }}>PROCEED</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      </BottomSheet>
    </SafeAreaView>
  );
}
