import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../lib/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function Profil() {
  const router = useRouter();

  const [uid, setUid] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // DATA UTAMA
  const [nama, setNama] = useState("");
  const [nim, setNim] = useState("");
  const [alamat, setAlamat] = useState("");

  // DATA LENGKAP
  const [namaIbu, setNamaIbu] = useState("");
  const [tempatLahir, setTempatLahir] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");

  /* ================= AUTH & LOAD DATA ================= */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      setUid(user.uid);
      const snap = await getDoc(doc(db, "users", user.uid));

      if (snap.exists()) {
        const d = snap.data();
        setNama(d.nama || "");
        setNim(d.nim || "");
        setAlamat(d.alamat || "");
        setNamaIbu(d.namaIbu || "");
        setTempatLahir(d.tempatLahir || "");
        setTanggalLahir(d.tanggalLahir || "");
      }

      setLoading(false);
    });

    return unsub;
  }, []);

  /* ================= SIMPAN PROFIL ================= */
  const simpanProfil = async () => {
    if (!nama || !alamat) {
      Alert.alert("Validasi", "Nama dan alamat wajib diisi");
      return;
    }

    setSaving(true);

    await updateDoc(doc(db, "users", uid), {
      nama,
      alamat,
      namaIbu,
      tempatLahir,
      tanggalLahir,
    });

    setSaving(false);
    Alert.alert("Berhasil", "Profil berhasil diperbarui");
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0056D2" />
      </View>
    );
  }

  return (
    <View style={styles.page}>
      {/* ================= SIDEBAR ================= */}
      <View style={styles.sidebar}>
        <Text style={styles.sidebarTitle}>Mahasiswa</Text>

        <TouchableOpacity
          style={styles.menu}
          onPress={() => router.replace("/dashboard_mahasiswa")}
        >
          <Ionicons name="home-outline" size={20} color="#fff" />
          <Text style={styles.menuText}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuActive}>
          <Ionicons name="person-outline" size={20} color="#fff" />
          <Text style={styles.menuTextActive}>Profil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menu}
          onPress={() => router.push("/khs")}
        >
          <Ionicons name="document-text-outline" size={20} color="#fff" />
          <Text style={styles.menuText}>KHS</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menu}
          onPress={() => {
            auth.signOut();
            router.replace("/login");
          }}
        >
          <MaterialIcons name="logout" size={20} color="#fff" />
          <Text style={styles.menuText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* ================= CONTENT (SCROLL) ================= */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Edit Profil Mahasiswa</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Nama Lengkap</Text>
          <TextInput value={nama} onChangeText={setNama} style={styles.input} />

          <Text style={styles.label}>NIM</Text>
          <TextInput value={nim} editable={false} style={styles.inputDisabled} />

          <Text style={styles.label}>Alamat</Text>
          <TextInput
            value={alamat}
            onChangeText={setAlamat}
            style={[styles.input, { height: 80 }]}
            multiline
          />

          <Text style={styles.label}>Nama Ibu Kandung</Text>
          <TextInput
            value={namaIbu}
            onChangeText={setNamaIbu}
            style={styles.input}
          />

          <Text style={styles.label}>Tempat Lahir</Text>
          <TextInput
            value={tempatLahir}
            onChangeText={setTempatLahir}
            style={styles.input}
          />

          <Text style={styles.label}>Tanggal Lahir</Text>
          <TextInput
            value={tanggalLahir}
            onChangeText={setTanggalLahir}
            placeholder="YYYY-MM-DD"
            style={styles.input}
          />

          <TouchableOpacity
            style={styles.btn}
            onPress={simpanProfil}
            disabled={saving}
          >
            <Text style={styles.btnText}>
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  page: { flex: 1, flexDirection: "row", backgroundColor: "#F4F6F8" },

  sidebar: { width: 220, backgroundColor: "#0056D2", padding: 24 },
  sidebarTitle: { color: "#fff", fontSize: 18, fontWeight: "600", marginBottom: 24 },

  menu: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 },
  menuActive: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    backgroundColor: "#0040A1",
    borderRadius: 8,
    marginBottom: 6,
  },
  menuText: { color: "#fff" },
  menuTextActive: { color: "#fff", fontWeight: "600" },

  content: { flex: 1, padding: 30, maxWidth: 700 },
  pageTitle: { fontSize: 20, fontWeight: "700", marginBottom: 20 },

  card: { backgroundColor: "#fff", padding: 20, borderRadius: 12 },
  label: { fontWeight: "600", marginTop: 12, marginBottom: 6 },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
  },
  inputDisabled: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#eee",
    color: "#777",
  },

  btn: {
    marginTop: 20,
    backgroundColor: "#0056D2",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "600" },
});
