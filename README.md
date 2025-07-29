# MERN Stack Task Manager

A complete end-to-end task management application built with MongoDB, Express.js, React.js, and Node.js.

## Project Structure
```
task-manager/
├── backend/
│   ├── models/
│   │   └── Task.js
│   ├── routes/
│   │   └── tasks.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TaskForm.js
│   │   │   ├── TaskList.js
│   │   │   └── TaskItem.js
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   │   └── index.html
│   └── package.json
└── README.md
```

## Backend Setup (Node.js + Express.js + MongoDB)

### 1. Backend Package.json
```json
{
  "name": "task-manager-backend",
  "version": "1.0.0",
  "description": "Task Manager Backend API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### 2. Server.js (Express.js Server)
```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanager', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Routes
const taskRoutes = require('./routes/tasks');
app.use('/api/tasks', taskRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Task Manager API is running!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

### 3. Task Model (MongoDB Schema)
```javascript
// models/Task.js
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
TaskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Task', TaskSchema);
```

### 4. API Routes (Express.js Routes)
```javascript
// routes/tasks.js
const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// GET all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single task
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE new task
router.post('/', async (req, res) => {
  const task = new Task({
    title: req.body.title,
    description: req.body.description,
    priority: req.body.priority || 'medium'
  });

  try {
    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE task
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.completed = req.body.completed !== undefined ? req.body.completed : task.completed;
    task.priority = req.body.priority || task.priority;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
```

## Frontend Setup (React.js)

### 1. Frontend Package.json
```json
{
  "name": "task-manager-frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.5.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "proxy": "http://localhost:5000",
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```

### 2. Main App Component
```jsx
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
```

### 3. Task Form Component
```jsx
// src/components/TaskForm.js
import React, { useState } from 'react';

const TaskForm = ({ onAddTask }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.trim() && formData.description.trim()) {
      onAddTask(formData);
      setFormData({
        title: '',
        description: '',
        priority: 'medium'
      });
    }
  };

  return (
    <div className="task-form-container">
      <h2>Add New Task</h2>
      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter task title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter task description"
            rows="3"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="priority">Priority:</label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <button type="submit" className="submit-btn">
          Add Task
        </button>
      </form>
    </div>
  );
};

export default TaskForm;
```

### 4. Task List Component
```jsx
// src/components/TaskList.js
import React from 'react';
import TaskItem from './TaskItem';

const TaskList = ({ tasks, onUpdateTask, onDeleteTask, onToggleComplete }) => {
  if (tasks.length === 0) {
    return (
      <div className="task-list-container">
        <h2>Your Tasks</h2>
        <p className="no-tasks">No tasks yet. Add one above!</p>
      </div>
    );
  }

  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);

  return (
    <div className="task-list-container">
      <h2>Your Tasks ({tasks.length})</h2>
      
      {pendingTasks.length > 0 && (
        <div className="task-section">
          <h3>Pending Tasks ({pendingTasks.length})</h3>
          <div className="task-list">
            {pendingTasks.map(task => (
              <TaskItem
                key={task._id}
                task={task}
                onUpdateTask={onUpdateTask}
                onDeleteTask={onDeleteTask}
                onToggleComplete={onToggleComplete}
              />
            ))}
          </div>
        </div>
      )}

      {completedTasks.length > 0 && (
        <div className="task-section">
          <h3>Completed Tasks ({completedTasks.length})</h3>
          <div className="task-list">
            {completedTasks.map(task => (
              <TaskItem
                key={task._id}
                task={task}
                onUpdateTask={onUpdateTask}
                onDeleteTask={onDeleteTask}
                onToggleComplete={onToggleComplete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
```

### 5. Task Item Component
```jsx
// src/components/TaskItem.js
import React, { useState } from 'react';

const TaskItem = ({ task, onUpdateTask, onDeleteTask, onToggleComplete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description,
    priority: task.priority
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdateTask(task._id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      title: task.title,
      description: task.description,
      priority: task.priority
    });
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  const getPriorityClass = (priority) => {
    return `priority priority-${priority}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`}>
      {isEditing ? (
        <div className="task-edit">
          <input
            type="text"
            name="title"
            value={editData.title}
            onChange={handleChange}
            className="edit-title"
          />
          <textarea
            name="description"
            value={editData.description}
            onChange={handleChange}
            className="edit-description"
            rows="2"
          />
          <select
            name="priority"
            value={editData.priority}
            onChange={handleChange}
            className="edit-priority"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <div className="edit-actions">
            <button onClick={handleSave} className="save-btn">Save</button>
            <button onClick={handleCancel} className="cancel-btn">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="task-content">
          <div className="task-header">
            <h3 className={task.completed ? 'completed-text' : ''}>{task.title}</h3>
            <span className={getPriorityClass(task.priority)}>
              {task.priority.toUpperCase()}
            </span>
          </div>
          
          <p className={`task-description ${task.completed ? 'completed-text' : ''}`}>
            {task.description}
          </p>
          
          <div className="task-meta">
            <small>Created: {formatDate(task.createdAt)}</small>
            {task.updatedAt !== task.createdAt && (
              <small>Updated: {formatDate(task.updatedAt)}</small>
            )}
          </div>

          <div className="task-actions">
            <button
              onClick={() => onToggleComplete(task._id, task.completed)}
              className={`toggle-btn ${task.completed ? 'mark-pending' : 'mark-complete'}`}
            >
              {task.completed ? '↶ Mark Pending' : '✓ Mark Complete'}
            </button>
            <button onClick={handleEdit} className="edit-btn">Edit</button>
            <button 
              onClick={() => onDeleteTask(task._id)} 
              className="delete-btn"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskItem;
```

### 6. CSS Styles
```css
/* src/App.css */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background-color: #f5f5f5;
  color: #333;
  line-height: 1.6;
}

.App {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.App-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.App-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.main-content {
  display: grid;
  gap: 30px;
}

.loading {
  text-align: center;
  font-size: 1.2rem;
  color: #666;
  margin: 50px 0;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 15px;
  border-radius: 5px;
  border: 1px solid #fcc;
  margin-bottom: 20px;
  text-align: center;
}

/* Task Form Styles */
.task-form-container {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.task-form-container h2 {
  color: #333;
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.task-form {
  display: grid;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 5px;
  color: #555;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.submit-btn:hover {
  transform: translateY(-2px);
}

/* Task List Styles */
.task-list-container {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.task-list-container h2 {
  color: #333;
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.no-tasks {
  text-align: center;
  color: #666;
  font-style: italic;
  margin: 40px 0;
}

.task-section {
  margin-bottom: 30px;
}

.task-section h3 {
  color: #555;
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.task-list {
  display: grid;
  gap: 15px;
}

/* Task Item Styles */
.task-item {
  background: #fafafa;
  border: 2px solid #eee;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s;
}

.task-item:hover {
  border-color: #ddd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.task-item.completed {
  background: #f8f9ff;
  border-color: #c8d8ff;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.task-header h3 {
  color: #333;
  font-size: 1.1rem;
}

.completed-text {
  text-decoration: line-through;
  opacity: 0.7;
}

.priority {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.priority-low {
  background: #e8f5e8;
  color: #2d5a2d;
}

.priority-medium {
  background: #fff3cd;
  color: #856404;
}

.priority-high {
  background: #f8d7da;
  color: #721c24;
}

.task-description {
  color: #666;
  margin-bottom: 15px;
  line-height: 1.5;
}

.task-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.task-meta small {
  color: #888;
  font-size: 0.85rem;
}

.task-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.task-actions button {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn.mark-complete {
  background: #28a745;
  color: white;
}

.toggle-btn.mark-pending {
  background: #ffc107;
  color: #333;
}

.edit-btn {
  background: #17a2b8;
  color: white;
}

.delete-btn {
  background: #dc3545;
  color: white;
}

.task-actions button:hover {
  transform: translateY(-1px);
  opacity: 0.9;
}

/* Edit Form Styles */
.task-edit {
  display: grid;
  gap: 10px;
}

.edit-title,
.edit-description,
.edit-priority {
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.edit-actions {
  display: flex;
  gap: 10px;
}

.save-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
}

/* Responsive Design */
@media (max-width: 768px) {
  .App {
    padding: 10px;
  }
  
  .App-header h1 {
    font-size: 2rem;
  }
  
  .task-actions {
    flex-direction: column;
  }
  
  .task-actions button {
    width: 100%;
  }
  
  .task-meta {
    flex-direction: column;
    gap: 5px;
  }
}
```

### 7. HTML Template
```html
<!-- public/index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Task Manager built with MERN Stack" />
    <title>MERN Task Manager</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
```

### 8. React Entry Point
```jsx
// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

## Environment Setup

### 1. Backend .env file
```
MONGODB_URI=mongodb://localhost:27017/taskmanager
PORT=5000
NODE_ENV=development
```

## Installation & Running Instructions

### Backend Setup:
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start MongoDB (make sure MongoDB is installed)
mongod

# Run the server
npm run dev  # For development with nodemon
# or
npm start    # For production
```

### Frontend Setup:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the React app
npm start
```

## Key Features Demonstrated

### MongoDB:
- Document-based data storage
- Mongoose ODM for schema definition
- CRUD operations
- Data validation and middleware

### Express.js:
- RESTful API endpoints
- Middleware for CORS and JSON parsing
- Error handling
- Route organization

### React.js:
- Component-based architecture
- State management with hooks
- Form handling and validation
- Conditional rendering
- Event handling

### Node.js:
- Server-side JavaScript runtime
- Package management with npm
- Environment variables
- Asynchronous operations

## API Endpoints

- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## Database Schema

```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String (required),
  completed: Boolean (default: false),
  priority: String (enum: ['low', 'medium', 'high']),
  createdAt: Date,
  updatedAt: Date
}
```

This complete MERN stack application demonstrates all four technologies working together to create a functional task management system with full CRUD operations, responsive design, and real-time updates.