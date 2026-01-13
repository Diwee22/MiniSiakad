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
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../lib/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { sendNotification } from "../lib/notification";

export default function DashboardMahasiswa() {
  const router = useRouter();

  // DATA UTAMA
  const [uid, setUid] = useState("");
  const [nama, setNama] = useState("");
  const [nim, setNim] = useState("");
  const [photoURL, setPhotoURL] = useState<string | null>(null);

  // DATA DIRI (SYNC DARI PROFIL)
  const [alamat, setAlamat] = useState("");
  const [namaIbu, setNamaIbu] = useState("");
  const [tempatLahir, setTempatLahir] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");

  const [loading, setLoading] = useState(true);

  // 🔔 NOTIF
  const [notifCount, setNotifCount] = useState(0);
  const [notifDetail, setNotifDetail] = useState("");
  const [showNotif, setShowNotif] = useState(false);

  /* ================= AUTH & LOAD USER ================= */
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
        setPhotoURL(d.photoURL || null);
        setAlamat(d.alamat || "-");
        setNamaIbu(d.namaIbu || "-");
        setTempatLahir(d.tempatLahir || "-");
        setTanggalLahir(d.tanggalLahir || "-");
      }

      setLoading(false);
    });

    return unsub;
  }, []);

  /* ================= PERMISSION NOTIF ================= */
  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  /* ================= DUMMY NOTIF ================= */
  useEffect(() => {
    AsyncStorage.setItem(
      "notif_data",
      JSON.stringify({
        tugasBelum: 3,
        pesan: 1,
        akademik: "KRS dibuka minggu depan",
      })
    );
  }, []);

  /* ================= LOAD NOTIF ================= */
  useEffect(() => {
    const loadNotif = async () => {
      const data = await AsyncStorage.getItem("notif_data");
      if (!data) return;

      const notif = JSON.parse(data);
      const total =
        notif.tugasBelum + notif.pesan + (notif.akademik ? 1 : 0);

      setNotifCount(total);

      setNotifDetail(
        `📚 ${notif.tugasBelum} tugas belum dikerjakan\n📩 ${notif.pesan} pesan baru\nℹ️ ${notif.akademik}`
      );

      if (notif.tugasBelum > 0) {
        sendNotification(
          "Tugas Belum Dikerjakan",
          `Kamu punya ${notif.tugasBelum} tugas`
        );
      }
    };

    loadNotif();
  }, []);

  /* ================= PICK IMAGE ================= */
  const pickImage = async () => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setPhotoURL(uri);
      await updateDoc(doc(db, "users", uid), { photoURL: uri });
    }
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

        <TouchableOpacity style={styles.menuActive}>
          <Ionicons name="home-outline" size={20} color="#fff" />
          <Text style={styles.menuTextActive}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menu}
          onPress={() => router.push("/profil")}
        >
          <Ionicons name="person-outline" size={20} color="#fff" />
          <Text style={styles.menuText}>Profil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menu}
          onPress={() => router.push("/tugas-mahasiswa")}
        >
          <Ionicons name="list-outline" size={20} color="#fff" />
          <Text style={styles.menuText}>Tugas</Text>
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

      {/* ================= CONTENT ================= */}
      <View style={styles.content}>
        {/* TOP BAR */}
        <View style={styles.topBar}>
          <Text style={styles.pageTitle}>Dashboard</Text>

          <TouchableOpacity onPress={() => setShowNotif(true)}>
            <View>
              <Ionicons
                name="notifications-outline"
                size={26}
                color="#0056D2"
              />
              {notifCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{notifCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* MODAL NOTIF */}
        {showNotif && (
          <View style={styles.notifOverlay}>
            <View style={styles.notifBox}>
              <Text style={styles.notifTitle}>🔔 Notifikasi</Text>
              <Text style={styles.notifContent}>{notifDetail}</Text>
              <TouchableOpacity
                style={styles.notifClose}
                onPress={() => setShowNotif(false)}
              >
                <Text style={styles.notifCloseText}>Tutup</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* PROFIL CARD */}
        <View style={styles.card}>
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={
                photoURL
                  ? { uri: photoURL }
                  : require("../assets/images/aldi.jpg")
              }
              style={styles.avatar}
            />
            <Text style={styles.editFoto}>Ubah Foto</Text>
          </TouchableOpacity>

          <View>
            <Text style={styles.nama}>{nama}</Text>
            <Text style={styles.nim}>NIM: {nim}</Text>
            <Text style={styles.prodi}>Sistem Informasi • Semester 5</Text>
          </View>
        </View>

        {/* DATA DIRI */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Data Diri Mahasiswa</Text>
          <Text>Alamat: {alamat}</Text>
          <Text>Nama Ibu: {namaIbu}</Text>
          <Text>TTL: {tempatLahir}, {tanggalLahir}</Text>
        </View>

        {/* AKADEMIK */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Informasi Akademik</Text>
          <Text>IP Semester: 3.65</Text>
          <Text>IPK: 3.55</Text>
          <Text>Status: Aktif</Text>
        </View>
      </View>
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

  content: { flex: 1, padding: 30, maxWidth: 900 },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  pageTitle: { fontSize: 20, fontWeight: "700" },

  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 6,
    minWidth: 18,
    alignItems: "center",
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  avatar: { width: 70, height: 70, borderRadius: 35, marginRight: 16 },
  editFoto: { fontSize: 12, color: "#0056D2", textAlign: "center" },

  nama: { fontSize: 18, fontWeight: "600" },
  nim: { color: "#666" },
  prodi: { color: "#777", marginTop: 4 },

  infoCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoTitle: { fontWeight: "600", marginBottom: 6 },

  notifOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  notifBox: {
    width: 320,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
  },
  notifTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  notifContent: { color: "#333", marginBottom: 16, lineHeight: 20 },
  notifClose: { alignSelf: "flex-end" },
  notifCloseText: { color: "#0056D2", fontWeight: "600" },
});
