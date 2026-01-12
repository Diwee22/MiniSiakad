import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "../lib/firebaseConfig";

export default function LoginScreen() {
  const router = useRouter();

  const [nim, setNim] = useState("");
  const [password, setPassword] = useState("");

  const [nimError, setNimError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginError, setLoginError] = useState("");

  const getErrorMessage = (code: string) => {
    switch (code) {
      case "auth/user-not-found":
        return "NIM tidak terdaftar";
      case "auth/wrong-password":
        return "Password salah";
      default:
        return "Login gagal, coba lagi";
    }
  };

  const getEmailByNim = (nim: string) => {
  if (nim.startsWith("99")) {
    return `${nim}@dosen.univ.ac.id`;
  }
  return `${nim}@student.univ.ac.id`;
};

const handleLogin = async () => {
  setNimError("");
  setPasswordError("");
  setLoginError("");

  if (!nim) setNimError("NIM wajib diisi");
  if (!password) setPasswordError("Password wajib diisi");
  if (!nim || !password) return;

  try {
    // 🔑 NIM ➜ EMAIL (SAMA DENGAN REGISTER)
    const email = getEmailByNim(nim);

    // 🔐 LOGIN FIREBASE AUTH
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // 🔥 AMBIL DATA USER DARI FIRESTORE
    const userDoc = await getDoc(
      doc(db, "users", userCredential.user.uid)
    );

    if (!userDoc.exists()) {
      throw new Error("Data user tidak ditemukan");
    }

    const { role } = userDoc.data();

    // 💾 SIMPAN ROLE
    await AsyncStorage.setItem("role", role);

    // 🔁 REDIRECT SESUAI ROLE
    if (role === "dosen") {
      router.replace("/dashboard_dosen");
    } else {
      router.replace("/dashboard_mahasiswa");
    }
  } catch (error: any) {
    setLoginError(getErrorMessage(error.code));
  }
};

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Login</Text>

        <Text style={styles.label}>NIM</Text>
        <TextInput
          style={[styles.input, nimError && styles.inputError]}
          placeholder="Masukkan NIM"
          keyboardType="number-pad"
          value={nim}
          onChangeText={(text) => {
            setNim(text);
            setNimError("");
          }}
        />
        {nimError && <Text style={styles.errorText}>{nimError}</Text>}

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={[styles.input, passwordError && styles.inputError]}
          placeholder="Masukkan password"
          secureTextEntry
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setPasswordError("");
          }}
        />
        {passwordError && (
          <Text style={styles.errorText}>{passwordError}</Text>
        )}

        {loginError && (
          <Text style={[styles.errorText, { textAlign: "center" }]}>
            {loginError}
          </Text>
        )}

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>SIGN IN</Text>
        </TouchableOpacity>

        <Text style={styles.signupText}>
          Belum punya akun?{" "}
          <Text
            style={styles.signupLink}
            onPress={() => router.push("/register")}
          >
            Daftar
          </Text>
        </Text>
      </View>
    </View>
  );
}

/* =======================
   STYLES (TIDAK DIUBAH)
   ======================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#007C9D",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 25,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 25,
    color: "#333",
  },
  label: {
    fontSize: 13,
    color: "#555",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 4,
    padding: 10,
    fontSize: 14,
    marginBottom: 10,
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#007C9D",
    paddingVertical: 12,
    borderRadius: 4,
    marginTop: 10,
  },
  buttonText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 14,
  },
  signupText: {
    textAlign: "center",
    fontSize: 12,
    color: "#777",
    marginTop: 15,
  },
  signupLink: {
    color: "#007C9D",
    fontWeight: "600",
  },
});
