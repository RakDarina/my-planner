// 1. Инициализация данных
window.appData = JSON.parse(localStorage.getItem('myPlannerData')) || {
    year: "2026",
    categories: [{ id: 1, title: "Обязательно", tasks: [] }],
    water: { goal: 2000, current: 0, glassSize: 250, lastDate: "" },
    diaries: { gratitude: [], emotions: [], achievements: [], "good-things": [] }
};

let currentCatId = null;

// 2. Запуск при загрузке
window.onload = () => {
    updateYearDisplay();
    renderCategories();
    if (typeof initMental === 'function') initMental();
};

// --- СИСТЕМА СОХРАНЕНИЯ ---
function saveData() {
    localStorage.setItem('myPlannerData', JSON.stringify(window.appData));
    updateTotalProgress();
}

// --- НАВИГАЦИЯ ---
function switchTab(id, btn) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    btn.classList.add('active');
    
    if (id === 'view-mental' && typeof renderWater === 'function') {
        renderWater();
    }
}

// --- ЛОГИКА ЦЕЛЕЙ ---
function updateYearDisplay() {
    const yearEl = document.getElementById('year-title');
    if (yearEl) yearEl.innerHTML = `${window.appData.year} <span class="material-icons-round" style="font-size:16px; opacity:0.5">edit</span>`;
}

function updateTotalProgress() {
    let allTasks = [];
    window.appData.categories.forEach(c => { allTasks = allTasks.concat(c.tasks); });
    const total = allTasks.length;
    const completed = allTasks.filter(t => t.completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const fill = document.getElementById('total-progress-fill');
    const text = document.getElementById('total-percent');
    if (fill && text) { 
        fill.style.width = percent + '%'; 
        text.innerText = percent + '%'; 
    }
}

function renderCategories() {
    const list = document.getElementById('goals-list');
    if (!list) return;
    list.innerHTML = '';
    window.appData.categories.forEach(cat => {
        const total = cat.tasks.length;
        const done = cat.tasks.filter(t => t.completed).length;
        const percent = total > 0 ? Math.round((done / total) * 100) : 0;
        
        const div = document.createElement('div');
        div.className = 'goal-card';
        div.innerHTML = `
            <div style="width: 100%;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px">
                    <span style="font-weight:600">${cat.title}</span>
                    <span style="font-size:12px; color:#8e8e93">${percent}%</span>
                </div>
                <div class="progress-container" style="height:6px">
                    <div class="progress-fill" style="width: ${percent}%"></div>
                </div>
            </div>`;
        div.onclick = () => openCategory(cat.id);
        list.appendChild(div);
    });
    updateTotalProgress();
}

function openCategory(id) {
    currentCatId = id;
    const cat = window.appData.categories.find(c => c.id === id);
    document.getElementById('category-title').innerText = cat.title;
    document.getElementById('view-goals').classList.remove('active');
    document.getElementById('view-goal-details').classList.add('active');
    renderTasks();
}

function renderTasks() {
    const list = document.getElementById('tasks-list');
    if (!list) return;
    list.innerHTML = '';
    const cat = window.appData.categories.find(c => c.id === currentCatId);
    if (!cat) return;

    cat.tasks.forEach((task, index) => {
        const item = document.createElement('div');
        item.className = 'task-item';
        item.innerHTML = `
            <div class="task-header" style="display:flex; align-items:center; justify-content:space-between">
                <div class="task-main" style="display:flex; align-items:center; flex:1" onclick="toggleSubtasks(${index})">
                    <span class="material-icons-round" 
                          style="margin-right:10px; cursor:pointer; color:${task.completed ? '#4caf50' : '#4A90E2'}" 
                          onclick="event.stopPropagation(); toggleTaskDone(${index});">
                        ${task.completed ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span class="task-text ${task.completed ? 'done' : ''}">${task.text}</span>
                </div>
                <button class="icon-btn" onclick="event.stopPropagation(); deleteTask(${index});">
                    <span class="material-icons-round" style="color:#FF3B30">delete_outline</span>
                </button>
            </div>
            <div id="subs-${index}" class="sub-tasks" style="display:none; padding-left:35px; margin-top:10px">
                <div id="subs-list-${index}"></div>
                <div style="display:flex; margin-top:5px">
                    <input type="text" id="sub-input-${index}" placeholder="Шаг..." class="sub-input" style="flex:1">
                    <button onclick="addSubTask(${index})" class="material-icons-round">add</button>
                </div>
            </div>`;
        list.appendChild(item);
        renderSubTasks(index);
    });
}

function toggleTaskDone(idx) {
    const cat = window.appData.categories.find(c => c.id === currentCatId);
    if (cat && cat.tasks[idx]) {
        cat.tasks[idx].completed = !cat.tasks[idx].completed;
        saveData();
        renderTasks(); // Перерисовываем список задач
        renderCategories(); // Обновляем проценты на главной (в фоновом режиме)
    }
}

function addTask() {
    const input = document.getElementById('new-task-input');
    if (!input || !input.value.trim()) return;
    const cat = window.appData.categories.find(c => c.id === currentCatId);
    cat.tasks.push({ text: input.value.trim(), completed: false, subs: [] });
    input.value = '';
    saveData();
    renderTasks();
}

function goBackToGoals() {
    renderCategories();
    document.getElementById('view-goal-details').classList.remove('active');
    document.getElementById('view-goals').classList.add('active');
}

function addCategory() {
    const name = prompt("Название новой категории:");
    if (name) {
        window.appData.categories.push({ id: Date.now(), title: name, tasks: [] });
        saveData();
        renderCategories();
    }
}

function addSubTask(tIdx) {
    const input = document.getElementById(`sub-input-${tIdx}`);
    if (!input || !input.value.trim()) return;
    const cat = window.appData.categories.find(c => c.id === currentCatId);
    cat.tasks[tIdx].subs.push({ text: input.value.trim(), completed: false });
    input.value = '';
    saveData();
    renderSubTasks(tIdx);
}

function renderSubTasks(tIdx) {
    const subList = document.getElementById(`subs-list-${tIdx}`);
    const cat = window.appData.categories.find(c => c.id === currentCatId);
    const subs = cat.tasks[tIdx].subs;
    subList.innerHTML = '';
    subs.forEach((sub, sIdx) => {
        const div = document.createElement('div');
        div.style = "display:flex; align-items:center; margin-bottom:5px; font-size:14px";
        div.innerHTML = `
            <span class="material-icons-round" style="font-size:18px; margin-right:8px; color:#ccc; cursor:pointer" 
                  onclick="toggleSubDone(${tIdx}, ${sIdx})">
                ${sub.completed ? 'check_box' : 'check_box_outline_blank'}
            </span>
            <span style="${sub.completed ? 'text-decoration:line-through; color:#8e8e93' : ''}">${sub.text}</span>`;
        subList.appendChild(div);
    });
}

function toggleSubDone(tIdx, sIdx) {
    const cat = window.appData.categories.find(c => c.id === currentCatId);
    cat.tasks[tIdx].subs[sIdx].completed = !cat.tasks[tIdx].subs[sIdx].completed;
    saveData();
    renderSubTasks(tIdx);
}

function toggleSubtasks(idx) {
    const el = document.getElementById(`subs-${idx}`);
    if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function deleteTask(idx) {
    if (confirm("Удалить задачу?")) {
        const cat = window.appData.categories.find(c => c.id === currentCatId);
        cat.tasks.splice(idx, 1);
        saveData();
        renderTasks();
    }
}

function deleteCurrentCategory() {
    if (confirm("Удалить всю категорию?")) {
        window.appData.categories = window.appData.categories.filter(c => c.id !== currentCatId);
        saveData();
        goBackToGoals();
    }
}

function editYearTitle() {
    const n = prompt("Изменить заголовок:", window.appData.year);
    if (n) { window.appData.year = n; updateYearDisplay(); saveData(); }
}
