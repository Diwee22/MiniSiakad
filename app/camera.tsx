import { useState, useRef } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  Platform 
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { Ionicons } from "@expo/vector-icons";

export default function CameraPage() {
  const [permission, requestPermission] = useCameraPermissions();
  const [galleryPermission, requestGalleryPermission] = MediaLibrary.usePermissions();

  const [photo, setPhoto] = useState<string | null>(null);
  const [facing, setFacing] = useState<"back" | "front">("back");

  const cameraRef = useRef<any>(null);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Aplikasi membutuhkan izin kamera</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Izinkan</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePhoto = async () => {
    if (cameraRef.current) {
      const result = await cameraRef.current.takePictureAsync();
      setPhoto(result.uri);
    }
  };

  const savePhoto = async () => {
    if (!photo) return;

    // Web : Download otomatis
    if (Platform.OS === "web") {
      const link = document.createElement("a");
      link.href = photo;
      link.download = "foto.jpg";
      link.click();
      alert("Foto berhasil di-download");
      return;
    }

    // Android/iOS : Simpan ke gallery
    if (!galleryPermission?.granted) {
      const perm = await requestGalleryPermission();
      if (!perm.granted) return;
    }

    await MediaLibrary.saveToLibraryAsync(photo);
    alert("Foto disimpan ke gallery");
  };

  const toggleCamera = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  return (
    <View style={styles.container}>

      {/* Jika belum ada foto, tampilkan kamera */}
      {!photo ? (
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
        >
          <View style={styles.actions}>

            {/* Ganti Kamera */}
            <TouchableOpacity onPress={toggleCamera}>
              <Ionicons name="camera-reverse-outline" size={40} color="#fff" />
            </TouchableOpacity>

            {/* Tombol Ambil Foto */}
            <TouchableOpacity onPress={takePhoto}>
              <Ionicons name="camera-outline" size={50} color="#fff" />
            </TouchableOpacity>

          </View>
        </CameraView>
      ) : (
        /* Jika sudah ambil foto → tampilkan preview */
        <View style={styles.previewContainer}>
          <Image source={{ uri: photo }} style={styles.preview} />

          <View style={styles.previewButtons}>
            <TouchableOpacity style={styles.btn} onPress={() => setPhoto(null)}>
              <Text style={styles.btnText}>Ambil Ulang</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btn} onPress={savePhoto}>
              <Text style={styles.btnText}>Simpan</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1, justifyContent: "flex-end" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { color: "#fff", marginBottom: 10 },
  btn: {
    backgroundColor: "#0056D2",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 10,
  },
  btnText: { color: "#fff", fontWeight: "bold" },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 25,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  previewContainer: { flex: 1, backgroundColor: "#000", padding: 10 },
  preview: { flex: 1, borderRadius: 12 },
  previewButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 15,
  },
});
