// JS START

// Данные приложения (структура)
let appData = {
    yearTitle: "2026",
    categories: [
        { 
            id: 1, 
            title: "Обязательно", 
            tasks: [] 
        }
    ]
};

window.onload = function() {
    const saved = localStorage.getItem('plannerAppData');
    if (saved) {
        appData = JSON.parse(saved);
    }
    renderGoals();
    document.getElementById('year-title').innerHTML = `${appData.yearTitle} <span class="material-icons" style="font-size: 16px; opacity: 0.5;">edit</span>`;
};

function saveData() {
    localStorage.setItem('plannerAppData', JSON.stringify(appData));
}

function switchTab(tabId, btn) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    btn.classList.add('active');
}

function editYearTitle() {
    const newTitle = prompt("Введите год или заголовок:", appData.yearTitle);
    if (newTitle) {
        appData.yearTitle = newTitle;
        document.getElementById('year-title').innerHTML = `${newTitle} <span class="material-icons" style="font-size: 16px; opacity: 0.5;">edit</span>`;
        saveData();
    }
}

function renderGoals() {
    const list = document.getElementById('goals-list');
    list.innerHTML = '';
    appData.categories.forEach(cat => {
        const div = document.createElement('div');
        div.className = 'goal-card';
        div.innerHTML = `<span>${cat.title}</span><span class="material-icons" style="color: #C7C7CC">chevron_right</span>`;
        div.onclick = () => openCategory(cat.id);
        list.appendChild(div);
    });
}

function addCategory() {
    const title = prompt("Название новой категории:");
    if (title) {
        appData.categories.push({ id: Date.now(), title: title, tasks: [] });
        saveData();
        renderGoals();
    }
}

let currentCategoryId = null;

function openCategory(id) {
    currentCategoryId = id;
    const category = appData.categories.find(c => c.id === id);
    document.getElementById('category-title').innerText = category.title;
    document.getElementById('view-goals').classList.remove('active');
    document.getElementById('view-goal-details').classList.add('active');
    renderTasks();
}

function goBackToGoals() {
    document.getElementById('view-goal-details').classList.remove('active');
    document.getElementById('view-goals').classList.add('active');
}

function deleteCurrentCategory() {
    if(confirm("Удалить эту категорию?")) {
        appData.categories = appData.categories.filter(c => c.id !== currentCategoryId);
        saveData();
        renderGoals();
        goBackToGoals();
    }
}

function renderTasks() {
    const list = document.getElementById('tasks-list');
    list.innerHTML = '';
    const category = appData.categories.find(c => c.id === currentCategoryId);
    
    category.tasks.forEach(task => {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task-item';
        
        let stepsHtml = '';
        task.steps.forEach((step, index) => {
            stepsHtml += `
                <div class="sub-task-item">
                    <div class="custom-checkbox ${step.done ? 'checked' : ''}" onclick="toggleStep(${task.id}, ${index})">
                         <span class="material-icons">check</span>
                    </div>
                    <span class="${step.done ? 'task-text done' : 'task-text'}">${step.text}</span>
                    <span class="material-icons" onclick="deleteStep(${task.id}, ${index})" style="font-size:14px; margin-left:auto; color:#ccc;">close</span>
                </div>
            `;
        });

        taskDiv.innerHTML = `
            <div class="task-header">
                <div class="task-main" onclick="toggleTask(${task.id})">
                    <div class="custom-checkbox ${task.done ? 'checked' : ''}">
                        <span class="material-icons">check</span>
                    </div>
                    <span class="task-text ${task.done ? 'done' : ''}">${task.text}</span>
                </div>
                <div class="task-controls">
                    <button onclick="toggleExpand(${task.id})">
                        <span class="material-icons">${task.expanded ? 'expand_less' : 'expand_more'}</span>
                    </button>
                    <button onclick="deleteTask(${task.id})">
                        <span class="material-icons">delete</span>
                    </button>
                </div>
            </div>
            <div class="sub-tasks ${task.expanded ? 'open' : ''}">
                ${stepsHtml}
                <div class="sub-task-item">
                    <input type="text" class="sub-input" placeholder="Добавить шаг..." onkeydown="if(event.key === 'Enter') addStep(this, ${task.id})">
                </div>
            </div>
        `;
        list.appendChild(taskDiv);
    });
}

function addTask() {
    const input = document.getElementById('new-task-input');
    if (!input.value.trim()) return;
    const category = appData.categories.find(c => c.id === currentCategoryId);
    category.tasks.push({ id: Date.now(), text: input.value, done: false, expanded: false, steps: [] });
    input.value = '';
    saveData();
    renderTasks();
}

function toggleTask(id) {
    const category = appData.categories.find(c => c.id === currentCategoryId);
    const task = category.tasks.find(t => t.id === id);
    task.done = !task.done;
    saveData();
    renderTasks();
}

function deleteTask(id) {
    const category = appData.categories.find(c => c.id === currentCategoryId);
    category.tasks = category.tasks.filter(t => t.id !== id);
    saveData();
    renderTasks();
}

function toggleExpand(id) {
    const category = appData.categories.find(c => c.id === currentCategoryId);
    const task = category.tasks.find(t => t.id === id);
    task.expanded = !task.expanded;
    saveData();
    renderTasks();
}

function addStep(input, taskId) {
    if (!input.value.trim()) return;
    const category = appData.categories.find(c => c.id === currentCategoryId);
    const task = category.tasks.find(t => t.id === taskId);
    task.steps.push({ text: input.value, done: false });
    saveData();
    renderTasks();
}

function toggleStep(taskId, stepIndex) {
    const category = appData.categories.find(c => c.id === currentCategoryId);
    const task = category.tasks.find(t => t.id === taskId);
    task.steps[stepIndex].done = !task.steps[stepIndex].done;
    saveData();
    renderTasks();
}

function deleteStep(taskId, stepIndex) {
    const category = appData.categories.find(c => c.id === currentCategoryId);
    const task = category.tasks.find(t => t.id === taskId);
    task.steps.splice(stepIndex, 1);
    saveData();
    renderTasks();
}
// JS END
