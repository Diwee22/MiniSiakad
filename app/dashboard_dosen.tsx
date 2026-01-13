import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function DashboardDosen() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [nidn, setNidn] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      try {
        const docRef = doc(db, "dosens", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setNama(data.nama || "");
          setNidn(data.nidn || "");
        }
      } catch (error) {
        console.error("Gagal ambil data dosen:", error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0056D2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 🔹 SIDEBAR */}
      <View style={styles.sidebar}>
        <Text style={styles.sidebarTitle}>Menu Dosen</Text>

        <TouchableOpacity style={styles.menuItemActive}>
          <Ionicons name="home-outline" size={22} color="#fff" />
          <Text style={styles.menuTextActive}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/tugas-dosen")}
        >
          <Ionicons name="list-outline" size={22} color="#ecf0f1" />
          <Text style={styles.menuText}>Kelola Tugas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/nilai")}
        >
          <Ionicons name="create-outline" size={22} color="#ecf0f1" />
          <Text style={styles.menuText}>Input Nilai</Text>
        </TouchableOpacity>
        

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.replace("/login")}
        >
          <MaterialIcons name="logout" size={22} color="#ecf0f1" />
          <Text style={styles.menuText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 KONTEN UTAMA */}
      <View style={styles.main}>
        <View style={styles.headerBox}>
          <Image
            source={require("../assets/images/aldi.jpg")}
            style={styles.profileImage}
          />
          <View>
            <Text style={styles.nama}>{nama || "Dosen Pengampu"}</Text>
            <Text style={styles.nim}>NIDN: {nidn || "0012345678"}</Text>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Informasi Dosen</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <FontAwesome5 name="university" size={16} color="#0056D2" />
              <Text style={styles.infoText}>Fakultas: Ilmu Komputer</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="school-outline" size={16} color="#0056D2" />
              <Text style={styles.infoText}>Prodi: Sistem Informasi</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="briefcase-outline" size={16} color="#0056D2" />
              <Text style={styles.infoText}>Jabatan: Dosen Tetap</Text>
            </View>
          </View>
        </View>

        {/* 🔹 BUTTON */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/tugas-dosen")}
        >
          <Ionicons name="list-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Kelola Tugas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#00A8FF" }]}
          onPress={() => router.push("/nilai")}
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Input Nilai</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>© 2025 Aldi Denaldi</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, flexDirection: "row", backgroundColor: "#f8f9fa" },

  sidebar: {
    width: 220,
    backgroundColor: "#0056D2",
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  sidebarTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 30,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },
  menuItemActive: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
    backgroundColor: "#0040A1",
    padding: 8,
    borderRadius: 8,
  },
  menuText: { color: "#ecf0f1", fontSize: 16 },
  menuTextActive: { color: "#fff", fontSize: 16, fontWeight: "600" },

  main: { flex: 1, padding: 30 },
  headerBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
    borderWidth: 2,
    borderColor: "#0056D2",
  },
  nama: { fontSize: 20, fontWeight: "bold", color: "#2c3e50" },
  nim: { fontSize: 14, color: "#7f8c8d" },

  infoContainer: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  infoCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoText: { fontSize: 15 },

  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#0056D2",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    justifyContent: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },

  footer: {
    marginTop: 40,
    textAlign: "center",
    color: "#95a5a6",
    fontSize: 12,
  },
});
