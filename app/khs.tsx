import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// ✅ IMPORT DATA KHS DARI JSON
import khsData from "./khsData.json";

type MK = {
  nama: string;
  kode: string;
  uts: number;
  uas: number;
  akhir: number;
  huruf: string;
  mutu: number;
};

export default function KHSScreen() {
  const router = useRouter();
  const [dataMK, setDataMK] = useState<MK[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD DATA JSON ================= */
  useEffect(() => {
    setDataMK(khsData as MK[]);
    setLoading(false);
  }, []);

  /* ================= HITUNG IP ================= */
  const totalMutu = dataMK.reduce((sum, mk) => sum + mk.mutu, 0);
  const ip = dataMK.length > 0 ? totalMutu / dataMK.length : 0;
  const cumlaude = ip >= 3.5;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* =============== SIDEBAR =============== */}
      <View style={styles.sidebar}>
        <Text style={styles.sidebarTitle}>Menu</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/dashboard_mahasiswa")}
        >
          <Ionicons name="home-outline" size={20} color="#ecf0f1" />
          <Text style={styles.menuText}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItemActive}>
          <Ionicons name="document-text-outline" size={20} color="#fff" />
          <Text style={styles.menuTextActive}>KHS</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.replace("/login")}
        >
          <MaterialIcons name="logout" size={20} color="#ecf0f1" />
          <Text style={styles.menuText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* =============== KONTEN =============== */}
      <ScrollView style={styles.main}>
        <TouchableOpacity
          onPress={() => router.push("/dashboard_mahasiswa")}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color="#2563EB" />
          <Text style={styles.backText}>Kembali ke Dashboard</Text>
        </TouchableOpacity>

        <Text style={styles.headerText}>Kartu Hasil Studi (KHS)</Text>

        {/* ================= TABEL ================= */}
        <ScrollView horizontal>
          <View style={styles.table}>
            <View style={[styles.row, styles.headerRow]}>
              <Text style={[styles.cell, styles.th, { flex: 0.5 }]}>No</Text>
              <Text style={[styles.cell, styles.th, { flex: 2.5 }]}>
                Mata Kuliah
              </Text>
              <Text style={[styles.cell, styles.th, { flex: 1.2 }]}>Kode</Text>
              <Text style={[styles.cell, styles.th]}>UTS</Text>
              <Text style={[styles.cell, styles.th]}>UAS</Text>
              <Text style={[styles.cell, styles.th]}>Akhir</Text>
              <Text style={[styles.cell, styles.th]}>Huruf</Text>
              <Text style={[styles.cell, styles.th]}>Mutu</Text>
            </View>

            {dataMK.map((item, index) => (
              <View key={index} style={styles.row}>
                <Text style={[styles.cell, { flex: 0.5 }]}>
                  {index + 1}
                </Text>
                <Text style={[styles.cell, { flex: 2.5 }]}>
                  {item.nama}
                </Text>
                <Text style={[styles.cell, { flex: 1.2 }]}>
                  {item.kode}
                </Text>
                <Text style={styles.cell}>{item.uts}</Text>
                <Text style={styles.cell}>{item.uas}</Text>
                <Text style={styles.cell}>{item.akhir}</Text>
                <Text style={[styles.cell, { fontWeight: "bold" }]}>
                  {item.huruf}
                </Text>
                <Text style={styles.cell}>{item.mutu.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* ================= IP ================= */}
        <View style={styles.footerCard}>
          <Text style={styles.ipText}>IP Semester: {ip.toFixed(2)}</Text>
          <Text
            style={[
              styles.statusText,
              { color: cumlaude ? "#16a34a" : "#f59e0b" },
            ]}
          >
            {cumlaude
              ? "Selamat! Kamu meraih predikat Cumlaude 🎉"
              : "Tetap semangat! Tingkatkan prestasimu 💪"}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row" },
  sidebar: {
    width: 200,
    backgroundColor: "#0056D2",
    padding: 20,
  },
  sidebarTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 30,
  },
  menuItem: { flexDirection: "row", gap: 10, marginBottom: 16 },
  menuItemActive: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#0040A1",
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  menuText: { color: "#ecf0f1" },
  menuTextActive: { color: "#fff", fontWeight: "600" },

  main: { flex: 1, padding: 20 },
  backBtn: { flexDirection: "row", marginBottom: 12 },
  backText: { marginLeft: 6, color: "#2563EB", fontWeight: "600" },
  headerText: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },

  table: { minWidth: 850, borderWidth: 1, borderColor: "#e5e7eb" },
  row: { flexDirection: "row", borderBottomWidth: 1 },
  headerRow: { backgroundColor: "#f1f5f9" },
  cell: { flex: 1, padding: 8, textAlign: "center" },
  th: { fontWeight: "bold" },

  footerCard: {
    marginTop: 20,
    padding: 16,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  ipText: { fontSize: 18, fontWeight: "bold" },
  statusText: { marginTop: 6, fontWeight: "600" },
});
