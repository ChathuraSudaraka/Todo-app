import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet, Animated, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from '../utils/api';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

const { width } = Dimensions.get('window');

function TodoScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(width));

  useEffect(() => {
    initializeApp();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const initializeApp = async () => {
    const user = await AsyncStorage.getItem('currentUser');
    const userId = await AsyncStorage.getItem('currentUserId');
    if (user && userId) {
      setCurrentUser(user);
      setCurrentUserId(userId);
      await loadTodos(user);
    } else {
      navigation.replace('Login');
    }
  };

  const loadTodos = async (userId) => {
    try {
      const res = await fetch(`${API_BASE}/api/todos?user=${encodeURIComponent(userId)}`);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setTodos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading todos from backend:', err);
      Alert.alert('Error', 'Could not load todos from server');
    }
  };

  const addTodo = () => {
    if (newTodo.trim() === '') {
      Alert.alert('Error', 'Please enter a todo');
      return;
    }
    const tempId = `temp-${Date.now()}`;
    const tempTodo = { id: tempId, text: newTodo, completed: 0, user_id: currentUserId };
    setTodos(prev => [tempTodo, ...prev]);
    setNewTodo('');

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/todos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: newTodo, user_id: currentUserId })
        });
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const created = await res.json().catch(() => null);
        if (created && created.id) {
          setTodos(prev => prev.map(t => (t.id === tempId ? created : t)));
        } else {
          await loadTodos(currentUser);
        }
      } catch (err) {
        console.error('Error adding todo to backend:', err);
        setTodos(prev => prev.filter(t => t.id !== tempId));
        Alert.alert('Error', 'Could not add todo');
      }
    })();
  };

  const deleteTodo = (id) => {
    const prev = todos;
    setTodos(prevList => prevList.filter(t => t.id !== id));
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/todos/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
      } catch (err) {
        console.error('Error deleting todo on backend:', err);
        setTodos(prev);
        Alert.alert('Error', 'Could not delete todo');
      }
    })();
  };

  const toggleCompleted = (id, completed) => {
    const prev = todos;
    setTodos(prevList => prevList.map(t => (t.id === id ? { ...t, completed: completed ? 0 : 1 } : t)));
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/todos/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed: completed ? 0 : 1 })
        });
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
      } catch (err) {
        console.error('Error updating todo on backend:', err);
        setTodos(prev);
        Alert.alert('Error', 'Could not update todo');
      }
    })();
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('currentUser');
            await AsyncStorage.removeItem('currentUserId');
            navigation.replace('Login');
          }
        }
      ]
    );
  };

  const filteredTodos = todos.filter(todo =>
    todo.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item, index }) => (
    <Animated.View
      style={[
        styles.todoCard,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.cardBorder,
          shadowColor: colors.shadowColor,
          shadowOpacity: colors.shadowOpacity,
          transform: [{ translateX: slideAnim }],
          opacity: fadeAnim,
        }
      ]}
    >
      <View style={styles.todoContent}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => toggleCompleted(item.id, item.completed)}
        >
          <View style={[styles.checkbox, { borderColor: colors.textSecondary }, item.completed && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
            {item.completed ? (
              <Ionicons name="checkmark" size={16} color={colors.textInverse} />
            ) : null}
          </View>
        </TouchableOpacity>

        <View style={styles.todoTextContainer}>
          <Text style={[styles.todoText, { color: colors.text }, item.completed && { color: colors.textTertiary, textDecorationLine: 'line-through' }]}>
            {item.text}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteTodo(item.id)}
        >
          <MaterialIcons name="delete" size={24} color={colors.error} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.welcome, { color: colors.textInverse }]}>Hello, {currentUser}!</Text>
            <Text style={[styles.subtitle, { color: colors.textInverse, opacity: 0.8 }]}>Let's organize your day</Text>
          </View>
          <View style={styles.headerActions}>
            <ThemeToggle style={{ marginRight: 15 }} />
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color={colors.textInverse} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="add-circle" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="What needs to be done?"
                placeholderTextColor={colors.inputPlaceholder}
                value={newTodo}
                onChangeText={setNewTodo}
                onSubmitEditing={addTodo}
                returnKeyType="done"
              />
            </View>
            <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]} onPress={addTodo}>
              <Ionicons name="add" size={24} color={colors.textInverse} />
            </TouchableOpacity>
          </View>

          <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search todos..."
              placeholderTextColor={colors.inputPlaceholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{todos.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: colors.success }]}>{todos.filter(t => t.completed).length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Done</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: colors.warning }]}>{todos.filter(t => !t.completed).length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending</Text>
          </View>
        </View>

        <FlatList
          data={filteredTodos}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color={colors.textTertiary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No todos yet</Text>
              <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>Add your first task above</Text>
            </View>
          }
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputSection: {
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginRight: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  addButton: {
    borderRadius: 15,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  statItem: {
    alignItems: 'center',
    borderRadius: 15,
    padding: 15,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 5,
  },
  list: {
    flex: 1,
  },
  todoCard: {
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
  },
  todoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  checkboxContainer: {
    marginRight: 15,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
  },
  todoTextContainer: {
    flex: 1,
  },
  todoText: {
    fontSize: 16,
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
  deleteButton: {
    padding: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 5,
  },
});

export default TodoScreen;
