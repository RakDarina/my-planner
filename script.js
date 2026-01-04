// JS START

let appData = JSON.parse(localStorage.getItem('myPlannerData')) || {
    year: "2026",
    categories: [
        { id: 1, title: "Обязательно", tasks: [] }
    ]
};

let currentCatId = null;

window.onload = () => {
    document.getElementById('year-title').innerHTML = `${appData.year} <span class="material-icons">edit</span>`;
    renderCategories();
};

function saveData() {
    localStorage.setItem('myPlannerData', JSON.stringify(appData));
}

// Рендер главных карточек (категорий)
function renderCategories() {
    const list = document.getElementById('goals-list');
    list.innerHTML = '';
    appData.categories.forEach(cat => {
        const div = document.createElement('div');
        div.className = 'goal-card';
        div.innerHTML = `
            <span>${cat.title}</span>
            <span class="material-icons" style="color:#ccc">chevron_right</span>
        `;
        div.onclick = () => openCategory(cat.id);
        list.appendChild(div);
    });
}

// Открытие категории и ее задач
function openCategory(id) {
    currentCatId = id;
    const cat = appData.categories.find(c => c.id === id);
    document.getElementById('category-title').innerText = cat.title;
    document.getElementById('view-goals').classList.remove('active');
    document.getElementById('view-goal-details').classList.add('active');
    renderTasks();
}

// Рендер списка задач внутри категории
function renderTasks() {
    const list = document.getElementById('tasks-list');
    list.innerHTML = '';
    const cat = appData.categories.find(c => c.id === currentCatId);
    
    cat.tasks.forEach((task, index) => {
        const item = document.createElement('div');
        item.className = 'task-item';
        item.innerHTML = `
            <div class="task-main">
                <span class="material-icons" style="margin-right:10px; color:#6200ee">radio_button_unchecked</span>
                <span>${task}</span>
            </div>
            <button class="icon-btn" onclick="deleteTask(${index})">
                <span class="material-icons" style="color:#ff5252">delete</span>
            </button>
        `;
        list.appendChild(item);
    });
}

// ФУНКЦИИ УПРАВЛЕНИЯ
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

// Редактирование названия через клик на заголовок
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

function addTask() {
    const input = document.getElementById('new-task-input');
    if(!input.value.trim()) return;
    const cat = appData.categories.find(c => c.id === currentCatId);
    cat.tasks.push(input.value);
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
        document.getElementById('year-title').innerHTML = `${newYear} <span class="material-icons">edit</span>`;
        saveData();
    }
}
// JS END
