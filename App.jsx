import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:8080/api/tasks';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('MEDIUM');
  const [loading, setLoading] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editPriority, setEditPriority] = useState('MEDIUM');
  const [sortBy, setSortBy] = useState('date');
  const [searchTerm, setSearchTerm] = useState('');
  const [newTaskReminder, setNewTaskReminder] = useState(false);

  
  const loadTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setTasks(response.data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
    setLoading(false);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask = {
      title: newTaskTitle,
      description: newTaskDescription,
      status: 'PENDING',
      dueDate: newTaskDueDate || null,
      priority: newTaskPriority,
      reminderSent: false 
    };

    try {
      const response = await axios.post(API_URL, newTask);
      setTasks([...tasks, response.data]);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskDueDate('');
      setNewTaskPriority('MEDIUM');
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTasks(tasks.filter(task => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleUpdateStatus = async (id, currentStatus) => {
    const task = tasks.find(t => t.id === id);
    const newStatus = currentStatus === 'PENDING' ? 'COMPLETED' : 'PENDING';
    
    try {
      const response = await axios.put(`${API_URL}/${id}`, { ...task, status: newStatus });
      setTasks(tasks.map(t => t.id === id ? response.data : t));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const startEditing = (task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditDueDate(task.dueDate ? task.dueDate.slice(0, 16) : '');
    setEditPriority(task.priority || 'MEDIUM');
  };

  const saveEdit = async () => {
    if (!editTitle.trim()) return;
    
    const updatedTask = {
      ...editingTask,
      title: editTitle,
      description: editDescription,
      dueDate: editDueDate || null,
      priority: editPriority
    };
    
    try {
      const response = await axios.put(`${API_URL}/${editingTask.id}`, updatedTask);
      setTasks(tasks.map(t => t.id === editingTask.id ? response.data : t));
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const getFilteredAndSortedTasks = () => {
    let filtered = tasks.filter(task => 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    if (sortBy === 'date') {
      filtered.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    } else if (sortBy === 'status') {
      filtered.sort((a, b) => {
        if (a.status === 'PENDING' && b.status === 'COMPLETED') return -1;
        if (a.status === 'COMPLETED' && b.status === 'PENDING') return 1;
        return 0;
      });
    } else if (sortBy === 'priority') {
      const priorityOrder = { 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
      filtered.sort((a, b) => {
        return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
      });
    }
    
    return filtered;
  };
  const getCompletionPercentage = () => {
  if (tasks.length === 0) return 0;
  const completedCount = tasks.filter(task => task.status === 'COMPLETED').length;
  return Math.round((completedCount / tasks.length) * 100);
};
const [reminderMessage, setReminderMessage] = useState('');

const checkDueReminders = () => {
  const now = new Date();
  const tasksWithReminders = tasks.filter(task => 
    task.dueDate && 
    !task.reminderSent && 
    task.status !== 'COMPLETED'
  );
  
  const upcomingTasks = tasksWithReminders.filter(task => {
    const dueDate = new Date(task.dueDate);
    const hoursUntilDue = (dueDate - now) / (1000 * 60 * 60);
    return hoursUntilDue <= 24 && hoursUntilDue > 0;
  });
  
  if (upcomingTasks.length > 0 && reminderMessage === '') {
    setReminderMessage(`⚠️ You have ${upcomingTasks.length} task(s) due within 24 hours!`);
    setTimeout(() => setReminderMessage(''), 5000);
  }
};

  return (
    <div className="App">
      <h1>TaskFlow - Task Management</h1>
      

{reminderMessage && (
  <div className="reminder-banner">
    {reminderMessage}
  </div>
)}

<div className="progress-section">
  <div className="progress-label">
    <span>Overall Progress</span>
    <span>{getCompletionPercentage()}% Complete</span>
  </div>
  <div className="progress-bar-container">
    <div 
      className="progress-bar-fill" 
      style={{ width: `${getCompletionPercentage()}%` }}
    ></div>
  </div>
  <div className="progress-stats">
    <span>✅ Completed: {tasks.filter(t => t.status === 'COMPLETED').length}</span>
    <span>⏳ Pending: {tasks.filter(t => t.status === 'PENDING').length}</span>
    <span>📋 Total: {tasks.length}</span>
  </div>
</div>
      
      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Search tasks by title or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="clear-search">
            ✕ Clear
          </button>
        )}
      </div>

      <form onSubmit={handleCreateTask} className="task-form">
        <input
          type="text"
          placeholder="Task title"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={newTaskDescription}
          onChange={(e) => setNewTaskDescription(e.target.value)}
        />
        <input
          type="datetime-local"
          placeholder="Due date (optional)"
          value={newTaskDueDate}
          onChange={(e) => setNewTaskDueDate(e.target.value)}
        />
        <select
          value={newTaskPriority}
          onChange={(e) => setNewTaskPriority(e.target.value)}
        >
          <option value="LOW">🟢 Low Priority</option>
          <option value="MEDIUM">🟡 Medium Priority</option>
          <option value="HIGH">🔴 High Priority</option>
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
  <input
    type="checkbox"
    checked={newTaskReminder}
    onChange={(e) => setNewTaskReminder(e.target.checked)}
  />
  🔔 Set Reminder
</label>
        <button type="submit">Add Task</button>
      </form>

      {loading && <p>Loading tasks...</p>}

      <div className="task-list">
        <h2>Your Tasks</h2>
        <div className="sort-buttons">
          <button className={sortBy === 'date' ? 'active' : ''} onClick={() => setSortBy('date')}>
            Sort by Due Date
          </button>
          <button className={sortBy === 'status' ? 'active' : ''} onClick={() => setSortBy('status')}>
            Sort by Status
          </button>
          <button className={sortBy === 'priority' ? 'active' : ''} onClick={() => setSortBy('priority')}>
            Sort by Priority
          </button>
        </div>
        
        {tasks.length === 0 && !loading && <p>No tasks yet. Add one above!</p>}
        {searchTerm && getFilteredAndSortedTasks().length === 0 && !loading && <p>No tasks match "{searchTerm}"</p>}
        
        {getFilteredAndSortedTasks().map(task => (
          editingTask?.id === task.id ? (
            <div key={task.id} className="task-item editing">
              <div className="edit-form">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Task title"
                />
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Description"
                />
                <input
                  type="datetime-local"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                />
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                >
                  <option value="LOW">🟢 Low Priority</option>
                  <option value="MEDIUM">🟡 Medium Priority</option>
                  <option value="HIGH">🔴 High Priority</option>
                </select>
                <div className="edit-buttons">
                  <button onClick={saveEdit}>Save</button>
                  <button onClick={() => setEditingTask(null)}>Cancel</button>
                </div>
              </div>
            </div>
          ) : (
            <div key={task.id} className={`task-item ${task.status.toLowerCase()}`}>
              <div className="task-content">
                <h3>
                  {task.title}
                  {task.priority && (
                    <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
                      {task.priority === 'LOW' && '🟢 Low'}
                      {task.priority === 'MEDIUM' && '🟡 Medium'}
                      {task.priority === 'HIGH' && '🔴 High'}
                    </span>
                  )}
                </h3>
                {task.description && <p>{task.description}</p>}
                {task.dueDate && <small>Due: {new Date(task.dueDate).toLocaleString()}</small>}
                <small>Status: {task.status}</small>
              </div>
              <div className="task-actions">
                <button onClick={() => startEditing(task)}>Edit</button>
                <button onClick={() => handleUpdateStatus(task.id, task.status)}>
                  Mark {task.status === 'PENDING' ? 'Complete' : 'Pending'}
                </button>
                <button onClick={() => handleDeleteTask(task.id)} className="delete">
                  Delete
                </button>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

export default App;