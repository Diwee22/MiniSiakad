import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function TaskCrud() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const data = await AsyncStorage.getItem("tasks");
    if (data) setTasks(JSON.parse(data));
  };

  const addTask = async () => {
    if (!taskTitle) return;

    const newTask = {
      id: Date.now().toString(),
      title: taskTitle,
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks));
    setTaskTitle("");
  };

  const deleteTask = async (id: string) => {
    const updatedTasks = tasks.filter(item => item.id !== id);
    setTasks(updatedTasks);
    await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks));
  };

  const updateTask = async () => {
    const updatedTasks = tasks.map(item =>
      item.id === editId ? { ...item, title: taskTitle } : item
    );

    setTasks(updatedTasks);
    await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks));
    setModalVisible(false);
    setTaskTitle("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tugas / Pertemuan</Text>

      <TextInput
        placeholder="Tambah tugas..."
        value={taskTitle}
        onChangeText={setTaskTitle}
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={addTask}>
        <Text style={{ color: "#fff" }}>Tambah</Text>
      </TouchableOpacity>

      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <Text>{item.title}</Text>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={() => {
                  setEditId(item.id);
                  setTaskTitle(item.title);
                  setModalVisible(true);
                }}
              >
                <Ionicons name="create-outline" size={20} color="#0056D2" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => deleteTask(item.id)}>
                <Ionicons name="trash-outline" size={20} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* MODAL UPDATE */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
              Edit Tugas
            </Text>

            <TextInput
              value={taskTitle}
              onChangeText={setTaskTitle}
              style={styles.input}
            />

            <TouchableOpacity style={styles.button} onPress={updateTask}>
              <Text style={{ color: "#fff" }}>Update</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ marginTop: 10, color: "red" }}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", marginTop: 20 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#0056D2",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  taskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
});
