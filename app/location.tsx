import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import { useEffect, useState } from "react";

export default function LocationPage() {
  const [location, setLocation] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    (async () => {
      // Minta izin lokasi
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Izin lokasi ditolak");
        return;
      }

      // Ambil lokasi realtime
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000, // update per detik
          distanceInterval: 1, // update setiap 1 meter
        },
        (loc) => {
          setLocation(loc);
        }
      );
    })();
  }, []);

  let text = "Mencari lokasi...";
  if (errorMsg) text = errorMsg;
  else if (location) {
    text = `Latitude: ${location.coords.latitude}\nLongitude: ${location.coords.longitude}`;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Realtime Location</Text>

      {!location ? (
        <ActivityIndicator size="large" color="#0056D2" style={{ marginTop: 20 }} />
      ) : (
        <View style={styles.box}>
          <Text style={styles.info}>{text}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 70,
    backgroundColor: "#F7F9FC",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0056D2",
  },
  box: {
    marginTop: 30,
    backgroundColor: "#fff",
    padding: 20,
    width: "85%",
    borderRadius: 12,
    elevation: 4,
  },
  info: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
});
