import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Linking,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";

type Tugas = {
  id: string;
  judul: string;
  deskripsi: string;
  deadline: string;
};

type Jawaban = {
  tugasId: string;
  mahasiswaId: string;
  mahasiswaNama: string;

  fileUri: string;
  fileName: string;

  submittedAt: string;
  terlambat: boolean;

  nilai?: number;
  komentar?: string;
};

const TUGAS_KEY = "TUGAS_DOSEN";
const JAWABAN_KEY = "JAWABAN_MAHASISWA";

export default function TugasDosen() {
  const [tugas, setTugas] = useState<Tugas[]>([]);
  const [jawaban, setJawaban] = useState<Jawaban[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const t = await AsyncStorage.getItem(TUGAS_KEY);
    const j = await AsyncStorage.getItem(JAWABAN_KEY);

    if (t) setTugas(JSON.parse(t));
    if (j) setJawaban(JSON.parse(j));
  };

  // ===============================
  // BUKA FILE JAWABAN
  // ===============================
  const openJawaban = async (j: Jawaban) => {
    if (Platform.OS === "web") {
      window.open(j.fileUri, "_blank");
      return;
    }
    await Linking.openURL(j.fileUri);
  };

  // ===============================
  // JAWABAN PER TUGAS
  // ===============================
  const getJawabanByTugas = (tugasId: string) =>
    jawaban.filter((j) => j.tugasId === tugasId);

  // ===============================
  // REKAP NILAI
  // ===============================
  const getRekapNilai = (tugasId: string) => {
    const data = jawaban.filter(
      (j) => j.tugasId === tugasId && j.nilai !== undefined
    );

    if (data.length === 0) return null;

    const nilai = data.map((j) => j.nilai!);

    return {
      total: data.length,
      rata: nilai.reduce((a, b) => a + b, 0) / nilai.length,
      max: Math.max(...nilai),
      min: Math.min(...nilai),
    };
  };

  return (
    <View style={styles.page}>
      <Text style={styles.title}>📚 Kelola Tugas Dosen</Text>

      <FlatList
        data={tugas}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => {
          const jawabanList = getJawabanByTugas(item.id);
          const rekap = getRekapNilai(item.id);

          return (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.judul}</Text>
              <Text>{item.deskripsi}</Text>
              <Text style={styles.deadline}>
                Deadline: {item.deadline}
              </Text>

              {/* ================= JAWABAN ================= */}
              {jawabanList.length === 0 && (
                <Text style={styles.empty}>
                  Belum ada jawaban mahasiswa
                </Text>
              )}

              {jawabanList.map((j) => (
                <View key={j.mahasiswaId} style={styles.answerBox}>
                  <Text style={styles.bold}>
                    👤 {j.mahasiswaNama}
                  </Text>

                  <Text>📄 {j.fileName}</Text>
                  <Text>
                    ⏱️ {new Date(j.submittedAt).toLocaleString()}
                  </Text>

                  {j.terlambat && (
                    <Text style={styles.late}>🚫 TERLAMBAT</Text>
                  )}

                  {j.nilai !== undefined && (
                    <Text style={styles.nilai}>
                      Nilai: {j.nilai}
                    </Text>
                  )}

                  <Pressable onPress={() => openJawaban(j)}>
                    <Text style={styles.link}>Buka Jawaban</Text>
                  </Pressable>
                </View>
              ))}

              {/* ================= REKAP ================= */}
              {rekap && (
                <View style={styles.rekap}>
                  <Text style={styles.bold}>📊 Rekap Nilai</Text>
                  <Text>Total: {rekap.total}</Text>
                  <Text>Rata-rata: {rekap.rata.toFixed(1)}</Text>
                  <Text>Tertinggi: {rekap.max}</Text>
                  <Text>Terendah: {rekap.min}</Text>
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 14,
  },
  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  deadline: {
    marginTop: 6,
    color: "#DC2626",
    fontWeight: "600",
  },
  empty: {
    marginTop: 10,
    fontStyle: "italic",
    color: "#64748B",
  },
  answerBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
  },
  bold: {
    fontWeight: "700",
  },
  late: {
    color: "#DC2626",
    fontWeight: "700",
  },
  nilai: {
    fontWeight: "700",
    color: "#16A34A",
  },
  link: {
    marginTop: 4,
    color: "#2563EB",
    fontWeight: "600",
  },
  rekap: {
    marginTop: 14,
    padding: 12,
    backgroundColor: "#ECFDF5",
    borderRadius: 10,
  },
});
