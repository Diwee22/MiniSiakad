import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../lib/firebaseConfig";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useRouter } from "expo-router";

type Notifikasi = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt?: any;
};

export default function NotifikasiScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Notifikasi[]>([]);

  /* ================= LOAD NOTIFIKASI ================= */
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      router.replace("/login");
      return;
    }

    // 🔥 NOTIF UNTUK MAHASISWA
    const q = query(
      collection(db, "notifications"),
      where("targetRole", "==", "mahasiswa"),
      where("targetUid", "in", [user.uid, null]),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const notifData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));
      setData(notifData);
      setLoading(false);
    });

    return unsub;
  }, []);

  /* ================= MARK AS READ ================= */
  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, "notifications", id), {
        read: true,
      });
    } catch (error) {
      console.error("Gagal update notifikasi:", error);
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
    <View style={styles.container}>
      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            pressed && { opacity: 0.6 },
            Platform.OS === "web" && { cursor: "pointer" },
          ]}
        >
          <Ionicons name="arrow-back" size={24} color="#0056D2" />
        </Pressable>
        <Text style={styles.headerTitle}>Notifikasi</Text>
      </View>

      {/* ================= LIST NOTIF ================= */}
      {data.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons
            name="notifications-off-outline"
            size={60}
            color="#bdc3c7"
          />
          <Text style={styles.emptyText}>Belum ada notifikasi</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                console.log("Notif diklik:", item.id);
                markAsRead(item.id);
              }}
              style={({ pressed }) => [
                styles.card,
                !item.read && styles.cardUnread,
                pressed && { opacity: 0.7 },
                Platform.OS === "web" && { cursor: "pointer" },
              ]}
            >
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.message}>{item.message}</Text>

              {!item.read && (
                <Text style={styles.unreadBadge}>Baru</Text>
              )}
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    marginTop: 10,
    color: "#7f8c8d",
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },

  cardUnread: {
    borderLeftWidth: 5,
    borderLeftColor: "#0056D2",
  },

  title: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 5,
  },

  message: {
    fontSize: 14,
    color: "#7f8c8d",
  },

  unreadBadge: {
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: "#0056D2",
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: "bold",
  },
});
