import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";

export default function Cuaca() {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiURL = "https://goweather.herokuapp.com/weather/bandung";

    // 🔹 Jika Web, gunakan proxy agar tidak CORS error
    const url =
      Platform.OS === "web"
        ? `https://api.allorigins.win/raw?url=${encodeURIComponent(apiURL)}`
        : apiURL;

    fetch(url)
      .then((res) => res.text())
      .then((text) => {
        const json = JSON.parse(text);
        console.log("🌦️ Data Cuaca:", json);
        setWeather(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error fetch cuaca:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0056D2" />
        <Text style={{ marginTop: 10 }}>Mengambil data cuaca...</Text>
      </View>
    );
  }

  if (!weather) {
    return (
      <View style={styles.center}>
        <Text>Tidak bisa memuat data cuaca 😢</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌤️ Cuaca Kabupaten Bandung</Text>
      <View style={styles.card}>
        <Text style={styles.info}>Temperatur: {weather.temperature}</Text>
        <Text style={styles.info}>Angin: {weather.wind}</Text>
        <Text style={styles.info}>Deskripsi: {weather.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 15, color: "#0056D2" },
  card: {
    backgroundColor: "#e6faff",
    padding: 20,
    borderRadius: 12,
    width: "80%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#c6eef5",
  },
  info: { fontSize: 16, marginVertical: 5, color: "#333" },
});
