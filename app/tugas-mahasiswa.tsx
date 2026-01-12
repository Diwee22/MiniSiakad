import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Linking,
  Platform,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";

type Tugas = {
  id: string;
  judul: string;
  deskripsi: string;
  deadline: string;

  soalBase64?: string;
  soalName?: string;
  soalType?: string;

  nilai?: number;
  komentar?: string;
};

type Jawaban = {
  tugasId: string;
  fileUri: string;
  fileName: string;
};

const TUGAS_KEY = "TUGAS_DOSEN";
const JAWABAN_KEY = "JAWABAN_MAHASISWA";

export default function TugasMahasiswa() {
  const [tugas, setTugas] = useState<Tugas[]>([]);
  const [jawaban, setJawaban] = useState<Jawaban[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const tugasData = await AsyncStorage.getItem(TUGAS_KEY);
    const jawabanData = await AsyncStorage.getItem(JAWABAN_KEY);

    if (tugasData) setTugas(JSON.parse(tugasData));
    if (jawabanData) setJawaban(JSON.parse(jawabanData));
  };

  // ================= BUKA SOAL =================
  const openSoal = async (item: Tugas) => {
    if (!item.soalBase64 || !item.soalName) {
      alert("Soal tidak tersedia");
      return;
    }

    const mime = item.soalType || "application/pdf";

    // ===== WEB =====
    if (Platform.OS === "web") {
      const byteCharacters = atob(item.soalBase64);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mime });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = item.soalName;
      link.target = "_blank";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      return;
    }

    // ===== MOBILE =====
    const uri = FileSystem.cacheDirectory + item.soalName;

    await FileSystem.writeAsStringAsync(uri, item.soalBase64, {
      encoding: "base64",
    });

    await Linking.openURL(uri);
  };

  // ================= UPLOAD / EDIT JAWABAN =================
  const uploadJawaban = async (tugasId: string) => {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
    });

    if (result.canceled) return;

    const file = result.assets[0];

    const newJawaban: Jawaban = {
      tugasId,
      fileUri: file.uri,
      fileName: file.name,
    };

    const updated = [
      ...jawaban.filter((j) => j.tugasId !== tugasId),
      newJawaban,
    ];

    setJawaban(updated);
    await AsyncStorage.setItem(JAWABAN_KEY, JSON.stringify(updated));
  };

  // ================= HAPUS JAWABAN =================
  const deleteJawaban = (tugasId: string) => {
    Alert.alert(
      "Hapus Jawaban",
      "Apakah kamu yakin ingin menghapus jawaban ini?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            const updated = jawaban.filter(
              (j) => j.tugasId !== tugasId
            );
            setJawaban(updated);
            await AsyncStorage.setItem(
              JAWABAN_KEY,
              JSON.stringify(updated)
            );
          },
        },
      ]
    );
  };

  const getJawaban = (tugasId: string) =>
    jawaban.find((j) => j.tugasId === tugasId);

  const isLate = (deadline: string) =>
    new Date() > new Date(deadline);

  return (
    <View style={styles.page}>
      <View style={styles.container}>
        <Text style={styles.title}>Tugas Mahasiswa</Text>

        <FlatList
          data={tugas}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => {
            const jawab = getJawaban(item.id);
            const terlambat = isLate(item.deadline);

            return (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{item.judul}</Text>
                <Text>{item.deskripsi}</Text>

                <View style={styles.row}>
                  <Text
                    style={[
                      styles.badge,
                      terlambat ? styles.badgeRed : styles.badgeBlue,
                    ]}
                  >
                    Deadline: {item.deadline}
                  </Text>

                  <Text
                    style={[
                      styles.badge,
                      jawab ? styles.badgeGreen : styles.badgeGray,
                    ]}
                  >
                    {jawab ? "Sudah Dikumpulkan" : "Belum Dikumpulkan"}
                  </Text>
                </View>

                {/* 📎 LIHAT SOAL */}
                {item.soalBase64 && (
                  <Pressable onPress={() => openSoal(item)}>
                    <Text style={styles.link}>
                      📎 Lihat Soal ({item.soalName})
                    </Text>
                  </Pressable>
                )}

                {/* 📤 EDIT & HAPUS JAWABAN */}
                <View style={styles.actionRow}>
                  <Pressable
                    style={styles.upload}
                    onPress={() => uploadJawaban(item.id)}
                  >
                    <Text style={styles.btnText}>
                      {jawab ? "Edit Jawaban" : "Upload Jawaban"}
                    </Text>
                  </Pressable>

                  {jawab && (
                    <Pressable
                      style={styles.delete}
                      onPress={() => deleteJawaban(item.id)}
                    >
                      <Text style={styles.deleteText}>Hapus</Text>
                    </Pressable>
                  )}
                </View>

                {/* 📄 FILE JAWABAN */}
                {jawab && (
                  <Text style={styles.file}>
                    📄 Jawaban: {jawab.fileName}
                  </Text>
                )}

                {/* 🧮 NILAI */}
                {item.nilai !== undefined && (
                  <View style={styles.nilaiBox}>
                    <Text style={styles.nilaiText}>
                      Nilai: {item.nilai}
                    </Text>
                    <Text>{item.komentar}</Text>
                  </View>
                )}
              </View>
            );
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F1F5F9" },
  container: { flex: 1, width: "100%", padding: 20 },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
    color: "#0F172A",
  },

  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },

  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    fontSize: 12,
    color: "#FFF",
  },
  badgeBlue: { backgroundColor: "#2563EB" },
  badgeGreen: { backgroundColor: "#16A34A" },
  badgeGray: { backgroundColor: "#64748B" },
  badgeRed: { backgroundColor: "#DC2626" },

  link: {
    color: "#2563EB",
    fontWeight: "600",
    marginTop: 8,
  },

  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },

  upload: {
    flex: 1,
    backgroundColor: "#2563EB",
    padding: 12,
    borderRadius: 10,
  },

  delete: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: "center",
  },

  btnText: {
    color: "#FFF",
    fontWeight: "700",
    textAlign: "center",
  },

  deleteText: {
    color: "#FFF",
    fontWeight: "700",
  },

  file: {
    fontSize: 12,
    marginTop: 6,
    color: "#334155",
  },

  nilaiBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#DCFCE7",
    borderRadius: 10,
  },

  nilaiText: {
    fontWeight: "700",
    color: "#166534",
  },
});
