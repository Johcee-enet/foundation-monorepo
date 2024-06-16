import type { FC } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Image, ImageBackground } from "expo-image";
import { Feather } from "@expo/vector-icons";

// import LinearGradient from "react-native-linear-gradient";

interface IOverviewProps {
  referrals: number;
  totalUsers: number;
  globalRank: number;
  referralCode: string;
}
export const Overview: FC<IOverviewProps> = ({
  referrals,
  totalUsers,
  globalRank,
  referralCode,
}) => {
  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(referralCode);
  };

  return (
    <View
      style={{
        height: 134,
        overflow: "hidden",
        borderRadius: 10,
        backgroundColor: "transparent",
      }}
    >
      <ImageBackground
        source={require("../../assets/main/overview-bg.png")}
        style={{ justifyContent: "center" }}
      >
        {/* States design */}
        <View className="flex h-full w-full flex-col items-start justify-between p-4">
          <View className="flex w-full flex-row items-center justify-between">
            {/* <View className="rounded-lg bg-slate-300/30 p-2"> */}
            {/* <Ionicons name="trophy-outline" size={14} color="white" /> */}
            <Image
              source={require("../../assets/main/icons/overview_trophy.png")}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
            {/* </View> */}

            <View className="flex flex-row items-center justify-center gap-2">
              {/* <FontAwesome5 name="users" size={14} color="#ABABAB" /> */}
              {/* <Image
                source={require("../../assets/main/icons/overview_users.png")}
                style={{ width: 17, height: 11 }}
                resizeMode="contain"
              />
              <Text
                style={{ fontSize: 16, fontWeight: "700" }}
                className="font-[nunito] text-[#ABABAB]"
              >
                {totalUsers.toLocaleString("en-US")}
              </Text> */}
            </View>
          </View>
          <View className="flex w-full flex-row items-center justify-start gap-20 px-8">
            <View className="flex flex-col items-start justify-center gap-2">
              <Text
                style={{ fontSize: 13 }}
                className="font-[nunito] text-[13px] font-light text-[#ABABAB]"
              >
                Referrals
              </Text>
              <Text
                style={{ fontWeight: "700", fontSize: 21 }}
                className="font-[nunito] text-[21px] font-semibold text-white"
              >
                {referrals.toLocaleString("en-US")}
              </Text>
            </View>
            <View className="flex flex-col items-start justify-center gap-2">
              <Text
                style={{ fontSize: 13 }}
                className="font-[nunito] font-light text-[#ABABAB]"
              >
                Global Rank
              </Text>
              <Text
                style={{ fontWeight: "700", fontSize: 21 }}
                className="font-[nunito] font-semibold text-white"
              >
                {globalRank.toLocaleString("en-US")}
              </Text>
            </View>
          </View>

          <View className="flex w-full flex-row items-center justify-start gap-6 px-8">
            <Text className="font-[nunito] text-[11px] font-light text-white">
              Referral Code: {referralCode}
            </Text>

            <TouchableOpacity
              onPress={() => {
                copyToClipboard().catch((error) =>
                  console.log(error, ":::Error"),
                );
                Alert.alert("Link copied");
              }}
            >
              <Feather name="copy" size={15} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

// interface IGradientBackgroundProps {
//   children: ReactNode
// }
// const GradientBackground: FC<IGradientBackgroundProps> = ({ children }) => {

//   return (
//     <LinearGradient colors={['#000000', '#000000', '#D9D9D9']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}>
//       {children}
//     </LinearGradient>
//   )
// }
