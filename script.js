let appData = JSON.parse(localStorage.getItem('myPlannerData')) || {
    year: "2026",
    categories: [
        { id: 1, title: "Обязательно", tasks: [] }
    ]
};

let currentCatId = null;

window.onload = () => {
    const yearEl = document.getElementById('year-title');
    if(yearEl) {
        yearEl.innerHTML = `${appData.year} <span class="material-icons-round" style="font-size: 16px; opacity: 0.5;">edit</span>`;
    }
    renderCategories();
};

function saveData() {
    localStorage.setItem('myPlannerData', JSON.stringify(appData));
}

function renderCategories() {
    const list = document.getElementById('goals-list');
    if(!list) return;
    list.innerHTML = '';
    
    appData.categories.forEach(cat => {
        const div = document.createElement('div');
        div.className = 'goal-card';
        div.innerHTML = `
            <span>${cat.title}</span>
            <span class="material-icons-round" style="color:#ccc">chevron_right</span>
        `;
        div.onclick = () => openCategory(cat.id);
        list.appendChild(div);
    });
}

function openCategory(id) {
    currentCatId = id;
    const cat = appData.categories.find(c => c.id === id);
    document.getElementById('category-title').innerText = cat.title;
    document.getElementById('view-goals').classList.remove('active');
    document.getElementById('view-goal-details').classList.add('active');
    renderTasks();
}

function renderTasks() {
    const list = document.getElementById('tasks-list');
    if(!list) return;
    list.innerHTML = '';
    const cat = appData.categories.find(c => c.id === currentCatId);
    
    cat.tasks.forEach((task, index) => {
        const item = document.createElement('div');
        item.className = 'task-item';
        item.innerHTML = `
            <div class="task-header">
                <div class="task-main">
                    <span class="material-icons-round" style="margin-right:10px; color:#4A90E2">radio_button_unchecked</span>
                    <span class="task-text">${task}</span>
                </div>
                <button class="icon-btn" onclick="deleteTask(${index}); event.stopPropagation();">
                    <span class="material-icons-round" style="color:#FF3B30">delete_outline</span>
                </button>
            </div>
        `;
        list.appendChild(item);
    });
}

function addTask() {
    const input = document.getElementById('new-task-input');
    if(!input || !input.value.trim()) return;
    const cat = appData.categories.find(c => c.id === currentCatId);
    cat.tasks.push(input.value.trim());
    input.value = '';
    saveData();
    renderTasks();
}

function deleteTask(idx) {
    const cat = appData.categories.find(c => c.id === currentCatId);
    cat.tasks.splice(idx, 1);
    saveData();
    renderTasks();
}

function addCategory() {
    const name = prompt("Название новой категории:");
    if(name) {
        appData.categories.push({ id: Date.now(), title: name, tasks: [] });
        saveData();
        renderCategories();
    }
}

function deleteCurrentCategory() {
    if(confirm("Удалить эту категорию полностью?")) {
        appData.categories = appData.categories.filter(c => c.id !== currentCatId);
        saveData();
        renderCategories();
        goBackToGoals();
    }
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

function editYearTitle() {
    const newYear = prompt("Изменить заголовок:", appData.year);
    if(newYear) {
        appData.year = newYear;
        document.getElementById('year-title').innerHTML = `${newYear} <span class="material-icons-round" style="font-size: 16px; opacity: 0.5;">edit</span>`;
        saveData();
    }
}

// Редактирование названия категории по клику на заголовок
document.getElementById('category-title').onclick = () => {
    const cat = appData.categories.find(c => c.id === currentCatId);
    const newName = prompt("Новое название категории:", cat.title);
    if(newName) {
        cat.title = newName;
        document.getElementById('category-title').innerText = newName;
        saveData();
        renderCategories();
    }
};
