window.appData = JSON.parse(localStorage.getItem('myPlannerData')) || {
    year: "2026",
    categories: [{ id: 1, title: "Обязательно", tasks: [] }],
    water: { goal: 2000, current: 0, glassSize: 250, lastDate: "" }
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
    const yearTitle = document.getElementById('year-title');
    if (yearTitle) {
        yearTitle.innerHTML = `${window.appData.year} <span class="material-icons-round" style="font-size:22px; opacity:0.3; cursor:pointer" onclick="editYearTitle()">edit</span>`;
    }
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
        div.onclick = () => openCategory(cat.id);
        div.innerHTML = `
            <div class="goal-card-header">
                <span class="goal-card-title">${cat.title}</span>
                <span style="color:var(--text-sec); font-size:16px">${percent}%</span>
            </div>
            <div class="progress-container"><div class="progress-fill" style="width:${percent}%"></div></div>
        `;
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
                    <span class="material-icons-round" style="font-size:28px; color:${task.completed ? '#4caf50' : '#4A90E2'}" 
                          onclick="event.stopPropagation(); toggleTaskDone(${index})">
                        ${task.completed ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span class="task-text ${task.completed ? 'done' : ''}">${task.text}</span>
                </div>
                <button class="icon-btn" onclick="event.stopPropagation(); deleteTask(${index})">
                    <span class="material-icons-round" style="color:var(--danger); font-size:26px">delete_outline</span>
                </button>
            </div>
            <div id="subs-${index}" class="sub-tasks" style="display:none">
                <div id="subs-list-${index}"></div>
                <div class="sub-input-group">
                    <input type="text" id="sub-input-${index}" placeholder="Шаг..." class="sub-input">
                    <button onclick="addSubTask(${index})" class="material-icons-round" style="color:var(--primary); font-size:36px; background:none; border:none;">add_circle</button>
                </div>
            </div>
        `;
        list.appendChild(item);
        renderSubTasks(index);
    });
}

function renderSubTasks(tIdx) {
    const subList = document.getElementById(`subs-list-${tIdx}`);
    const cat = window.appData.categories.find(c => c.id === currentCatId);
    subList.innerHTML = cat.tasks[tIdx].subs.map((sub, sIdx) => `
        <div class="sub-task-row">
            <span class="material-icons-round" style="font-size:26px; margin-right:15px; color:${sub.completed ? '#4caf50' : '#D1D1D6'}" onclick="toggleSubDone(${tIdx}, ${sIdx})">
                ${sub.completed ? 'check_box' : 'check_box_outline_blank'}
            </span>
            <span class="sub-task-text" style="${sub.completed ? 'text-decoration:line-through; color:var(--text-sec)' : ''}">${sub.text}</span>
        </div>
    `).join('');
}

function addCategory() {
    const name = prompt("Название категории:");
    if (name) {
        window.appData.categories.push({ id: Date.now(), title: name, tasks: [] });
        saveData(); renderCategories();
    }
}

function deleteCurrentCategory() {
    if (confirm("Удалить всю категорию?")) {
        window.appData.categories = window.appData.categories.filter(c => c.id !== currentCatId);
        saveData(); goBackToGoals();
    }
}

function addTask() {
    const input = document.getElementById('new-task-input');
    if (!input.value.trim()) return;
    const cat = window.appData.categories.find(c => c.id === currentCatId);
    cat.tasks.push({ text: input.value.trim(), completed: false, subs: [] });
    input.value = ''; saveData(); renderTasks();
}

function toggleTaskDone(idx) {
    const cat = window.appData.categories.find(c => c.id === currentCatId);
    cat.tasks[idx].completed = !cat.tasks[idx].completed;
    saveData(); renderTasks(); renderCategories();
}

function addSubTask(tIdx) {
    const input = document.getElementById(`sub-input-${tIdx}`);
    if (!input.value.trim()) return;
    const cat = window.appData.categories.find(c => c.id === currentCatId);
    cat.tasks[tIdx].subs.push({ text: input.value.trim(), completed: false });
    input.value = ''; saveData(); renderSubTasks(tIdx);
}

function toggleSubDone(tIdx, sIdx) {
    const cat = window.appData.categories.find(c => c.id === currentCatId);
    cat.tasks[tIdx].subs[sIdx].completed = !cat.tasks[tIdx].subs[sIdx].completed;
    saveData(); renderSubTasks(tIdx);
}

function toggleSubtasks(idx) {
    const el = document.getElementById(`subs-${idx}`);
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function goBackToGoals() {
    document.getElementById('view-goal-details').classList.remove('active');
    document.getElementById('view-goals').classList.add('active');
    renderCategories();
}

function switchTab(id, btn) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    btn.classList.add('active');
}

function deleteTask(idx) {
    const cat = window.appData.categories.find(c => c.id === currentCatId);
    cat.tasks.splice(idx, 1);
    saveData(); renderTasks();
}

function editYearTitle() {
    const n = prompt("Изменить заголовок:", window.appData.year);
    if (n) { window.appData.year = n; updateYearDisplay(); saveData(); }
}
