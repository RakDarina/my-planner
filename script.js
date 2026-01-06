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
    
    const fill = document.getElementById('total-progress-fill');
    const text = document.getElementById('total-percent');
    if(fill) fill.style.width = percent + '%';
    if(text) text.innerText = percent + '%';
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
    
    // Делаем заголовок кликабельным для редактирования
    const titleEl = document.getElementById('category-title');
    titleEl.innerText = cat.title;
    titleEl.onclick = () => script_editCategoryTitle();
    titleEl.style.cursor = "pointer";

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
            <div class="task-header">
                <div class="task-main" onclick="toggleSubtasks(${index})">
                    <span class="material-icons-round" style="color:${task.completed ? '#4caf50' : '#4A90E2'}" onclick="event.stopPropagation(); toggleTaskDone(${index})">
                        ${task.completed ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span class="task-text ${task.completed ? 'done' : ''}">${task.text}</span>
                </div>
                <div class="task-actions" style="display:flex; gap:5px">
                    <button class="icon-btn" onclick="event.stopPropagation(); script_editTask(${index})">
                        <span class="material-icons-round" style="color:var(--text-sec); font-size:20px">edit</span>
                    </button>
                    <button class="icon-btn" onclick="event.stopPropagation(); deleteTask(${index})">
                        <span class="material-icons-round" style="color:var(--danger); font-size:20px">delete_outline</span>
                    </button>
                </div>
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
    if (!subList || !cat.tasks[tIdx]) return;

    subList.innerHTML = cat.tasks[tIdx].subs.map((sub, sIdx) => `
        <div class="sub-task-row" style="display:flex; align-items:center; margin-bottom:10px">
            <span class="material-icons-round" style="margin-right:10px; color:${sub.completed ? '#4caf50' : '#D1D1D6'}" onclick="toggleSubDone(${tIdx}, ${sIdx})">
                ${sub.completed ? 'check_box' : 'check_box_outline_blank'}
            </span>
            <span onclick="script_editSubTask(${tIdx}, ${sIdx})" style="flex:1; cursor:pointer; ${sub.completed ? 'text-decoration:line-through; color:var(--text-sec)' : ''}">
                ${sub.text}
            </span>
            <button class="icon-btn" onclick="script_deleteSubTask(${tIdx}, ${sIdx})" style="padding:0; background:none; border:none;">
                <span class="material-icons-round" style="color:var(--danger); font-size:18px; opacity:0.5">close</span>
            </button>
        </div>
    `).join('');
}

function addCategory() {
    const name = prompt("Название категории:");
    if (name && name.trim() !== "") {
        window.appData.categories.push({ id: Date.now(), title: name.trim(), tasks: [] });
        saveData(); 
        renderCategories();
    }
}

function addTask() {
    const input = document.getElementById('new-task-input');
    if (!input || !input.value.trim()) return;
    const cat = window.appData.categories.find(c => c.id === currentCatId);
    cat.tasks.push({ text: input.value.trim(), completed: false, subs: [] });
    input.value = ''; 
    input.style.height = 'auto'; // Добавь эту строку, чтобы поле сбросило размер после отправки
    saveData(); 
    renderTasks();
}

function toggleTaskDone(idx) {
    const cat = window.appData.categories.find(c => c.id === currentCatId);
    cat.tasks[idx].completed = !cat.tasks[idx].completed;
    saveData(); renderTasks(); renderCategories();
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

function toggleSubDone(tIdx, sIdx) {
    const cat = window.appData.categories.find(c => c.id === currentCatId);
    cat.tasks[tIdx].subs[sIdx].completed = !cat.tasks[tIdx].subs[sIdx].completed;
    saveData(); renderSubTasks(tIdx);
}

function toggleSubtasks(idx) {
    const el = document.getElementById(`subs-${idx}`);
    if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function goBackToGoals() {
    document.getElementById('view-goal-details').classList.remove('active');
    document.getElementById('view-goals').classList.add('active');
}

function switchTab(id, btn) {
    // 1. Сначала плавно прокручиваем наверх ту страницу, КОТОРУЮ открываем
    const targetPage = document.getElementById(id);
    if (targetPage) {
        targetPage.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 2. Убираем активность у всех страниц и кнопок
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));

    // 3. Активируем нужную страницу и кнопку
    if (targetPage) targetPage.classList.add('active');
    if (btn) btn.classList.add('active');
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
        saveData();
        updateYearDisplay();
    }
}

function deleteCurrentCategory() {
    if (confirm("Вы уверены, что хотите удалить всю категорию и все задачи в ней?")) {
        window.appData.categories = window.appData.categories.filter(c => c.id !== currentCatId);
        saveData();
        renderCategories();
        goBackToGoals();
    }
}

// Новые функции с префиксом script_
function script_editTask(idx) {
    const cat = window.appData.categories.find(c => c.id === currentCatId);
    const newText = prompt("Редактировать задачу:", cat.tasks[idx].text);
    if (newText !== null && newText.trim() !== "") {
        cat.tasks[idx].text = newText.trim();
        saveData();
        renderTasks();
    }
}

function script_editSubTask(tIdx, sIdx) {
    const cat = window.appData.categories.find(c => c.id === currentCatId);
    const currentText = cat.tasks[tIdx].subs[sIdx].text;
    const newText = prompt("Редактировать шаг:", currentText);
    if (newText !== null && newText.trim() !== "") {
        cat.tasks[tIdx].subs[sIdx].text = newText.trim();
        saveData();
        renderSubTasks(tIdx);
    }
}

function script_deleteSubTask(tIdx, sIdx) {
    if (confirm("Удалить этот шаг?")) {
        const cat = window.appData.categories.find(c => c.id === currentCatId);
        cat.tasks[tIdx].subs.splice(sIdx, 1);
        saveData();
        renderSubTasks(tIdx);
    }
}

// Редактирование названия самой категории
function script_editCategoryTitle() {
    const cat = window.appData.categories.find(c => c.id === currentCatId);
    const newTitle = prompt("Изменить название категории:", cat.title);
    if (newTitle !== null && newTitle.trim() !== "") {
        cat.title = newTitle.trim();
        document.getElementById('category-title').innerText = cat.title; // Обновляем в шапке
        saveData();
        renderCategories(); // Обновляем на главном экране
    }
}

// Редактирование подшага (убедись, что эта версия заменяет старую)
function script_editSubTask(tIdx, sIdx) {
    const cat = window.appData.categories.find(c => c.id === currentCatId);
    const sub = cat.tasks[tIdx].subs[sIdx];
    const newText = prompt("Редактировать шаг:", sub.text);
    if (newText !== null && newText.trim() !== "") {
        sub.text = newText.trim();
        saveData();
        renderSubTasks(tIdx);
    }
}

// --- БЛОК УПРАВЛЕНИЯ ДАННЫМИ (НАСТРОЙКИ) ---

// Функция экспорта: собирает всё из window.appData и шифрует в строку
function settings_export() {
    try {
        if (!window.appData) {
            alert("Ошибка: Данные не найдены!");
            return;
        }

        // Превращаем весь объект приложения в строку
        const dataStr = JSON.stringify(window.appData);
        // Кодируем в Base64 (безопасный формат для передачи текста)
        const encodedData = btoa(unescape(encodeURIComponent(dataStr)));
        
        const area = document.getElementById('settings-backup-area');
        area.value = encodedData;
        area.select(); // Выделяем текст, чтобы пользователю было легко копировать
        
        // Автоматическое копирование в буфер обмена
        try {
            document.execCommand('copy');
            alert("Код резервной копии скопирован! Сохраните его в заметках. Это ваши цели, дневники и списки.");
        } catch (err) {
            alert("Код создан! Пожалуйста, скопируйте его вручную из текстового поля.");
        }
    } catch (e) {
        alert("Ошибка экспорта: " + e.message);
        console.error(e);
    }
}

// Функция импорта: берет строку, расшифровывает и заменяет window.appData
function settings_import() {
    const area = document.getElementById('settings-backup-area');
    const code = area.value.trim();
    
    if (!code) {
        alert("Вставьте код в поле для восстановления!");
        return;
    }
    
    if (confirm("ВНИМАНИЕ: Текущие данные будут полностью заменены данными из кода. Вы уверены?")) {
        try {
            // Декодируем обратно в JSON
            const decodedData = decodeURIComponent(escape(atob(code)));
            const parsedData = JSON.parse(decodedData);
            
            if (parsedData && typeof parsedData === 'object') {
                // Заменяем глобальные данные
                window.appData = parsedData;
                
                // Сохраняем в память телефона через твою основную функцию
                if (typeof saveData === 'function') {
                    saveData();
                } else {
                    localStorage.setItem('plannerData', JSON.stringify(window.appData));
                }
                
                alert("Данные успешно восстановлены! Приложение обновится.");
                location.reload(); // Перезагружаем, чтобы все вкладки увидели новые данные
            }
        } catch (e) {
            alert("Ошибка! Код недействителен. Убедитесь, что скопировали его полностью.");
            console.error(e);
        }
    }
}

// Ждем загрузки страницы и настраиваем поле ввода
document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('new-task-input');
    
    if (taskInput) {
        // Убираем все обработчики, которые могли отправлять форму по Enter
        taskInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                // Разрешаем стандартное поведение (перенос строки)
                // и ПРЕРЫВАЕМ выполнение других скриптов, если они есть
                e.stopPropagation();
            }
        });

        // Автоматическое увеличение высоты при наборе текста
        taskInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }
});

// Обнови функцию addTask, чтобы она сбрасывала высоту поля
const originalAddTask = window.addTask;
window.addTask = function() {
    const input = document.getElementById('new-task-input');
    if (originalAddTask) originalAddTask();
    if (input) {
        input.style.height = '44px'; // Возвращаем к начальной высоте
    }
};
