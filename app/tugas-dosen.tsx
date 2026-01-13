import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
  Platform,
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

type Tugas = {
  id: string;
  judul: string;
  deskripsi: string;
  deadline: string;
  fileUri?: string;
  fileName?: string;
  soalBase64?: string;
  soalType?: string;
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

type Notifikasi = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
};

const TUGAS_KEY = "TUGAS_DOSEN";
const JAWABAN_KEY = "JAWABAN_MAHASISWA";
const NOTIF_KEY = "NOTIF_MAHASISWA";

export default function TugasDosen() {
  const [tugas, setTugas] = useState<Tugas[]>([]);
  const [jawaban, setJawaban] = useState<Jawaban[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentTugas, setCurrentTugas] = useState<Tugas | null>(null);
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [deadline, setDeadline] = useState("");
  const [fileUri, setFileUri] = useState<string | undefined>();
  const [fileName, setFileName] = useState<string | undefined>();

  useEffect(() => {
    loadData();
    requestPermission();
  }, []);

  // =============================== IZIN NOTIFIKASI ===============================
  const requestPermission = async () => {
    if (Platform.OS === "web") {
      if ("Notification" in window) {
        await Notification.requestPermission();
      }
    } else {
      await Notifications.requestPermissionsAsync();
    }
  };

  const loadData = async () => {
    const t = await AsyncStorage.getItem(TUGAS_KEY);
    const j = await AsyncStorage.getItem(JAWABAN_KEY);
    if (t) setTugas(JSON.parse(t));
    if (j) setJawaban(JSON.parse(j));
  };

  // =============================== NOTIFIKASI ===============================
  const kirimNotifikasi = async (t: Tugas) => {
    const notif: Notifikasi = {
      id: Date.now().toString(),
      title: "📢 Tugas Baru",
      body: `Dosen mengirim tugas: ${t.judul}`,
      createdAt: new Date().toISOString(),
    };

    const old = await AsyncStorage.getItem(NOTIF_KEY);
    const list = old ? JSON.parse(old) : [];
    await AsyncStorage.setItem(NOTIF_KEY, JSON.stringify([notif, ...list]));

    if (Platform.OS === "web" && Notification.permission === "granted") {
      new Notification(notif.title, { body: notif.body });
    }

    if (Platform.OS !== "web") {
      await Notifications.scheduleNotificationAsync({
        content: { title: notif.title, body: notif.body },
        trigger: null,
      });
    }

    Alert.alert("✅ Notifikasi terkirim ke mahasiswa");
  };

  // =============================== BUKA JAWABAN ===============================
  const openJawaban = async (j: { fileUri: string }) => {
    if (!j.fileUri) return;
    if (Platform.OS === "web") {
      window.open(j.fileUri, "_blank");
      return;
    }
    await Linking.openURL(j.fileUri);
  };

  const getJawabanByTugas = (id: string) =>
    jawaban.filter((j) => j.tugasId === id);

  // =============================== ADD / EDIT ===============================
  const openModal = (tugas?: Tugas) => {
    if (tugas) {
      setCurrentTugas(tugas);
      setJudul(tugas.judul);
      setDeskripsi(tugas.deskripsi);
      setDeadline(tugas.deadline);
      setFileUri(tugas.fileUri);
      setFileName(tugas.fileName);
    } else {
      setCurrentTugas(null);
      setJudul("");
      setDeskripsi("");
      setDeadline("");
      setFileUri(undefined);
      setFileName(undefined);
    }
    setModalVisible(true);
  };

  const pickFile = async () => {
    const result: DocumentPicker.DocumentResult = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
    });

    if (result.type === "success") {
      setFileUri(result.uri);
      setFileName(result.name);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setFileUri(result.assets[0].uri);
      setFileName(result.assets[0].uri.split("/").pop());
    }
  };

  const uriToBase64 = async (uri: string) => {
  const response = await fetch(uri);
  const blob = await response.blob();

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result?.toString().split(",")[1];
      if (base64) resolve(base64);
      else reject("Gagal convert base64");
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};


  const saveTugas = async () => {
    if (!judul || !deskripsi || !deadline) {
      Alert.alert("Semua field harus diisi!");
      return;
    }

    let newTugas: Tugas;
    if (currentTugas) {
      // EDIT
      newTugas = { ...currentTugas, judul, deskripsi, deadline, fileUri, fileName };
      const updated = tugas.map((t) => (t.id === currentTugas.id ? newTugas : t));
      setTugas(updated);
      await AsyncStorage.setItem(TUGAS_KEY, JSON.stringify(updated));
    } else {
      // ADD
      newTugas = {
        id: Date.now().toString(),
        judul,
        deskripsi,
        deadline,
        fileUri,
        fileName,
        soalBase64: currentTugas?.soalBase64,
        soalType: currentTugas?.soalType,
      };
      const updated = [newTugas, ...tugas];
      setTugas(updated);
      await AsyncStorage.setItem(TUGAS_KEY, JSON.stringify(updated));
    }

    setModalVisible(false);
    setCurrentTugas(null);
  };

  // =============================== HAPUS ===============================
  const hapusTugas = async (t: Tugas) => {
    let confirmDelete = true;

    if (Platform.OS === "web") {
      confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus "${t.judul}"?`);
    } else {
      Alert.alert(
        "Hapus Tugas",
        `Apakah Anda yakin ingin menghapus "${t.judul}"?`,
        [
          { text: "Batal", style: "cancel", onPress: () => (confirmDelete = false) },
          {
            text: "Hapus",
            style: "destructive",
            onPress: () => {
              confirmDelete = true;
              const updated = tugas.filter((item) => item.id !== t.id);
              setTugas(updated);
              AsyncStorage.setItem(TUGAS_KEY, JSON.stringify(updated));
            },
          },
        ],
        { cancelable: true }
      );
      return;
    }

    if (!confirmDelete) return;
    const updated = tugas.filter((item) => item.id !== t.id);
    setTugas(updated);
    await AsyncStorage.setItem(TUGAS_KEY, JSON.stringify(updated));
  };

  // =============================== BERI NILAI ===============================
  const beriNilai = (j: Jawaban) => {
    if (Platform.OS === "web") {
      const nilaiStr = prompt("Masukkan Nilai untuk " + j.mahasiswaNama, j.nilai?.toString() || "");
      const komentarStr = prompt("Masukkan Komentar (opsional)", j.komentar || "");
      if (nilaiStr === null) return;
      const nilaiNum = Number(nilaiStr);
      if (isNaN(nilaiNum)) {
        alert("Nilai harus berupa angka!");
        return;
      }
      const updatedJawaban = jawaban.map((item) =>
        item.tugasId === j.tugasId && item.mahasiswaId === j.mahasiswaId
          ? { ...item, nilai: nilaiNum, komentar: komentarStr || "" }
          : item
      );
      setJawaban(updatedJawaban);
      AsyncStorage.setItem(JAWABAN_KEY, JSON.stringify(updatedJawaban));
      alert("✅ Nilai berhasil disimpan");
    } else {
      Alert.prompt(
        "Beri Nilai",
        `Masukkan nilai untuk ${j.mahasiswaNama}`,
        [
          { text: "Batal", style: "cancel" },
          {
            text: "Simpan",
            onPress: (value?: string) => {
              if (!value) return;
              const nilaiNum = Number(value);
              if (isNaN(nilaiNum)) {
                Alert.alert("Nilai harus berupa angka!");
                return;
              }
              const updatedJawaban = jawaban.map((item) =>
                item.tugasId === j.tugasId && item.mahasiswaId === j.mahasiswaId
                  ? { ...item, nilai: nilaiNum }
                  : item
              );
              setJawaban(updatedJawaban);
              AsyncStorage.setItem(JAWABAN_KEY, JSON.stringify(updatedJawaban));
              Alert.alert("✅ Nilai berhasil disimpan");
            },
          },
        ],
        "plain-text",
        j.nilai?.toString() || ""
      );
    }
  };

  return (
    <View style={styles.page}>
      <Text style={styles.title}>📚 Kelola Tugas Dosen</Text>

      <Pressable style={styles.addBtn} onPress={() => openModal()}>
        <Text style={styles.addText}>➕ Tambah Tugas</Text>
      </Pressable>

      <FlatList
        data={tugas}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => {
          const jawabanList = getJawabanByTugas(item.id);
          return (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.judul}</Text>
              <Text>{item.deskripsi}</Text>
              <Text style={styles.deadline}>Deadline: {item.deadline}</Text>
              {item.fileName && (
                <Pressable onPress={() => openJawaban({ fileUri: item.fileUri! })}>
                  <Text style={[styles.link, { marginTop: 6 }]}>📎 {item.fileName}</Text>
                </Pressable>
              )}

              <View style={{ flexDirection: "row", marginTop: 8 }}>
                <Pressable style={styles.notifBtn} onPress={() => kirimNotifikasi(item)}>
                  <Text style={styles.notifText}>🔔 Kirim Notifikasi</Text>
                </Pressable>

                <Pressable style={[styles.notifBtn, { backgroundColor: "#FFC107" }]} onPress={() => openModal(item)}>
                  <Text style={styles.notifText}>✏️ Edit</Text>
                </Pressable>

                <Pressable style={[styles.notifBtn, { backgroundColor: "#DC2626" }]} onPress={() => hapusTugas(item)}>
                  <Text style={styles.notifText}>🗑 Hapus</Text>
                </Pressable>
              </View>

              {jawabanList.length === 0 && <Text style={styles.empty}>Belum ada jawaban mahasiswa</Text>}

              {jawabanList.map((j) => (
                <View key={j.mahasiswaId} style={styles.answerBox}>
                  <Text style={styles.bold}>👤 {j.mahasiswaNama}</Text>
                  <Text>📄 {j.fileName}</Text>
                  {j.nilai !== undefined && <Text>🏆 Nilai: {j.nilai}</Text>}
                  {j.komentar && <Text>💬 Komentar: {j.komentar}</Text>}
                  <View style={{ flexDirection: "row", marginTop: 4 }}>
                    <Pressable onPress={() => openJawaban(j)}>
                      <Text style={styles.link}>Buka Jawaban</Text>
                    </Pressable>
                    <Pressable onPress={() => beriNilai(j)} style={{ marginLeft: 12 }}>
                      <Text style={[styles.link, { color: "#16A34A" }]}>Beri Nilai</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          );
        }}
      />

      {/* MODAL ADD/EDIT */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <TextInput placeholder="Judul Tugas" value={judul} onChangeText={setJudul} style={styles.input} />
            <TextInput placeholder="Deskripsi" value={deskripsi} onChangeText={setDeskripsi} style={styles.input} />
            <TextInput placeholder="Deadline" value={deadline} onChangeText={setDeadline} style={styles.input} />

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
              <Pressable style={styles.fileBtn} onPress={pickFile}>
                <Text style={styles.fileText}>📎 Pilih File</Text>
              </Pressable>
              <Pressable style={styles.fileBtn} onPress={pickImage}>
                <Text style={styles.fileText}>🖼 Pilih Foto</Text>
              </Pressable>
            </View>

            {fileName && <Text style={{ marginBottom: 8 }}>File dipilih: {fileName}</Text>}

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Pressable style={styles.saveBtn} onPress={saveTugas}>
                <Text style={{ color: "#FFF", fontWeight: "700" }}>💾 Simpan</Text>
              </Pressable>
              <Pressable style={[styles.saveBtn, { backgroundColor: "#DC2626" }]} onPress={() => setModalVisible(false)}>
                <Text style={{ color: "#FFF", fontWeight: "700" }}>❌ Batal</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F1F5F9", padding: 16 },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 14 },

  addBtn: { backgroundColor: "#16A34A", padding: 12, borderRadius: 10, marginBottom: 12, alignItems: "center" },
  addText: { color: "#FFF", fontWeight: "700" },

  card: { backgroundColor: "#FFF", padding: 16, borderRadius: 14, marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: "700" },
  deadline: { marginTop: 6, color: "#DC2626", fontWeight: "600" },

  notifBtn: { backgroundColor: "#2563EB", padding: 8, borderRadius: 8, marginRight: 8 },
  notifText: { color: "#FFF", fontWeight: "700" },

  empty: { marginTop: 10, fontStyle: "italic", color: "#64748B" },
  answerBox: { marginTop: 12, padding: 12, backgroundColor: "#F8FAFC", borderRadius: 10 },
  bold: { fontWeight: "700" },
  link: { marginTop: 4, color: "#2563EB", fontWeight: "600" },

  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 16 },
  modalBox: { backgroundColor: "#FFF", borderRadius: 12, padding: 16 },
  input: { borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 8, padding: 8, marginBottom: 12 },
  saveBtn: { backgroundColor: "#2563EB", padding: 12, borderRadius: 8, alignItems: "center", flex: 1, marginRight: 8 },
  fileBtn: { backgroundColor: "#64748B", padding: 10, borderRadius: 8, flex: 1, marginRight: 8 },
  fileText: { color: "#FFF", fontWeight: "700", textAlign: "center" },
});
