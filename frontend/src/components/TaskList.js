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