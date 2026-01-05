// 1. Инициализация данных
if (!window.appData.myLists) {
    window.appData.myLists = [];
}

let lists_currentId = null;
let lists_selectedRating = 0;

// Функция для сохранения (вызывает глобальную saveData из script.js)
function lists_save() {
    if (typeof saveData === 'function') {
        saveData();
    }
}

// 2. Рендер главной страницы списков
function lists_renderMain() {
    const container = document.getElementById('lists-container');
    if (!container) return;
    container.innerHTML = '';

    window.appData.myLists.forEach(list => {
        const card = document.createElement('div');
        card.className = 'goal-card';
        card.style.cursor = 'pointer';
        card.style.display = 'flex';
        card.style.justifyContent = 'space-between';
        card.style.alignItems = 'center';
        
        // Клик по всей карточке открывает детали
        card.onclick = () => lists_openDetails(list.id);

        card.innerHTML = `
            <span style="font-weight:700; font-size:18px;">${list.title}</span>
            <div style="display:flex; gap:12px;">
                <span class="material-icons-round" style="color:var(--text-sec); font-size:20px;" 
                    onclick="event.stopPropagation(); lists_editListName(${list.id})">edit</span>
                <span class="material-icons-round" style="color:var(--danger); font-size:20px;" 
                    onclick="event.stopPropagation(); lists_deleteList(${list.id})">delete_outline</span>
            </div>
        `;
        container.appendChild(card);
    });
}

// 3. Создание и Редактирование названия списка
function lists_createNewList() {
    const name = prompt("Введите название списка:");
    if (name && name.trim()) {
        const newList = { id: Date.now(), title: name.trim(), items: [] };
        window.appData.myLists.push(newList);
        lists_save();
        lists_renderMain();
    }
}

function lists_editListName(id) {
    const list = window.appData.myLists.find(l => l.id === id);
    const newName = prompt("Новое название списка:", list.title);
    if (newName && newName.trim()) {
        list.title = newName.trim();
        lists_save();
        lists_renderMain();
    }
}

// 4. Работа с деталями списка
function lists_openDetails(id) {
    lists_currentId = id;
    const list = window.appData.myLists.find(l => l.id === id);
    document.getElementById('lists-details-title').innerText = list.title;
    
    document.getElementById('view-lists-main').classList.remove('active');
    document.getElementById('view-list-details').classList.add('active');
    lists_renderItems();
}

function lists_goBack() {
    document.getElementById('view-list-details').classList.remove('active');
    document.getElementById('view-lists-main').classList.add('active');
    lists_renderMain();
}

// 5. Рендер элементов (фильмов/книг) внутри списка
function lists_renderItems() {
    const list = window.appData.myLists.find(l => l.id === lists_currentId);
    const container = document.getElementById('lists-items-list');
    if (!container) return;
    container.innerHTML = '';

    list.items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'goal-card'; // Используем твой стиль карточек
        div.style.flexDirection = 'column';
        div.style.alignItems = 'flex-start';
        
        div.innerHTML = `
            <div style="width:100%; display:flex; justify-content:space-between; align-items:center;">
                <div style="font-weight:700; font-size:17px;">${item.name}</div>
                <div style="color:#FFCC00; letter-spacing:2px;">${'★'.repeat(item.rating)}${'☆'.repeat(5-item.rating)}</div>
            </div>
            ${item.note ? `<div style="font-size:14px; color:var(--text-sec); margin-top:8px;">${item.note}</div>` : ''}
            <div style="display:flex; gap:15px; margin-top:12px; width:100%; justify-content:flex-end; border-top:1px solid #f0f0f0; padding-top:8px;">
                <span class="material-icons-round" style="font-size:18px; color:var(--text-sec);" onclick="lists_editItem(${index})">edit</span>
                <span class="material-icons-round" style="font-size:18px; color:var(--danger);" onclick="lists_deleteItem(${index})">delete_outline</span>
            </div>
        `;
        container.appendChild(div);
    });
}

// 6. Управление Модальным окном и Звездами
function lists_openModal() {
    document.getElementById('lists-modal').style.display = 'flex';
    lists_setRating(0); // Сброс при открытии
}

function lists_closeModal() {
    document.getElementById('lists-modal').style.display = 'none';
    document.getElementById('lists-input-name').value = '';
    document.getElementById('lists-input-note').value = '';
}

function lists_setRating(n) {
    lists_selectedRating = n;
    const stars = document.querySelectorAll('#lists-star-rating span');
    stars.forEach((s, i) => {
        if (i < n) {
            s.innerText = 'star';
            s.style.color = '#FFCC00';
        } else {
            s.innerText = 'star_border';
            s.style.color = '#8E8E93';
        }
    });
}

// 7. Добавление/Удаление/Редактирование записей
function lists_addItem() {
    const name = document.getElementById('lists-input-name').value;
    const note = document.getElementById('lists-input-note').value;
    if (!name.trim()) return;

    const list = window.appData.myLists.find(l => l.id === lists_currentId);
    list.items.push({
        name: name.trim(),
        note: note.trim(),
        rating: lists_selectedRating,
        date: new Date().toLocaleDateString('ru-RU'),
        timestamp: Date.now()
    });

    lists_save();
    lists_closeModal();
    lists_renderItems();
}

function lists_editItem(index) {
    const list = window.appData.myLists.find(l => l.id === lists_currentId);
    const item = list.items[index];
    const newName = prompt("Название:", item.name);
    if (newName !== null) {
        item.name = newName.trim() || item.name;
        item.note = prompt("Заметка:", item.note) || "";
        lists_save();
        lists_renderItems();
    }
}

function lists_deleteItem(index) {
    if (confirm("Удалить запись?")) {
        const list = window.appData.myLists.find(l => l.id === lists_currentId);
        list.items.splice(index, 1);
        lists_save();
        lists_renderItems();
    }
}

function lists_deleteList(id) {
    if (confirm("Удалить весь список?")) {
        window.appData.myLists = window.appData.myLists.filter(l => l.id !== id);
        lists_save();
        lists_renderMain();
    }
}

// 8. Сортировка
function lists_sort(mode) {
    const list = window.appData.myLists.find(l => l.id === lists_currentId);
    if (mode === 'date') list.items.sort((a, b) => b.timestamp - a.timestamp);
    if (mode === 'alpha') list.items.sort((a, b) => a.name.localeCompare(b.name));
    if (mode === 'rank') list.items.sort((a, b) => b.rating - a.rating);
    lists_renderItems();
}
