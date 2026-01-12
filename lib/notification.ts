import * as Notifications from "expo-notifications";
import { Platform, Alert } from "react-native";

export async function sendNotification(
  title: string,
  body: string
) {
  // 🌐 JIKA WEB
  if (Platform.OS === "web") {
    Alert.alert(title, body);
    return;
  }

  // 📱 ANDROID / IOS
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: null,
  });
}
