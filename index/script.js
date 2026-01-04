// JS START

// Данные приложения (структура)
let appData = {
    yearTitle: "2026",
    categories: [
        { 
            id: 1704060001, 
            title: "Обязательно", 
            tasks: [
                {
                    id: 1,
                    text: "Поменять счетчик",
                    done: false,
                    expanded: false,
                    steps: [
                        { text: "Загуглить модель", done: false },
                        { text: "Купить", done: false }
                    ]
                }
            ] 
        }
    ]
};

// Загрузка данных при старте
window.onload = function() {
    const saved = localStorage.getItem('plannerAppData');
    if (saved) {
        appData = JSON.parse(saved);
    }
    renderGoals();
    document.getElementById('year-title').innerHTML = `${appData.yearTitle} <span class="material-icons" style="font-size: 16px; opacity: 0.5;">edit</span>`;
};

// Функция сохранения
function saveData() {
    localStorage.setItem('plannerAppData', JSON.stringify(appData));
}

// --- НАВИГАЦИЯ ---
function switchTab(tabId, btn) {
    // Скрываем все страницы
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    // Убираем активный класс с кнопок
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    
    // Показываем нужную
    document.getElementById(tabId).classList.add('active');
    btn.classList.add('active');
}

// --- ЛОГИКА ВКЛАДКИ "ЦЕЛИ" (ГЛАВНАЯ) ---

function editYearTitle() {
    const newTitle = prompt("Введите год или название:", appData.yearTitle);
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
        div.innerHTML = `
            <span>${cat.title}</span>
            <span class="material-icons" style="color: #C7C7CC">chevron_right</span>
        `;
        div.onclick = () => openCategory(cat.id);
        
        // Долгий клик для редактирования названия категории (опционально, тут просто клик для входа)
        list.appendChild(div);
    });
}

function addCategory() {
    const title = prompt("Название новой категории:");
    if (title) {
        appData.categories.push({
            id: Date.now(),
            title: title,
            tasks: []
        });
        saveData();
        renderGoals();
    }
}

// --- ЛОГИКА ВКЛАДКИ "ЦЕЛИ" (ДЕТАЛИ) ---

let currentCategoryId = null;

function openCategory(id) {
    currentCategoryId = id;
    const category = appData.categories.find(c => c.id === id);
    if (!category) return;

    document.getElementById('category-title').innerText = category.title;
    
    // Переключаем экран вручную (как переход на страницу)
    document.getElementById('view-goals').classList.remove('active');
    document.getElementById('view-goal-details').classList.add('active');
    
    renderTasks();
}

function goBackToGoals() {
    currentCategoryId = null;
    document.getElementById('view-goal-details').classList.remove('active');
    document.getElementById('view-goals').classList.add('active');
}

function deleteCurrentCategory() {
    if(confirm("Удалить эту категорию и все задачи внутри?")) {
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
    if (!category) return;

    category.tasks.forEach(task => {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task-item';
        
        // Генерируем HTML для шагов
        let stepsHtml = '';
        task.steps.forEach((step, index) => {
            stepsHtml += `
                <div class="sub-task-item">
                    <div class="custom-checkbox ${step.done ? 'checked' : ''}" 
                         onclick="toggleStep(${task.id}, ${index})">
                         <span class="material-icons">check</span>
                    </div>
                    <span class="${step.done ? 'task-text done' : 'task-text'}">${step.text}</span>
                    <span class="material-icons" onclick="deleteStep(${task.id}, ${index})" style="font-size:14px; margin-left:auto; color:#ccc;">close</span>
                </div>
            `;
        });

        taskDiv.innerHTML = `
            <div class="task-header">
                <div class="task-main">
                    <div class="custom-checkbox ${task.done ? 'checked' : ''}" onclick="toggleTask(${task.id})">
                        <span class="material-icons">check</span>
                    </div>
                    <span class="task-text ${task.done ? 'done' : ''}">${task.text}</span>
                </div>
                <div class="task-controls">
                    <button onclick="toggleExpand(${task.id})">
                        <span class="material-icons">${task.expanded ? 'expand_less' : 'expand_more'}</span>
                    </button>
                    <button onclick="deleteTask(${task.id})">
                        <span class="material-icons">close</span>
                    </button>
                </div>
            </div>
            <div class="sub-tasks ${task.expanded ? 'open' : ''}">
                ${stepsHtml}
                <div class="sub-task-item" style="margin-top:5px;">
                    <span class="material-icons" style="font-size:18px; color:var(--primary);">add</span>
                    <input type="text" class="sub-input" placeholder="Добавить шаг..." 
                           onkeydown="if(event.key === 'Enter') addStep(this, ${task.id})">
                </div>
            </div>
        `;
        list.appendChild(taskDiv);
    });
}

function addTask() {
    const input = document.getElementById('new-task-input');
    const text = input.value.trim();
    if (!text) return;

    const category = appData.categories.find(c => c.id === currentCategoryId);
    category.tasks.push({
        id: Date.now(),
        text: text,
        done: false,
        expanded: false,
        steps: []
    });
    
    input.value = '';
    saveData();
    renderTasks();
}

function deleteTask(taskId) {
    const category = appData.categories.find(c => c.id === currentCategoryId);
    category.tasks = category.tasks.filter(t => t.id !== taskId);
    saveData();
    renderTasks();
}

function toggleTask(taskId) {
    const category = appData.categories.find(c => c.id === currentCategoryId);
    const task = category.tasks.find(t => t.id === taskId);
    task.done = !task.done;
    saveData();
    renderTasks();
}

function toggleExpand(taskId) {
    const category = appData.categories.find(c => c.id === currentCategoryId);
    const task = category.tasks.find(t => t.id === taskId);
    task.expanded = !task.expanded;
    saveData();
    renderTasks();
}

// --- ЛОГИКА ПОДЗАДАЧ (ШАГОВ) ---

function addStep(inputElement, taskId) {
    const text = inputElement.value.trim();
    if (!text) return;

    const category = appData.categories.find(c => c.id === currentCategoryId);
    const task = category.tasks.find(t => t.id === taskId);
    
    task.steps.push({ text: text, done: false });
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
