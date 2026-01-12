import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";

interface Mahasiswa {
  id: string;
  nim: string;
  nama: string;
  kelas: string;
  points: string;
}

export default function Mhs() {
  const [data, setData] = useState<Mahasiswa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiURL = "https://mmc-clinic.com/dipa/api/mhs.php";

    // ✅ FIXED: gunakan backtick untuk template literal
    const url =
      Platform.OS === "web"
        ? `https://api.allorigins.win/raw?url=${encodeURIComponent(apiURL)}`
        : apiURL;

    fetch(url)
      .then((res) => res.text()) // Ambil dulu sebagai teks
      .then((text) => {
        const json = JSON.parse(text);
        console.log("📦 API DATA =>", json);

        if (json?.data) {
          setData(json.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log("❌ Fetch Error: ", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0056D2" />
        <Text style={{ marginTop: 10 }}>Mengambil data...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 15, marginTop: Platform.OS === "web" ? 10 : 0 }}>
      <Text style={styles.title}>📋 Data Mahasiswa</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.nama}</Text>
            <Text>NIM: {item.nim}</Text>
            <Text>Kelas: {item.kelas}</Text>
            <Text>Points: {item.points}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10, color: "#0056D2" },
  card: {
    backgroundColor: "#E6F0FF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#B3D4FF",
  },
  name: { fontSize: 16, fontWeight: "bold", color: "#003366" },
});
