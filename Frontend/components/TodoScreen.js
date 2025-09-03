import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet, Modal, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from '../utils/api';
import { useTheme } from '../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

function TodoScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    const user = await AsyncStorage.getItem('currentUser');
    const userId = await AsyncStorage.getItem('currentUserId');
    const email = await AsyncStorage.getItem('userEmail');
    console.log('Storage values:', { user, userId, email });
    if (user && userId) {
      setCurrentUser(user);
      setCurrentUserId(userId);
      setUserEmail(email || '');
      console.log('Initialized with user:', user, 'userId:', userId, 'email:', email);
  // prefer loading by numeric user id so todos match DB user_id
  await loadTodos(userId);
    } else {
      console.log('No user data found in storage, redirecting to login');
      navigation.replace('Login');
    }
  };

  const loadTodos = async (userParam) => {
    try {
      console.log('Loading todos for userParam:', userParam);
      // If userParam looks like a numeric id, query by user_id; otherwise use username
      let url;
      if (userParam && /^\d+$/.test(String(userParam))) {
        url = `${API_BASE}/api/todos?user_id=${encodeURIComponent(userParam)}`;
      } else {
        url = `${API_BASE}/api/todos?user=${encodeURIComponent(userParam)}`;
      }
      console.log('Fetching from URL:', url);
      const res = await fetch(url);
      console.log('Response status:', res.status);
      if (!res.ok) {
        const errorText = await res.text().catch(() => 'Unknown error');
        console.error('Server error response:', errorText);
        throw new Error(`Server returned ${res.status}: ${errorText}`);
      }
      const data = await res.json();
      console.log('Raw data from backend:', data);
      console.log('Data is array:', Array.isArray(data));
      console.log('Data length:', data?.length || 0);
      
      // Normalize is_completed to completed for frontend compatibility
      const normalizedData = Array.isArray(data) ? data.map(todo => ({
        ...todo,
        completed: todo.is_completed || todo.completed || 0,
        priority: todo.priority ? todo.priority.toLowerCase() : 'medium', // normalize priority to lowercase for display
        text: todo.title || todo.text || '', // ensure text field exists for compatibility
        title: todo.title || todo.text || '' // ensure title field exists
      })) : [];
      
      console.log('Normalized data:', normalizedData);
  console.log('Setting todos with length:', normalizedData.length);
  setTodos(normalizedData);
    } catch (err) {
      console.error('Error loading todos from backend:', err);
      Alert.alert('Error', `Could not load todos from server: ${err.message}`);
    }
  };

  const addTodo = () => {
    if (taskTitle.trim() === '') {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }
    
    const tempId = `temp-${Date.now()}`;
    const tempTodo = { 
      id: tempId, 
      text: taskTitle.trim(), // Display the title for now
      title: taskTitle.trim(),
      description: taskDescription.trim(),
      completed: 0, 
      user_id: currentUserId,
      priority: taskPriority
    };
    setTodos(prev => [tempTodo, ...prev]);
    
    // Reset form and close modal
    setTaskTitle('');
    setTaskDescription('');
    setTaskPriority('medium');
    setIsModalVisible(false);

    (async () => {
      try {
        console.log('Creating todo with data:', { 
          title: taskTitle.trim(), 
          description: taskDescription.trim() || null,
          priority: taskPriority,
          user_id: currentUserId 
        });
        const res = await fetch(`${API_BASE}/api/todos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            title: taskTitle.trim(), 
            description: taskDescription.trim() || null,
            priority: taskPriority,
            user_id: currentUserId 
          })
        });
        console.log('Create todo response status:', res.status);
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const created = await res.json().catch(() => null);
        console.log('Created todo response:', created);
        if (created && created.id) {
          // Normalize is_completed to completed for frontend compatibility
          const normalizedCreated = {
            ...created,
            completed: created.is_completed || created.completed || 0,
            priority: created.priority ? created.priority.toLowerCase() : 'medium', // normalize priority to lowercase for display
            text: created.title || created.text || '', // ensure text field exists for compatibility
            title: created.title || created.text || '' // ensure title field exists
          };
          setTodos(prev => prev.map(t => (t.id === tempId ? normalizedCreated : t)));
        } else {
          await loadTodos(currentUserId);
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
          body: JSON.stringify({ is_completed: completed ? 0 : 1 })
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
    (todo.title || todo.text || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item, index }) => (
    <View style={styles.todoCard}>
      <View style={styles.todoHeader}>
        <View style={styles.priorityContainer}>
          <View style={[styles.priorityBadge, item.completed ? styles.completedBadge : styles.activeBadge]}>
            <Text style={styles.priorityText}>{item.completed ? 'Done' : 'Active'}</Text>
          </View>
          <Text style={styles.progressText}>{item.completed ? '100%' : '0%'}</Text>
        </View>
      </View>
      
      <TouchableOpacity onPress={() => toggleCompleted(item.id, item.completed)}>
        <Text style={styles.todoTitle}>{item.text}</Text>
        <Text style={styles.todoTime}>Created: {new Date().toLocaleDateString()}</Text>
      </TouchableOpacity>
      
      <View style={styles.todoFooter}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{currentUser.charAt(0).toUpperCase()}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.deleteButton} onPress={() => deleteTodo(item.id)}>
          <Text style={styles.deleteText}>×</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.greeting}>Hello {currentUser.split('@')[0]} 👋</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={() => loadTodos(currentUserId)}>
            <Text style={styles.refreshIcon}>⟲</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <Text style={styles.headerTitle}>Manage Your{'\n'}Daily Task</Text>
        
        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statCard1]}>
            <View style={styles.statIcon}>
              <Text style={styles.statIconText}>📱</Text>
            </View>
            <Text style={styles.statTitle}>Mobile</Text>
            <Text style={styles.statCount}>{todos.filter(t => !t.completed).length} Tasks</Text>
          </View>
          
          <View style={[styles.statCard, styles.statCard2]}>
            <View style={styles.statIcon}>
              <Text style={styles.statIconText}>☀️</Text>
            </View>
            <Text style={styles.statTitle}>Completed</Text>
            <Text style={styles.statCount}>{todos.filter(t => t.completed).length} Tasks</Text>
          </View>
          
          <View style={[styles.statCard, styles.statCard3]}>
            <View style={styles.statIcon}>
              <Text style={styles.statIconText}>🎯</Text>
            </View>
            <Text style={styles.statTitle}>Website</Text>
            <Text style={styles.statCount}>{todos.length} Tasks</Text>
          </View>
          
          <View style={[styles.statCard, styles.statCard4]}>
            <View style={styles.statIcon}>
              <Text style={styles.statIconText}>🌐</Text>
            </View>
            <Text style={styles.statTitle}>Total</Text>
            <Text style={styles.statCount}>{todos.length} Tasks</Text>
          </View>
        </View>

        {/* Ongoing Section */}
        <View style={styles.ongoingSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ongoing</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {/* Todo Items */}
          {filteredTodos.length > 0 ? (
            filteredTodos.map((item, index) => (
              <View key={item.id.toString()} style={styles.todoCard}>
                <View style={styles.todoHeader}>
                  <View style={styles.priorityContainer}>
                    <View style={[styles.priorityBadge, item.completed ? styles.completedBadge : styles.activeBadge]}>
                      <Text style={styles.priorityText}>{item.completed ? 'Done' : 'Active'}</Text>
                    </View>
                    <Text style={styles.progressText}>{item.completed ? '100%' : '0%'}</Text>
                  </View>
                </View>
                
                <TouchableOpacity onPress={() => toggleCompleted(item.id, item.completed)}>
                  <Text style={styles.todoTitle}>{item.title || item.text}</Text>
                  {item.description && item.description.trim() && (
                    <Text style={styles.todoDescription}>{item.description}</Text>
                  )}
                  {item.priority && (
                    <Text style={styles.todoPriority}>Priority: {item.priority}</Text>
                  )}
                  <Text style={styles.todoTime}>Created: {new Date().toLocaleDateString()}</Text>
                </TouchableOpacity>
                
                <View style={styles.todoFooter}>
                  <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{currentUser.charAt(0).toUpperCase()}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => deleteTodo(item.id)}>
                    <Text style={styles.deleteText}>×</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tasks yet</Text>
              <Text style={styles.emptySubtext}>Add your first task</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* Add Task Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient 
              colors={['#f8f9fa', '#e3f2fd', '#fce4ec']}
              locations={[0, 0.6, 1]}
              style={styles.modalGradient}
            >
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create New Task</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>

              {/* Modal Form */}
              <View style={styles.modalForm}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Task Title *</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={taskTitle}
                    onChangeText={setTaskTitle}
                    placeholder="Enter task title"
                    placeholderTextColor="#9ca3af"
                    multiline={false}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Description (Optional)</Text>
                  <TextInput
                    style={[styles.modalInput, styles.descriptionInput]}
                    value={taskDescription}
                    onChangeText={setTaskDescription}
                    placeholder="Add more details about your task"
                    placeholderTextColor="#9ca3af"
                    multiline={true}
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Priority</Text>
                  <View style={styles.priorityButtons}>
                    <TouchableOpacity
                      style={[
                        styles.priorityButton,
                        taskPriority === 'low' && styles.priorityButtonActive
                      ]}
                      onPress={() => setTaskPriority('low')}
                    >
                      <Text style={[
                        styles.priorityButtonText,
                        taskPriority === 'low' && styles.priorityButtonTextActive
                      ]}>Low</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.priorityButton,
                        taskPriority === 'medium' && styles.priorityButtonActive
                      ]}
                      onPress={() => setTaskPriority('medium')}
                    >
                      <Text style={[
                        styles.priorityButtonText,
                        taskPriority === 'medium' && styles.priorityButtonTextActive
                      ]}>Medium</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.priorityButton,
                        taskPriority === 'high' && styles.priorityButtonActive
                      ]}
                      onPress={() => setTaskPriority('high')}
                    >
                      <Text style={[
                        styles.priorityButtonText,
                        taskPriority === 'high' && styles.priorityButtonTextActive
                      ]}>High</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Modal Buttons */}
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setTaskTitle('');
                      setTaskDescription('');
                      setTaskPriority('medium');
                      setIsModalVisible(false);
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.createButton}
                    onPress={addTodo}
                  >
                    <Text style={styles.createButtonText}>Create Task</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* Hidden input removed - no longer needed */}

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tabItem, styles.activeTab]}>
          <View style={styles.tabIconContainer}>
            <Text style={styles.tabIcon}>🏠</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <View style={styles.tabIconContainer}>
            <Text style={styles.tabIcon}>📊</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <View style={styles.tabIconContainer}>
            <Text style={styles.tabIcon}>💬</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Profile', { userEmail })}>
          <View style={styles.tabIconContainer}>
            <Text style={styles.tabIcon}>👤</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 120, // Add padding for the fixed tab bar and add button
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    lineHeight: 34,
    marginBottom: 30,
  },
  greeting: {
    fontSize: 16,
    color: '#6b7280',
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  refreshIcon: {
    color: '#6b7280',
    fontSize: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 30,
    gap: 12,
  },
  statCard: {
    borderRadius: 16,
    padding: 16,
    minHeight: 100,
    justifyContent: 'space-between',
  },
  statCard1: {
    backgroundColor: '#e0e7ff',
    width: '48%',
  },
  statCard2: {
    backgroundColor: '#dcfce7',
    width: '48%',
  },
  statCard3: {
    backgroundColor: '#fef3c7',
    width: '48%',
  },
  statCard4: {
    backgroundColor: '#fecaca',
    width: '48%',
  },
  statIcon: {
    marginBottom: 8,
  },
  statIconText: {
    fontSize: 24,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  statCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  ongoingSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  seeAllText: {
    fontSize: 14,
    color: '#6b7280',
  },
  todoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  todoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#ef4444',
  },
  completedBadge: {
    backgroundColor: '#22c55e',
  },
  priorityText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  progressText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
  todoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  todoDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  todoPriority: {
    fontSize: 12,
    color: '#8b5cf6',
    fontWeight: '600',
    marginBottom: 4,
  },
  todoTime: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
  },
  todoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarContainer: {
    flexDirection: 'row',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute',
    bottom: 110, // Position above the tab bar
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#f59e0b',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalGradient: {
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  closeButtonText: {
    color: '#374151',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalForm: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  descriptionInput: {
    minHeight: 80,
    maxHeight: 120,
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'white',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  priorityButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  priorityButtonTextActive: {
    color: '#ffffff',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  createButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  activeTab: {
    backgroundColor: 'transparent',
  },
  tabIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIcon: {
    fontSize: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
});

export default TodoScreen;
