import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebaseConfig";

export default function RegisterScreen() {
  const router = useRouter();

  const [nim, setNim] = useState("");
  const [nama, setNama] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [nimError, setNimError] = useState("");
  const [namaError, setNamaError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [registerError, setRegisterError] = useState("");

  const nimToEmail = (nim: string) => {
  if (nim.startsWith("99")) {
    return `${nim}@dosen.univ.ac.id`;
  }
  return `${nim}@student.univ.ac.id`;
};


  const getErrorMessage = (code: string) => {
    switch (code) {
      case "auth/email-already-in-use":
        return "NIM sudah terdaftar";
      case "auth/weak-password":
        return "Password minimal 6 karakter";
      default:
        return "Registrasi gagal, coba lagi";
    }
  };

  const getUserIdentity = (nim: string) => {
  if (nim.startsWith("99")) {
    return {
      email: `${nim}@dosen.univ.ac.id`,
      role: "dosen",
    };
  }
  return {
    email: `${nim}@student.univ.ac.id`,
    role: "mahasiswa",
  };
};

const handleRegister = async () => {
  setNimError("");
  setNamaError("");
  setPasswordError("");
  setConfirmError("");
  setRegisterError("");

  if (!nim) setNimError("NIM wajib diisi");
  if (!nama) setNamaError("Nama wajib diisi");
  if (!password) setPasswordError("Password wajib diisi");
  if (!confirmPassword)
    setConfirmError("Konfirmasi password wajib diisi");

  if (password !== confirmPassword) {
    setConfirmError("Password tidak sama");
    return;
  }

  if (!nim || !nama || !password || !confirmPassword) return;

  try {
    const { email, role } = getUserIdentity(nim);

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await setDoc(doc(db, "users", userCredential.user.uid), {
      nim,
      nama,
      role,
      createdAt: serverTimestamp(),
    });

    router.replace("/login");
  } catch (error: any) {
    setRegisterError(getErrorMessage(error.code));
  }
};


  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Register Mahasiswa</Text>

        {/* NIM */}
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
        {nimError ? <Text style={styles.errorText}>{nimError}</Text> : null}

        {/* NAMA */}
        <Text style={styles.label}>Nama Lengkap</Text>
        <TextInput
          style={[styles.input, namaError && styles.inputError]}
          placeholder="Masukkan nama lengkap"
          value={nama}
          onChangeText={(text) => {
            setNama(text);
            setNamaError("");
          }}
        />
        {namaError ? <Text style={styles.errorText}>{namaError}</Text> : null}

        {/* PASSWORD */}
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={[styles.input, passwordError && styles.inputError]}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setPasswordError("");
          }}
        />
        {passwordError ? (
          <Text style={styles.errorText}>{passwordError}</Text>
        ) : null}

        {/* CONFIRM */}
        <Text style={styles.label}>Konfirmasi Password</Text>
        <TextInput
          style={[styles.input, confirmError && styles.inputError]}
          placeholder="Ulangi password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setConfirmError("");
          }}
        />
        {confirmError ? (
          <Text style={styles.errorText}>{confirmError}</Text>
        ) : null}

        {/* ERROR */}
        {registerError ? (
          <Text style={[styles.errorText, { textAlign: "center" }]}>
            {registerError}
          </Text>
        ) : null}

        {/* BUTTON */}
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>DAFTAR</Text>
        </TouchableOpacity>

        {/* LOGIN */}
        <Text style={styles.signupText}>
          Sudah punya akun?{" "}
          <Text
            style={styles.signupLink}
            onPress={() => router.replace("/login")}
          >
            Login
          </Text>
        </Text>
      </View>
    </View>
  );
}

/* =======================
   STYLES
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
