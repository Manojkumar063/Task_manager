// src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks');
      setTasks(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch tasks');
      setLoading(false);
    }
  };

  // Add new task
  const addTask = async (taskData) => {
    try {
      const response = await axios.post('/api/tasks', taskData);
      setTasks([response.data, ...tasks]);
    } catch (err) {
      setError('Failed to add task');
    }
  };

  // Update task
  const updateTask = async (id, taskData) => {
    try {
      const response = await axios.put(`/api/tasks/${id}`, taskData);
      setTasks(tasks.map(task => task._id === id ? response.data : task));
    } catch (err) {
      setError('Failed to update task');
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    try {
      await axios.delete(`/api/tasks/${id}`);
      setTasks(tasks.filter(task => task._id !== id));
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  // Toggle task completion
  const toggleComplete = async (id, completed) => {
    await updateTask(id, { completed: !completed });
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  if (loading) return <div className="loading">Loading tasks...</div>;

  return (
    <div className="App">
      <header className="App-header">
        <h1>📝 Task Manager</h1>
        <p>Built with MERN Stack</p>
      </header>

      <main className="main-content">
        {error && <div className="error-message">{error}</div>}
        
        <TaskForm onAddTask={addTask} />
        
        <TaskList 
          tasks={tasks}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
          onToggleComplete={toggleComplete}
        />
      </main>
    </div>
  );
}

export default App;