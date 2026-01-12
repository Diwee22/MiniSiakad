import { 
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

interface Mahasiswa {
  nama: string;
  nim: string;
  prodi: string;
}

export default function Index() {
  const router = useRouter();
  const [showKHS, setShowKHS] = useState(false);
  const [dataKHS, setDataKHS] = useState<Mahasiswa[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 DARK MODE
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const apiURL = "https://mmc-clinic.com/dipa/api/mhs.php";

    const url =
      Platform.OS === "web"
        ? `https://api.allorigins.win/raw?url=${encodeURIComponent(apiURL)}`
        : apiURL;

    fetch(url)
      .then((response) => response.text())
      .then((text) => {
        const json = JSON.parse(text);
        if (json?.data) setDataKHS(json.data);
        else if (Array.isArray(json)) setDataKHS(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const theme = darkMode ? darkStyles : lightStyles; // pilih style

  return (
    <View style={[styles.container, theme.container]}>

      {/* Header */}
      <View style={styles.topSection}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
        />

        <Text style={[styles.title, theme.title]}>Selamat Datang</Text>
        <Text style={[styles.subtitle, theme.subtitle]}>
          Sistem Informasi Akademik Mahasiswa
        </Text>

        {/* 🔥 BUTTON MODE DARK/LIGHT */}
        <TouchableOpacity onPress={() => setDarkMode(!darkMode)} style={theme.modeButton}>
          <Ionicons
            name={darkMode ? "sunny-outline" : "moon-outline"}
            size={26}
            color={darkMode ? "#FFD369" : "#222"}
          />
        </TouchableOpacity>
      </View>

      {/* Menu Grid */}
      <View style={styles.iconGrid}>

        <TouchableOpacity style={[styles.iconCard, theme.card]} onPress={() => setShowKHS(true)}>
          <Ionicons name="book-outline" size={34} color="#0056D2" />
          <Text style={[styles.iconText, theme.text]}>KHS</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.iconCard, theme.card]} onPress={() => router.push("/kampus")}>
          <Ionicons name="school-outline" size={34} color="#0056D2" />
          <Text style={[styles.iconText, theme.text]}>Kampus</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.iconCard, theme.card]} onPress={() => router.push("/profil")}>
          <MaterialCommunityIcons name="account-outline" size={34} color="#0056D2" />
          <Text style={[styles.iconText, theme.text]}>Profil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.iconCard, theme.card]} onPress={() => router.push("/mhs")}>
          <Ionicons name="people-outline" size={34} color="#0056D2" />
          <Text style={[styles.iconText, theme.text]}>Mahasiswa</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.iconCard, theme.card]} onPress={() => router.push("/cuaca")}>
          <Ionicons name="cloud-outline" size={34} color="#0056D2" />
          <Text style={[styles.iconText, theme.text]}>Cuaca</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.iconCard, theme.card]} onPress={() => router.push("/camera")}>
          <Ionicons name="camera-outline" size={34} color="#0056D2" />
          <Text style={[styles.iconText, theme.text]}>Kamera</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.iconCard, theme.card]} onPress={() => router.push("/location")}>
          <Ionicons name="location-outline" size={34} color="#0056D2" />
          <Text style={[styles.iconText, theme.text]}>Lokasi</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.iconCard, theme.card]} onPress={() => router.push("/files")}>
          <Ionicons name="folder-outline" size={34} color="#0056D2" />
          <Text style={[styles.iconText, theme.text]}>Storage</Text>
        </TouchableOpacity>

      </View>

      {/* Login */}
      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.button} onPress={() => router.push("/login")}>
          <Ionicons name="log-in-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>Masuk</Text>
        </TouchableOpacity>
        <Text style={[styles.footerText, theme.subtitle]}>© 2025 Created by Aldi Denaldi</Text>
      </View>

      {/* Modal KHS */}
      <Modal visible={showKHS} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, theme.card]}>
            <Text style={[styles.modalTitle, theme.title]}>Data Mahasiswa (via API)</Text>

            {loading ? (
              <ActivityIndicator size="large" color="#0056D2" />
            ) : dataKHS.length === 0 ? (
              <Text style={{ textAlign: "center", color: "#999" }}>
                Tidak ada data mahasiswa
              </Text>
            ) : (
              <ScrollView>
                {dataKHS.map((item, index) => (
                  <View key={index} style={[styles.khsRow, theme.card2]}>
                    <Text style={[styles.khsText, theme.text]}>Nama: {item.nama}</Text>
                    <Text style={[styles.khsText, theme.text]}>NIM: {item.nim}</Text>
                    <Text style={[styles.khsText, theme.text]}>Prodi: {item.prodi}</Text>
                  </View>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity style={styles.closeButton} onPress={() => setShowKHS(false)}>
              <Text style={styles.closeText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

/* ------------------- BASE STYLE ------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 },
  topSection: { alignItems: "center", marginBottom: 30 },
  logo: { width: 100, height: 100, resizeMode: "contain", marginBottom: 15 },

  title: { fontSize: 22, fontWeight: "bold" },
  subtitle: { fontSize: 14 },

  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: 10,
  },

  iconCard: {
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 12,
    margin: 10,
    width: 110,
    elevation: 2,
  },

  iconText: { fontSize: 14, marginTop: 5 },

  bottomSection: { alignItems: "center", marginTop: 30 },
  button: {
    flexDirection: "row",
    backgroundColor: "#0056D2",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  footerText: { marginTop: 15, fontSize: 12 },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalContent: {
    margin: 20,
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },

  khsRow: {
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
  },

  khsText: {},
  closeButton: {
    marginTop: 15,
    backgroundColor: "#0056D2",
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});

/* ------------------- LIGHT MODE ------------------- */
const lightStyles = {
  container: { backgroundColor: "#F7F9FC" },
  title: { color: "#0056D2" },
  subtitle: { color: "#777" },
  text: { color: "#333" },
  card: { backgroundColor: "#fff", shadowColor: "#000", shadowOpacity: 0.1 },
  card2: { backgroundColor: "#f1f4f9" },
  modeButton: {
    marginTop: 10,
    padding: 6,
    backgroundColor: "#eaeaea",
    borderRadius: 50,
  },
};

/* ------------------- DARK MODE ------------------- */
const darkStyles = {
  container: { backgroundColor: "#0D0D0D" },
  title: { color: "#4C9BFF" },
  subtitle: { color: "#bbb" },
  text: { color: "#eee" },
  card: { backgroundColor: "#1a1a1a", shadowColor: "#000" },
  card2: { backgroundColor: "#222" },
  modeButton: {
    marginTop: 10,
    padding: 6,
    backgroundColor: "#333",
    borderRadius: 50,
  },
};
