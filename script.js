window.appData = JSON.parse(localStorage.getItem('myPlannerData')) || {
    year: "2026",
    categories: [{ id: 1, title: "Обязательно", tasks: [] }],
    water: { goal: 2000, current: 0, glassSize: 250, lastDate: "" },
    mental: {
        gratitude: [],
        emotions: [],
        achievements: [],
        good_day: []
    }
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
    document.getElementById('year-title').innerHTML = `${window.appData.year} <span class="material-icons-round" style="font-size:20px; opacity:0.3">edit</span>`;
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
    list.innerHTML = ''; // Очищаем только список карточек
    
    window.appData.categories.forEach(cat => {
        const total = cat.tasks.length;
        const done = cat.tasks.filter(t => t.completed).length;
        const percent = total > 0 ? Math.round((done / total) * 100) : 0;
        
        const div = document.createElement('div');
        div.className = 'goal-card';
        div.onclick = () => openCategory(cat.id);
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:10px">
                <span style="font-weight:700; font-size:20px">${cat.title}</span>
                <span style="color:var(--text-sec)">${percent}%</span>
            </div>
            <div class="progress-container">
                <div class="progress-fill" style="width:${percent}%"></div>
            </div>
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
                    <span class="material-icons-round" style="color:${task.completed ? '#4caf50' : '#4A90E2'}" onclick="event.stopPropagation(); toggleTaskDone(${index})">
                        ${task.completed ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span class="task-text ${task.completed ? 'done' : ''}">${task.text}</span>
                </div>
                <button class="icon-btn" onclick="event.stopPropagation(); deleteTask(${index})"><span class="material-icons-round" style="color:var(--danger)">delete_outline</span></button>
            </div>
            <div id="subs-${index}" class="sub-tasks" style="display:none">
                <div id="subs-list-${index}"></div>
                <div class="sub-input-line">
                    <input type="text" id="sub-input-${index}" placeholder="Шаг..." class="sub-input">
                    <button onclick="addSubTask(${index})" class="material-icons-round" style="color:var(--primary); background:none; border:none; font-size:30px">add_circle</button>
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
            <span class="material-icons-round" style="margin-right:10px; color:${sub.completed ? '#4caf50' : '#D1D1D6'}" onclick="toggleSubDone(${tIdx}, ${sIdx})">
                ${sub.completed ? 'check_box' : 'check_box_outline_blank'}
            </span>
            <span style="flex:1; ${sub.completed ? 'text-decoration:line-through; color:var(--text-sec)' : ''}">${sub.text}</span>
        </div>
    `).join('');
}

// Открывает модальное окно для ввода названия
function addCategory() {
    document.getElementById('modal-category').style.display = 'flex';
}

// Сохраняет категорию из модального окна
function saveCategory() {
    const input = document.getElementById('cat-name-input');
    const name = input.value.trim();
    
    if (name) {
        window.appData.categories.push({ 
            id: Date.now(), 
            title: name, 
            tasks: [] 
        });
        saveData(); 
        renderCategories();
        
        // Очищаем и закрываем
        input.value = '';
        closeModals();
    }
}

// Общая функция закрытия всех модалок (если её нет)
function closeModals() {
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
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
    const newYear = prompt("Введите заголовок (например, 2026):", window.appData.year);
    if (newYear !== null && newYear.trim() !== "") {
        window.appData.year = newYear.trim();
        saveData(); // Сохраняем в localStorage
        updateYearDisplay(); // Обновляем текст на экране
    }
}

function deleteCurrentCategory() {
    if (confirm("Вы уверены, что хотите удалить всю категорию и все задачи в ней?")) {
        // Фильтруем массив, оставляя все категории, кроме текущей
        window.appData.categories = window.appData.categories.filter(c => c.id !== currentCatId);
        
        saveData();           // Сохраняем изменения в localStorage
        renderCategories();   // Перерисовываем главный список
        goBackToGoals();      // Возвращаемся на главный экран
    }
}
