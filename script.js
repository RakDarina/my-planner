let appData = JSON.parse(localStorage.getItem('myPlannerData')) || {
    year: "2026",
    categories: [{ id: 1, title: "Обязательно", tasks: [] }]
};

let currentCatId = null;

window.onload = () => {
    renderCategories();
    updateYearDisplay();
    updateTotalProgress(); // Показываем прогресс при запуске
};

// --- СОХРАНЕНИЕ ---
function saveData() {
    localStorage.setItem('myPlannerData', JSON.stringify(appData));
    updateTotalProgress(); // Считаем прогресс каждый раз при сохранении
}

function updateYearDisplay() {
    const yearEl = document.getElementById('year-title');
    if (yearEl) yearEl.innerHTML = `${appData.year} <span class="material-icons-round" style="font-size:16px; opacity:0.5">edit</span>`;
}

// --- ПРОГРЕСС-БАРЫ ---
function updateTotalProgress() {
    let allTasks = [];
    appData.categories.forEach(c => {
        allTasks = allTasks.concat(c.tasks);
    });

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

// --- РАБОТА С КАТЕГОРИЯМИ ---
function renderCategories() {
    const list = document.getElementById('goals-list');
    if (!list) return;
    list.innerHTML = '';
    
    appData.categories.forEach(cat => {
        // Считаем % для конкретной категории
        const total = cat.tasks.length;
        const done = cat.tasks.filter(t => t.completed).length;
        const percent = total > 0 ? Math.round((done / total) * 100) : 0;

        const div = document.createElement('div');
        div.className = 'goal-card';
        // Добавляем верстку с полоской внутри карточки
        div.innerHTML = `
            <div style="width: 100%;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px">
                    <span style="font-weight:600">${cat.title}</span>
                    <span style="font-size:12px; color:#8e8e93">${percent}%</span>
                </div>
                <div class="progress-container" style="height:6px">
                    <div class="progress-fill" style="width: ${percent}%"></div>
                </div>
            </div>
        `;
        div.onclick = () => openCategory(cat.id);
        list.appendChild(div);
    });
    updateTotalProgress();
}

function openCategory(id) {
    currentCatId = id;
    const cat = appData.categories.find(c => c.id === id);
    const titleEl = document.getElementById('category-title');
    titleEl.innerText = cat.title;
    
    titleEl.onclick = () => {
        const newName = prompt("Новое название категории:", cat.title);
        if (newName) {
            cat.title = newName;
            titleEl.innerText = newName;
            saveData();
            renderCategories();
        }
    };

    document.getElementById('view-goals').classList.remove('active');
    document.getElementById('view-goal-details').classList.add('active');
    renderTasks();
}

// --- РАБОТА С ЗАДАЧАМИ ---
function renderTasks() {
    const list = document.getElementById('tasks-list');
    if (!list) return;
    list.innerHTML = '';
    const cat = appData.categories.find(c => c.id === currentCatId);
    
    cat.tasks.forEach((taskObj, index) => {
        if (typeof taskObj === 'string') {
            cat.tasks[index] = { text: taskObj, completed: false, subs: [] };
            taskObj = cat.tasks[index];
        }

        const item = document.createElement('div');
        item.className = 'task-item';
        item.innerHTML = `
            <div class="task-header" style="display:flex; align-items:center; justify-content:space-between">
                <div class="task-main" style="display:flex; align-items:center; flex:1" onclick="toggleSubtasks(${index})">
                    <span class="material-icons-round" style="margin-right:10px; color:${taskObj.completed ? '#4caf50' : '#4A90E2'}" onclick="toggleTaskDone(${index}); event.stopPropagation();">
                        ${taskObj.completed ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span class="task-text ${taskObj.completed ? 'done' : ''}">${taskObj.text}</span>
                </div>
                <div class="task-controls">
                    <button class="icon-btn" onclick="editTask(${index}); event.stopPropagation();">
                        <span class="material-icons-round" style="font-size:20px; color:#8e8e93">edit</span>
                    </button>
                    <button class="icon-btn" onclick="deleteTask(${index}); event.stopPropagation();">
                        <span class="material-icons-round" style="color:#FF3B30">delete_outline</span>
                    </button>
                </div>
            </div>
            <div id="subs-${index}" class="sub-tasks" style="display:none; padding-left:35px; margin-top:10px">
                <div id="subs-list-${index}"></div>
                <div style="display:flex; margin-top:5px">
                    <input type="text" id="sub-input-${index}" placeholder="Добавить шаг..." class="sub-input" style="font-size:13px; border:none; border-bottom:1px solid #eee; outline:none; flex:1">
                    <button onclick="addSubTask(${index})" style="background:none; border:none; color:#4A90E2" class="material-icons-round">add</button>
                </div>
            </div>
        `;
        list.appendChild(item);
        renderSubTasks(index);
    });
}

function addTask() {
    const input = document.getElementById('new-task-input');
    if (!input.value.trim()) return;
    const cat = appData.categories.find(c => c.id === currentCatId);
    cat.tasks.push({ text: input.value.trim(), completed: false, subs: [] });
    input.value = '';
    saveData();
    renderTasks();
}

function editTask(idx) {
    const cat = appData.categories.find(c => c.id === currentCatId);
    const newText = prompt("Редактировать задачу:", cat.tasks[idx].text);
    if (newText) {
        cat.tasks[idx].text = newText;
        saveData();
        renderTasks();
    }
}

function toggleTaskDone(idx) {
    const cat = appData.categories.find(c => c.id === currentCatId);
    cat.tasks[idx].completed = !cat.tasks[idx].completed;
    saveData();
    renderTasks();
}

function toggleSubtasks(idx) {
    const el = document.getElementById(`subs-${idx}`);
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function addSubTask(taskIdx) {
    const input = document.getElementById(`sub-input-${taskIdx}`);
    if (!input.value.trim()) return;
    const cat = appData.categories.find(c => c.id === currentCatId);
    cat.tasks[taskIdx].subs.push({ text: input.value.trim(), completed: false });
    input.value = '';
    saveData();
    renderSubTasks(taskIdx);
}

function renderSubTasks(taskIdx) {
    const subList = document.getElementById(`subs-list-${taskIdx}`);
    const cat = appData.categories.find(c => c.id === currentCatId);
    const subs = cat.tasks[taskIdx].subs;
    subList.innerHTML = '';
    
    subs.forEach((sub, subIdx) => {
        const div = document.createElement('div');
        div.style = "display:flex; align-items:center; margin-bottom:5px; font-size:14px";
        div.innerHTML = `
            <span class="material-icons-round" style="font-size:18px; margin-right:8px; color:#ccc" onclick="toggleSubDone(${taskIdx}, ${subIdx})">
                ${sub.completed ? 'check_box' : 'check_box_outline_blank'}
            </span>
            <span style="${sub.completed ? 'text-decoration:line-through; color:#8e8e93' : ''}">${sub.text}</span>
        `;
        subList.appendChild(div);
    });
}

function toggleSubDone(tIdx, sIdx) {
    const cat = appData.categories.find(c => c.id === currentCatId);
    cat.tasks[tIdx].subs[sIdx].completed = !cat.tasks[tIdx].subs[sIdx].completed;
    saveData();
    renderSubTasks(tIdx);
}

function deleteTask(idx) {
    if (confirm("Удалить задачу?")) {
        const cat = appData.categories.find(c => c.id === currentCatId);
        cat.tasks.splice(idx, 1);
        saveData();
        renderTasks();
    }
}

function deleteCurrentCategory() {
    if (confirm("Удалить всю категорию?")) {
        appData.categories = appData.categories.filter(c => c.id !== currentCatId);
        saveData();
        goBackToGoals();
        renderCategories();
    }
}

function goBackToGoals() {
    renderCategories(); // Обновляем прогресс на главном при возврате
    document.getElementById('view-goal-details').classList.remove('active');
    document.getElementById('view-goals').classList.add('active');
}

function switchTab(id, btn) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    btn.classList.add('active');
}

function addCategory() {
    const name = prompt("Название новой категории:");
    if (name) {
        appData.categories.push({ id: Date.now(), title: name, tasks: [] });
        saveData();
        renderCategories();
    }
}

function editYearTitle() {
    const n = prompt("Изменить заголовок:", appData.year);
    if (n) { appData.year = n; updateYearDisplay(); saveData(); }
}
