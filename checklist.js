/* checklist.js - Логика раздела Чек-листы */

// Текущее состояние
let checklist_currentSection = ''; // 'cleaning', 'selfcare', 'planner', 'misc'
let checklist_data = [];
let checklist_editingId = null;
let checklist_showAllMode = false; // Для переключателя "Показать все"

// Названия разделов и ключи для сохранения
const checklist_config = {
    'cleaning': { title: 'Уборка', storageKey: 'checklist_cleaning_data', type: 'recurring' },
    'selfcare': { title: 'Уход за собой', storageKey: 'checklist_selfcare_data', type: 'recurring' },
    'planner':  { title: 'Ежедневник', storageKey: 'checklist_planner_data', type: 'deadline' },
    'misc':     { title: 'Разное', storageKey: 'checklist_misc_data', type: 'simple' }
};

// --- НАВИГАЦИЯ ---

function checklist_openSection(section) {
    checklist_currentSection = section;
    
    // Скрываем меню, показываем список
    document.getElementById('checklist_menu').style.display = 'none';
    document.getElementById('checklist_section_view').style.display = 'block';
    
    // Настраиваем заголовок
    document.getElementById('checklist_section_title').innerText = checklist_config[section].title;
    
    // Сбрасываем режим "показать все"
    checklist_showAllMode = false;

    // Загружаем данные и рисуем
    checklist_loadData();
    checklist_renderList();
    
    // Показываем переключатель "Показать все" только для повторяющихся задач
    const toggleBtn = document.getElementById('checklist_toggle_view_btn');
    if (checklist_config[section].type === 'recurring') {
        toggleBtn.style.display = 'block';
        toggleBtn.innerText = 'Показать все';
    } else {
        toggleBtn.style.display = 'none';
    }
}

function checklist_backToMenu() {
    document.getElementById('checklist_section_view').style.display = 'none';
    document.getElementById('checklist_menu').style.display = 'grid';
    checklist_currentSection = '';
}

function checklist_toggleViewMode() {
    checklist_showAllMode = !checklist_showAllMode;
    const btn = document.getElementById('checklist_toggle_view_btn');
    btn.innerText = checklist_showAllMode ? 'План на сегодня' : 'Показать все';
    checklist_renderList();
}

// --- ДАННЫЕ ---

function checklist_loadData() {
    const key = checklist_config[checklist_currentSection].storageKey;
    checklist_data = JSON.parse(localStorage.getItem(key)) || [];
}

function checklist_saveData() {
    const key = checklist_config[checklist_currentSection].storageKey;
    localStorage.setItem(key, JSON.stringify(checklist_data));
}

// --- ОТРИСОВКА ---

function checklist_renderList() {
    const container = document.getElementById('checklist_items_container');
    container.innerHTML = '';
    
    const type = checklist_config[checklist_currentSection].type;
    let itemsToRender = [];

    // Логика фильтрации
    if (type === 'recurring') {
        if (checklist_showAllMode) {
            // Показываем вообще всё
            itemsToRender = checklist_data;
        } else {
            // Показываем только то, что нужно сделать сегодня или раньше (просроченное)
            const today = new Date().setHours(0,0,0,0);
            itemsToRender = checklist_data.filter(item => {
                // Если дата следующего выполнения <= сегодня, или даты нет (новая)
                if (!item.nextDate) return true;
                const nextDate = new Date(item.nextDate).setHours(0,0,0,0);
                return nextDate <= today;
            });
            
            if (itemsToRender.length === 0) {
                container.innerHTML = `<div style="text-align:center; color:#8E8E93; margin-top:50px;">На сегодня всё выполнено! 🌟</div>`;
                return;
            }
        }
    } else {
        // Для обычных списков и ежедневника показываем всё
        itemsToRender = checklist_data;
    }

    // Сортировка: Сначала невыполненные, потом выполненные (для обычных списков)
    if (type !== 'recurring') {
        itemsToRender.sort((a, b) => (a.completed === b.completed) ? 0 : a.completed ? 1 : -1);
    }

    itemsToRender.forEach(item => {
        const div = document.createElement('div');
        div.className = 'checklist-item';
        
        // Галочка
        let checkboxHtml = '';
        if (type === 'recurring') {
            // В повторяющихся задачах галочка "выполняет" и скрывает задачу
            checkboxHtml = `
                <div class="checklist-checkbox" onclick="checklist_completeRecurring(${item.id})">
                    <span class="material-icons-round">done</span>
                </div>
            `;
        } else {
            // В обычных просто зачеркивает
            checkboxHtml = `
                <div class="checklist-checkbox ${item.completed ? 'checked' : ''}" onclick="checklist_toggleSimple(${item.id})">
                    <span class="material-icons-round">done</span>
                </div>
            `;
        }

        // Инфо-строка (частота или дедлайн)
        let infoBadge = '';
        if (type === 'recurring') {
            const freqText = checklist_getFreqLabel(item.frequency);
            const dateText = item.nextDate ? `След: ${checklist_formatDate(item.nextDate)}` : 'Новая';
            infoBadge = `<div class="checklist-badge">${freqText} | ${dateText}</div>`;
        } else if (type === 'deadline' && item.deadline) {
            infoBadge = `<div class="checklist-badge" style="background:#FFF3E0; color:#E65100;">Срок: ${item.deadline}</div>`;
        }

        // Кнопки управления (редактировать/удалить)
        const actionsHtml = `
            <div style="display:flex; flex-direction:column; gap:10px; opacity:0.3;">
                <span class="material-icons-round" onclick="checklist_editTask(${item.id})" style="font-size:18px; cursor:pointer;">edit</span>
                <span class="material-icons-round" onclick="checklist_deleteTask(${item.id})" style="font-size:18px; cursor:pointer; color:var(--danger);">delete</span>
            </div>
        `;

        div.innerHTML = `
            ${checkboxHtml}
            <div style="flex:1;">
                <div class="checklist-text ${item.completed && type !== 'recurring' ? 'completed' : ''}">${item.text}</div>
                ${infoBadge}
            </div>
            ${actionsHtml}
        `;
        
        container.appendChild(div);
    });
}

// Помощник: красивая дата
function checklist_formatDate(dateStr) {
    const d = new Date(dateStr);
    return `${d.getDate()}.${d.getMonth()+1}`;
}

// Помощник: текст частоты
function checklist_getFreqLabel(days) {
    if(days == 1) return 'Ежедневно';
    if(days == 7) return 'Раз в неделю';
    if(days == 14) return 'Раз в 2 недели';
    if(days == 30) return 'Раз в месяц';
    if(days == 365) return 'Раз в год';
    return `Раз в ${days} дн.`;
}

// --- ДЕЙСТВИЯ ---

function checklist_openModal(editId = null) {
    const modal = document.getElementById('checklist_modal');
    modal.style.display = 'flex';
    
    const type = checklist_config[checklist_currentSection].type;
    
    // Показываем/скрываем нужные поля
    document.getElementById('checklist_freq_settings').style.display = (type === 'recurring') ? 'block' : 'none';
    document.getElementById('checklist_deadline_settings').style.display = (type === 'deadline') ? 'block' : 'none';
    
    const textInput = document.getElementById('checklist_input_text');
    const freqInput = document.getElementById('checklist_input_freq');
    const deadlineInput = document.getElementById('checklist_input_deadline');

    if (editId) {
        checklist_editingId = editId;
        const item = checklist_data.find(i => i.id === editId);
        textInput.value = item.text;
        if(type === 'recurring') freqInput.value = item.frequency;
        if(type === 'deadline') deadlineInput.value = item.deadline;
        document.getElementById('checklist_modal_title').innerText = 'Редактировать';
    } else {
        checklist_editingId = null;
        textInput.value = '';
        freqInput.value = '1'; // По умолчанию каждый день
        deadlineInput.value = '';
        document.getElementById('checklist_modal_title').innerText = 'Новая задача';
    }
}

function checklist_closeModal() {
    document.getElementById('checklist_modal').style.display = 'none';
}

function checklist_saveTask() {
    const text = document.getElementById('checklist_input_text').value;
    if (!text.trim()) return;
    
    const type = checklist_config[checklist_currentSection].type;
    
    if (checklist_editingId) {
        // Редактирование
        const item = checklist_data.find(i => i.id === checklist_editingId);
        item.text = text;
        if (type === 'recurring') {
            item.frequency = parseInt(document.getElementById('checklist_input_freq').value);
            // Если меняем частоту, дату следующего выполнения пока не трогаем,
            // она обновится после выполнения. Или можно сбросить на сегодня?
            // Оставим как есть, чтобы не сбить график.
        }
        if (type === 'deadline') {
            item.deadline = document.getElementById('checklist_input_deadline').value;
        }
    } else {
        // Создание
        const newItem = {
            id: Date.now(),
            text: text,
            completed: false
        };
        
        if (type === 'recurring') {
            newItem.frequency = parseInt(document.getElementById('checklist_input_freq').value);
            // Новая задача должна быть выполнена сегодня
            newItem.nextDate = new Date().toISOString().split('T')[0]; 
        }
        
        if (type === 'deadline') {
            newItem.deadline = document.getElementById('checklist_input_deadline').value;
        }
        
        checklist_data.push(newItem);
    }
    
    checklist_saveData();
    checklist_closeModal();
    checklist_renderList();
}

function checklist_editTask(id) {
    checklist_openModal(id);
}

function checklist_deleteTask(id) {
    if(confirm('Удалить эту задачу?')) {
        checklist_data = checklist_data.filter(i => i.id !== id);
        checklist_saveData();
        checklist_renderList();
    }
}

// --- ЛОГИКА ВЫПОЛНЕНИЯ ---

// Для Разное и Ежедневник (просто зачеркнуть)
function checklist_toggleSimple(id) {
    const item = checklist_data.find(i => i.id === id);
    item.completed = !item.completed;
    checklist_saveData();
    checklist_renderList();
}

// Для Уборки и Ухода (перенести на следующую дату)
function checklist_completeRecurring(id) {
    const item = checklist_data.find(i => i.id === id);
    
    // Вычисляем следующую дату
    const today = new Date();
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + parseInt(item.frequency));
    
    item.nextDate = nextDate.toISOString().split('T')[0];
    
    checklist_saveData();
    
    // Анимация исчезновения (опционально)
    checklist_renderList();
}
