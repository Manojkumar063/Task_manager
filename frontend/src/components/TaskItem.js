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