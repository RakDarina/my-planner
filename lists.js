// Инициализация данных
if (!window.appData.myLists) {
    window.appData.myLists = [];
}

let lists_currentId = null;
let lists_selectedRating = 0;

function lists_scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 1. Рендер главных списков
function lists_renderMain() {
    lists_scrollTop();
    const container = document.getElementById('lists-container');
    if (!container) return;
    container.innerHTML = '';

    window.appData.myLists.forEach(list => {
        const card = document.createElement('div');
        card.className = 'goal-card';
        // ИСПРАВЛЕНО: Теперь весь блок кликабелен
        card.onclick = () => lists_openDetails(list.id);
        card.style.cursor = 'pointer';
        
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; width:100%">
                <span style="font-weight:700; font-size:18px; flex:1">${list.title}</span>
                <div style="display:flex; gap:10px">
                    <button class="icon-btn" onclick="event.stopPropagation(); lists_editListName(${list.id})">
                        <span class="material-icons-round" style="color:var(--text-sec); font-size:20px">edit</span>
                    </button>
                    <button class="icon-btn" onclick="event.stopPropagation(); lists_deleteList(${list.id})">
                        <span class="material-icons-round" style="color:var(--danger); font-size:20px">delete_outline</span>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// 2. Редактирование названия списка (ИСПРАВЛЕНО)
function lists_editListName(id) {
    const list = window.appData.myLists.find(l => l.id === id);
    const newName = prompt("Новое название списка:", list.title);
    if (newName && newName.trim()) {
        list.title = newName.trim();
        saveData();
        lists_renderMain();
    }
}

// Открытие списка
function lists_openDetails(id) {
    lists_currentId = id;
    const list = window.appData.myLists.find(l => l.id === id);
    document.getElementById('lists-details-title').innerText = list.title;
    
    document.getElementById('view-lists-main').classList.remove('active');
    document.getElementById('view-list-details').classList.add('active');
    lists_renderItems();
}

// 3. Рендер элементов внутри списка
function lists_renderItems() {
    lists_scrollTop();
    const list = window.appData.myLists.find(l => l.id === lists_currentId);
    const container = document.getElementById('lists-items-list');
    container.innerHTML = '';

    list.items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'lists-item-card';
        div.innerHTML = `
            <div class="lists-item-date">${item.date}</div>
            <div class="lists-item-header">
                <div style="font-weight:700; font-size:18px">${item.name}</div>
                <div class="lists-stars-display">${'★'.repeat(item.rating)}${'☆'.repeat(5 - item.rating)}</div>
            </div>
            ${item.note ? `<div style="margin-top:10px; font-size:14px; white-space:pre-wrap;">${item.note}</div>` : ''}
            <div style="display:flex; justify-content:flex-end; gap:15px; margin-top:10px; padding-top:10px; border-top:1px solid #F2F2F7">
                <span class="material-icons-round" style="color:var(--text-sec); font-size:18px; cursor:pointer" onclick="lists_editItem(${index})">edit</span>
                <span class="material-icons-round" style="color:var(--danger); font-size:18px; cursor:pointer" onclick="lists_deleteItem(${index})">delete_outline</span>
            </div>
        `;
        container.appendChild(div);
    });
}

// ИСПРАВЛЕНО: Редактирование конкретной записи в списке
function lists_editItem(index) {
    const list = window.appData.myLists.find(l => l.id === lists_currentId);
    const item = list.items[index];
    
    const newName = prompt("Изменить название:", item.name);
    if (newName === null) return;
    
    const newNote = prompt("Изменить заметку:", item.note);
    if (newNote === null) return;

    item.name = newName.trim() || item.name;
    item.note = newNote.trim();
    
    saveData();
    lists_renderItems();
}

// ИСПРАВЛЕНО: Звездочки теперь нажимаются
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

// Остальные функции (без изменений, но убедись, что они есть)
function lists_createNewList() {
    const name = prompt("Название нового списка:");
    if (name && name.trim()) {
        window.appData.myLists.push({ id: Date.now(), title: name.trim(), items: [] });
        saveData();
        lists_renderMain();
    }
}

function lists_openModal() {
    document.getElementById('lists-modal').style.display = 'flex';
    lists_setRating(0);
}

function lists_closeModal() {
    document.getElementById('lists-modal').style.display = 'none';
    document.getElementById('lists-input-name').value = '';
    document.getElementById('lists-input-note').value = '';
}

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

    saveData();
    lists_closeModal();
    lists_renderItems();
}

function lists_deleteList(id) {
    if (confirm("Удалить весь список?")) {
        window.appData.myLists = window.appData.myLists.filter(l => l.id !== id);
        saveData();
        lists_renderMain();
    }
}

function lists_deleteItem(idx) {
    if (confirm("Удалить эту запись?")) {
        const list = window.appData.myLists.find(l => l.id === lists_currentId);
        list.items.splice(idx, 1);
        saveData();
        lists_renderItems();
    }
}

function lists_goBack() {
    document.getElementById('view-list-details').classList.remove('active');
    document.getElementById('view-lists-main').classList.add('active');
    lists_renderMain();
}

function lists_sort(mode) {
    const list = window.appData.myLists.find(l => l.id === lists_currentId);
    if (mode === 'date') list.items.sort((a, b) => b.timestamp - a.timestamp);
    if (mode === 'alpha') list.items.sort((a, b) => a.name.localeCompare(b.name));
    if (mode === 'rank') list.items.sort((a, b) => b.rating - a.rating);
    lists_renderItems();
}
