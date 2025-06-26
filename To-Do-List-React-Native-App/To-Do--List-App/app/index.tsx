import {
  FlatList,
  StyleSheet,
  Image,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Keyboard,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Checkbox } from "expo-checkbox";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState, useRef } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";

type ToDoType = {
  id: number;
  title: string;
  description: string;
  isDone: boolean;
  dueDate?: string;
};

export default function Index() {
  const inputRef = useRef<TextInput>(null);
  const [todos, setTodos] = useState<ToDoType[]>([]);
  const [todoText, setTodoText] = useState<string>("");
  const [todoDescription, setTodoDescription] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [oldTodos, setOldTodos] = useState<ToDoType[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editTodoId, setEditTodoId] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showError, setShowError] = useState(false);


  useEffect(() => {
    const getTodos = async () => {
      try {
        const todos = await AsyncStorage.getItem("my-todo");
        if (todos !== null) {
          const parsed = JSON.parse(todos);
          const sorted = sortTodosByDate(parsed);
          setTodos(sorted);
          setOldTodos(sorted);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getTodos();
  }, []);

  const addTodo = async () => {
    if (!todoText.trim()) return;
    try {
      const newTodo = {
        id: Date.now(),
        title: todoText.trim(),
        description: todoDescription.trim(),
        isDone: false,
        dueDate: dueDate ? dueDate.toISOString() : undefined,
      };
      const updatedTodos = sortTodosByDate([...todos, newTodo]);
      setTodos(updatedTodos);
      setOldTodos(updatedTodos);
      await AsyncStorage.setItem("my-todo", JSON.stringify(updatedTodos));
      setTodoText("");
      setTodoDescription("");
      Keyboard.dismiss();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      const newTodos = todos.filter((todo) => todo.id !== id);
      await AsyncStorage.setItem("my-todo", JSON.stringify(newTodos));
      setTodos(newTodos);
      setOldTodos(newTodos);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDone = async (id: number) => {
    try {
      const newTodos = todos.map((todo) => {
        if (todo.id === id) {
          todo.isDone = !todo.isDone;
        }
        return todo;
      });
      await AsyncStorage.setItem("my-todo", JSON.stringify(newTodos));
      setTodos(newTodos);
      setOldTodos(newTodos);
    } catch (error) {
      console.log(error);
    }
  };

  const onSearch = (query: string) => {
    if (query == "") {
      setTodos(oldTodos);
    } else {
      const filteredTodos = oldTodos.filter((todo) =>
        todo.title.toLowerCase().includes(query.toLowerCase())
      );
      setTodos(filteredTodos);
    }
  };

  const sortTodosByDate = (todoList: ToDoType[]) => {
    return [...todoList].sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  };

  useEffect(() => {
    onSearch(searchQuery);
  }, [searchQuery]);

  const saveEditedTodo = async () => {
    if (editTodoId === null || !todoText.trim()) return;

    try {
      const updatedTodos = todos.map((todo) => {
        if (todo.id === editTodoId) {
          return {
            ...todo,
            title: todoText.trim(),
            description: todoDescription.trim(),
            dueDate: dueDate ? dueDate.toISOString() : undefined,
          };
        }
        return todo;
      });
      const sortedTodos = sortTodosByDate(updatedTodos);
      setTodos(sortedTodos);
      setOldTodos(sortedTodos);
      await AsyncStorage.setItem("my-todo", JSON.stringify(updatedTodos));
      setTodoText("");
      setTodoDescription("");
      setIsEditing(false);
      setEditTodoId(null);
      Keyboard.dismiss();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            alert("Clicked!");
          }}
        >
          <Ionicons name="menu" size={24} color={"#333"} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            alert("Clicked!");
          }}
        >
          <Image
            source={{
              uri: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541",
            }}
            style={{ width: 40, height: 40, borderRadius: 20 }}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={24} color={"#333"}></Ionicons>
        <TextInput
          placeholder="Search"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
          style={styles.searchInput}
        ></TextInput>
      </View>

      <FlatList
        data={todos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ToDoItem
            todo={item}
            deleteTodo={deleteTodo}
            handleTodo={handleDone}
            onEdit={(todo) => {
              setIsEditing(true);
              setEditTodoId(todo.id);
              setTodoText(todo.title);
              setTodoDescription(todo.description);
              setDueDate(todo.dueDate ? new Date(todo.dueDate) : null);
              setModalVisible(true);
            }}
          />
        )}
      ></FlatList>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setModalVisible(false);
          setTodoText("");
          setTodoDescription("");
          setDueDate(null);
          setIsEditing(false);
          setEditTodoId(null);
          setDueDate(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {isEditing ? "Edit To-Do" : "Add To-Do"}
            </Text>

            <TextInput
              placeholder="Title"
              value={todoText}
              placeholderTextColor="#999"
              onChangeText={(text) => {
                setTodoText(text);
                if (showError && text.trim()) {
                  setShowError(false);
                }
              }}
              style={styles.modalInput}
              autoFocus
            />
            {showError && (
              <Text style={{ color: "red", marginBottom: 10 }}>
                Title is required.
              </Text>
            )}
            <TextInput
              placeholder="Description"
              value={todoDescription}
              placeholderTextColor="#999"
              onChangeText={(text) => setTodoDescription(text)}
              style={[styles.modalInput, { justifyContent: "center" }]}
              multiline
            />

            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={[styles.modalInput, { justifyContent: "center" }]}
            >
              <Text style={{ color: dueDate ? "#000" : "#999" }}>
                {dueDate ? dueDate.toDateString() : "Pick a due date"}
              </Text>
            </TouchableOpacity>
            {dueDate && (
              <TouchableOpacity
                onPress={() => setDueDate(null)}
                style={{ marginBottom: 15, alignSelf: "flex-end" }}
              >
                <Text style={{ color: "#ff3333" }}>Clear Due Date</Text>
              </TouchableOpacity>
            )}

            {showDatePicker && (
              <DateTimePicker
                value={dueDate || new Date()}
                mode="date"
                minimumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setDueDate(selectedDate);
                }}
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#aaa" }]}
                onPress={() => {
                  setModalVisible(false);
                  setTodoText("");
                  setTodoDescription("");
                  setIsEditing(false);
                  setEditTodoId(null);
                  setDueDate(null);
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  if (!todoText.trim()) {
                    setShowError(true);
                    return;
                  }
                  setShowError(false);
                  if (isEditing) {
                    saveEditedTodo();
                  } else {
                    addTodo();
                  }
                  setModalVisible(false);
                }}
              >
                <Text style={styles.modalButtonText}>
                  {isEditing ? "Update" : "Submit"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setIsEditing(false);
          setEditTodoId(null);
          setTodoText("");
          setTodoDescription("");
          setDueDate(null);
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={34} color={"#fff"} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const ToDoItem = ({
  todo,
  deleteTodo,
  handleTodo,
  onEdit,
}: {
  todo: ToDoType;
  deleteTodo: (id: number) => void;
  handleTodo: (id: number) => void;
  onEdit: (todo: ToDoType) => void;
}) => (
  <View style={styles.todoContainer}>
    <View style={styles.todoInfoContainer}>
      <Checkbox
        value={todo.isDone}
        onValueChange={() => handleTodo(todo.id)}
        color={todo.isDone ? "#4630EB" : undefined}
      />
      <View style={{ maxWidth: 250 }}>
        <Text
          style={[
            styles.todoText,
            todo.isDone && { textDecorationLine: "line-through" },
          ]}
        >
          {todo.title}
        </Text>
        <Text style={{ color: "#777", fontSize: 14 }}>{todo.description}</Text>
        {todo.dueDate && (
        <Text style={{ color: "#888", fontSize: 12, marginTop: 10 }}>
          {new Date(todo.dueDate).toDateString()}
        </Text>
      )}
      </View>
    </View>

    <View style={{ gap: 20 }}>
      <TouchableOpacity onPress={() => onEdit(todo)}>
        <Ionicons name="pencil" size={24} color={"#333"} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          Alert.alert(
            `Delete "${todo.title}"?`,
            "Are you sure you want to delete this task?",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Delete", style: "destructive", onPress: () => deleteTodo(todo.id) },
            ]
          );
        }}
      >
        <Ionicons name="trash" size={24} color={"red"} />
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#f5f5f5",
  },
  header: {
    marginBottom: 20,
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 10,
    gap: 10,
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  todoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 10,
    marginBottom: 10,
  },
  todoInfoContainer: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    flex: 1,
  },
  todoText: {
    fontSize: 16,
    color: "#333",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    overflow: "hidden",
  },
  newTodoInput: {
    backgroundColor: "#fff",
    flex: 1,
    padding: 16,
    borderRadius: 10,
    fontSize: 16,
    color: "#333",
  },
  addButton: {
    position: "absolute",
    right: 30,
    bottom: 50,
    backgroundColor: "#4630EB",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "90%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    backgroundColor: "#4630EB",
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
