// JS START

// 1. Данные приложения
let goalsData = JSON.parse(localStorage.getItem('myGoalsData')) || [
    { id: 1, title: "Обязательно", tasks: [] },
    { id: 2, title: "Здоровье", tasks: [] }
];

let currentCategoryId = null;

// 2. Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    renderGoals();
    
    // Слушатель для ввода задач по нажатию Enter
    const taskInput = document.getElementById('new-task-input');
    if(taskInput) {
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTask();
        });
    }
});

// 3. Отрисовка главного экрана (категории/вкладки)
function renderGoals() {
    const list = document.getElementById('goals-list');
    list.innerHTML = '';

    goalsData.forEach(cat => {
        const card = document.createElement('div');
        card.className = 'goal-card';
        card.onclick = () => openCategory(cat.id);
        
        // Исправлено: иконка chevron_right теперь внутри тега material-icons
        card.innerHTML = `
            <span>${cat.title}</span>
            <span class="material-icons" style="color: #ccc;">chevron_right</span>
        `;
        list.appendChild(card);
    });
    saveData();
}

// 4. Открытие категории (задачи внутри)
function openCategory(id) {
    currentCategoryId = id;
    const category = goalsData.find(c => c.id === id);
    document.getElementById('category-title').innerText = category.title;
    document.getElementById('view-goals').classList.remove('active');
    document.getElementById('view-goal-details').classList.add('active');
    renderTasks();
}

// 5. Отрисовка задач
function renderTasks() {
    const list = document.getElementById('tasks-list');
    const category = goalsData.find(c => c.id === currentCategoryId);
    list.innerHTML = '';

    category.tasks.forEach((task, index) => {
        const item = document.createElement('div');
        item.className = 'task-item';
        // Исправлено: иконки expand_more и delete теперь внутри тегов material-icons
        item.innerHTML = `
            <div class="task-main">
                <span class="material-icons" style="margin-right: 10px; color: #6200ee;">expand_more</span>
                <span>${task}</span>
            </div>
            <button class="icon-btn" onclick="deleteTask(${index})">
                <span class="material-icons" style="color: #ff5252;">delete</span>
            </button>
        `;
        list.appendChild(item);
    });
}

// 6. Добавление новой категории (вкладки)
function addCategory() {
    const name = prompt("Введите название новой категории:");
    if (name) {
        const newCat = {
            id: Date.now(),
            title: name,
            tasks: []
        };
        goalsData.push(newCat);
        renderGoals();
    }
}

// 7. РЕДАКТИРОВАНИЕ названия категории
function editCategoryTitle() {
    const category = goalsData.find(c => c.id === currentCategoryId);
    const newName = prompt("Изменить название категории:", category.title);
    if (newName) {
        category.title = newName;
        document.getElementById('category-title').innerText = newName;
        renderGoals();
    }
}

// Клик по заголовку в деталях теперь вызывает редактирование
document.getElementById('category-title').onclick = editCategoryTitle;

// 8. УДАЛЕНИЕ категории
function deleteCurrentCategory() {
    if (confirm("Удалить всю категорию и все задачи в ней?")) {
        goalsData = goalsData.filter(c => c.id !== currentCategoryId);
        goBackToGoals();
        renderGoals();
    }
}

// 9. Работа с задачами (Добавление/Удаление)
function addTask() {
    const input = document.getElementById('new-task-input');
    if (!input.value.trim()) return;
    
    const category = goalsData.find(c => c.id === currentCategoryId);
    category.tasks.push(input.value.trim());
    input.value = '';
    renderTasks();
    saveData();
}

function deleteTask(index) {
    const category = goalsData.find(c => c.id === currentCategoryId);
    category.tasks.splice(index, 1);
    renderTasks();
    saveData();
}

// 10. Навигация и сохранение
function goBackToGoals() {
    document.getElementById('view-goal-details').classList.remove('active');
    document.getElementById('view-goals').classList.add('active');
}

function switchTab(tabId, el) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
}

function saveData() {
    localStorage.setItem('myGoalsData', JSON.stringify(goalsData));
}

// Редактирование года
function editYearTitle() {
    const title = document.getElementById('year-title');
    const currentYear = title.innerText.replace('edit', '').trim();
    const newYear = prompt("Введите год или название периода:", currentYear);
    if (newYear) {
        title.innerHTML = `${newYear} <span class="material-icons" style="font-size: 18px; vertical-align: middle; opacity: 0.5;">edit</span>`;
    }
}
// JS END
