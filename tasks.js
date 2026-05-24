/* ==========================================================================
   JARVIS NEURAL INTERFACE - AGENDA & TASKS CONTROLLER
   ========================================================================== */

import { appendSystemTerminalMessage, playClickSound } from './app.js';

let taskList = [];

export function initTasks() {
  // Load tasks from Local Storage
  taskList = JSON.parse(localStorage.getItem('jarvis_tasks') || '[]');

  // Attach event listener to form
  const taskForm = document.getElementById('task-form');
  if (taskForm) {
    taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const input = document.getElementById('task-input');
      const priority = document.getElementById('task-priority');
      
      if (input && input.value.trim()) {
        addTask(input.value.trim(), priority ? priority.value : 'normal');
        input.value = '';
        if (priority) priority.value = 'normal';
      }
    });
  }

  // Initial Render
  renderTasks();
}

// Add a Task
export function addTask(text, priority = 'normal') {
  const newTask = {
    id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    text: text,
    priority: priority, // 'low', 'normal', 'high'
    completed: false,
    createdAt: new Date().toISOString()
  };

  taskList.push(newTask);
  saveTasks();
  renderTasks();

  appendSystemTerminalMessage(`Objective logged: "${text}" [Priority: ${priority.toUpperCase()}]`);
  playClickSound();
}

// Toggle Task Complete State
export function toggleTask(id) {
  const task = taskList.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
    
    const stateStr = task.completed ? "COMPLETED" : "RE-OPENED";
    appendSystemTerminalMessage(`Objective "${task.text}" status changed to ${stateStr}.`);
    playClickSound();
  }
}

// Delete a Task
export function deleteTask(id) {
  const taskIndex = taskList.findIndex(t => t.id === id);
  if (taskIndex > -1) {
    const deletedText = taskList[taskIndex].text;
    taskList.splice(taskIndex, 1);
    saveTasks();
    renderTasks();

    appendSystemTerminalMessage(`Objective deleted from logs: "${deletedText}"`);
    playClickSound();
  }
}

// Save Tasks to localStorage
function saveTasks() {
  localStorage.setItem('jarvis_tasks', JSON.stringify(taskList));
}

// Render Tasks to DOM
export function renderTasks() {
  const container = document.getElementById('task-list-container');
  const compRatio = document.getElementById('task-completed-ratio');
  const progBar = document.getElementById('task-overall-progress');
  
  if (!container) return;

  // Clear container
  container.innerHTML = '';

  // Sort tasks: Active first, high priority first, then date
  const sortedTasks = [...taskList].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    const priorityWeights = { high: 3, normal: 2, low: 1 };
    if (priorityWeights[b.priority] !== priorityWeights[a.priority]) {
      return priorityWeights[b.priority] - priorityWeights[a.priority];
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Render to DOM
  sortedTasks.forEach(task => {
    const item = document.createElement('div');
    item.className = `task-item priority-${task.priority} ${task.completed ? 'completed' : ''}`;
    
    item.innerHTML = `
      <div class="task-item-left">
        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
        <span class="task-text">${escapeHTML(task.text)}</span>
      </div>
      <div class="task-item-right">
        <span class="priority-badge ${task.priority}">${task.priority.toUpperCase()}</span>
        <button class="task-delete-btn" data-id="${task.id}"><i class="fa-solid fa-trash-can"></i></button>
      </div>
    `;

    // Hook listeners
    const checkbox = item.querySelector('.task-checkbox');
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const deleteBtn = item.querySelector('.task-delete-btn');
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    container.appendChild(item);
  });

  // Update Stats
  const total = taskList.length;
  const completed = taskList.filter(t => t.completed).length;
  
  if (compRatio) {
    compRatio.textContent = `${completed}/${total}`;
  }

  if (progBar) {
    const percent = total > 0 ? (completed / total) * 100 : 0;
    progBar.style.width = `${percent}%`;
  }
}

// Simple Helper to Escape HTML
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
