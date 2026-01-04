// 1. Инициализация данных
window.appData = JSON.parse(localStorage.getItem('myPlannerData')) || {
    year: "2026",
    categories: [{ id: 1, title: "Обязательно", tasks: [] }],
    water: { goal: 2000, current: 0, glassSize: 250, lastDate: "" },
    diaries: { gratitude: [], emotions: [], achievements: [], "good-things": [] }
};

let currentCatId = null;

window.onload = () => {
    updateYearDisplay();
    renderCategories();
};

function saveData() {
    localStorage.setItem('myPlannerData', JSON.stringify(window.appData));
    updateTotalProgress();
}

function updateYearDisplay() {
    const yearEl = document.getElementById('year-title');
    if (yearEl) yearEl.innerHTML = `${window.appData.year} <span class="material-icons-round" style="font-size:18px; vertical-align:middle; opacity:0.5">edit</span>`;
}

function updateTotalProgress() {
    let allTasks = [];
    window.appData.categories.forEach(c => { allTasks = allTasks.concat(c.tasks); });
    const total = allTasks.length;
    const completed = allTasks.filter(t => t.completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    document.getElementById('total-progress-fill').style.width = percent + '%'; 
    document.getElementById('total-percent').innerText = percent + '%'; 
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
            <div style="width: 100%;" onclick="openCategory(${cat.id})">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px">
                    <span style="font-weight:700; font-size:18px">${cat.title}</span>
                    <span style="font-size:14px; color:#8e8e93">${percent}%</span>
                </div>
                <div class="progress-container">
                    <div class="progress-fill" style="width: ${percent}%"></div>
                </div>
            </div>`;
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
    list.innerHTML = '';
    const cat = window.appData.categories.find(c => c.id === currentCatId);

    cat.tasks.forEach((task, index) => {
        const item = document.createElement('div');
        item.className = 'task-item';
        item.innerHTML = `
            <div class="task-header">
                <div class="task-main" onclick="toggleSubtasks(${index})">
                    <span class="material-icons-round" style="color:${task.completed ? '#4caf50' : '#4A90E2'}" 
                          onclick="event.stopPropagation(); toggleTaskDone(${index});">
                        ${task.completed ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span class="task-text ${task.completed ? 'done' : ''}">${task.text}</span>
                </div>
                <button class="icon-btn" onclick="event.stopPropagation(); deleteTask(${index});">
                    <span class="material-icons-round" style="color:#FF3B30">delete_outline</span>
                </button>
            </div>
            <div id="subs-${index}" class="sub-tasks" style="display:none;">
                <div id="subs-list-${index}"></div>
                <div style="display:flex; margin-top:15px; gap:10px;">
                    <input type="text" id="sub-input-${index}" placeholder="Шаг..." class="sub-input">
                    <button onclick="addSubTask(${index})" class="material-icons-round" 
                            style="background:var(--primary); color:white; border:none; border-radius:50%; width:40px; height:40px;">add</button>
                </div>
            </div>`;
        list.appendChild(item);
        renderSubTasks(index);
    });
}

function renderSubTasks(tIdx) {
    const subList = document.getElementById(`subs-list-${tIdx}`);
    const cat = window.appData.categories.find(c => c.id === currentCatId);
    const subs = cat.tasks[tIdx].subs;
    subList.innerHTML = '';
    
    subs.forEach((sub, sIdx) => {
        const div = document.createElement('div');
        div.className = 'sub-task-row';
        div.innerHTML = `
            <span class="material-icons-round" style="font-size:24px; margin-right:12px; color:${sub.completed ? '#4caf50' : '#ccc'};" 
                  onclick="toggleSubDone(${tIdx}, ${sIdx})">
                ${sub.completed ? 'check_box' : 'check_box_outline_blank'}
            </span>
            <span style="font-size:17px; flex:1; ${sub.completed ? 'text-decoration:line-through; color:#8e8e93' : ''}">
                ${sub.text}
            </span>`;
        subList.appendChild(div);
    });
}

function addCategory() {
    const name = prompt("Название новой категории:");
    if (name) {
        window.appData.categories.push({ id: Date.now(), title: name, tasks: [] });
        saveData();
        renderCategories();
    }
}

function addTask() {
    const input = document.getElementById('new-task-input');
    if (!input.value.trim()) return;
    const cat = window.appData.categories.find(c => c.id === currentCatId);
    cat.tasks.push({ text: input.value.trim(), completed: false, subs: [] });
    input.value = '';
    saveData();
    renderTasks();
}

function toggleTaskDone(idx) {
    const cat = window.appData.categories.find(c => c.id === currentCatId);
    cat.tasks[idx].completed = !cat.tasks[idx].completed;
    saveData();
    renderTasks();
    renderCategories();
}

function addSubTask(tIdx) {
    const input = document.getElementById(`sub-input-${tIdx}`);
    if (!input.value.trim()) return;
    const cat = window.appData.categories.find(c => c.id === currentCatId);
    cat.tasks[tIdx].subs.push({ text: input.value.trim(), completed: false });
    input.value = '';
    saveData();
    renderSubTasks(tIdx);
}

function toggleSubDone(tIdx, sIdx) {
    const cat = window.appData.categories.find(c => c.id === currentCatId);
    cat.tasks[tIdx].subs[sIdx].completed = !cat.tasks[tIdx].subs[sIdx].completed;
    saveData();
    renderSubTasks(tIdx);
}

function toggleSubtasks(idx) {
    const el = document.getElementById(`subs-${idx}`);
    el.style.display = el.style.display === 'none' ? 'flex' : 'none';
}

function switchTab(id, btn) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    btn.classList.add('active');
}

function goBackToGoals() {
    document.getElementById('view-goal-details').classList.remove('active');
    document.getElementById('view-goals').classList.add('active');
}

function deleteTask(idx) {
    const cat = window.appData.categories.find(c => c.id === currentCatId);
    cat.tasks.splice(idx, 1);
    saveData();
    renderTasks();
}

function deleteCurrentCategory() {
    window.appData.categories = window.appData.categories.filter(c => c.id !== currentCatId);
    saveData();
    goBackToGoals();
}

function editYearTitle() {
    const n = prompt("Изменить заголовок:", window.appData.year);
    if (n) { window.appData.year = n; updateYearDisplay(); saveData(); }
}
