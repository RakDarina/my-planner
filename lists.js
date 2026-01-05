if (!window.appData.myLists) {
    window.appData.myLists = [];
}

let lists_currentId = null;
let lists_selectedRating = 0;
let lists_editIndex = null; // Для отслеживания редактируемого элемента

function lists_save() {
    if (typeof saveData === 'function') saveData();
}

// Автоскролл вверх
function lists_scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function lists_renderMain() {
    lists_scrollTop(); // Скролл при входе в списки
    const container = document.getElementById('lists-container');
    if (!container) return;
    container.innerHTML = '';

    window.appData.myLists.forEach(list => {
        const card = document.createElement('div');
        card.className = 'goal-card';
        card.onclick = () => lists_openDetails(list.id);
        card.innerHTML = `
            <span style="font-weight:700; font-size:18px;">${list.title}</span>
            <div style="display:flex; gap:12px;">
                <span class="material-icons-round" style="color:var(--text-sec); font-size:20px;" onclick="event.stopPropagation(); lists_editListName(${list.id})">edit</span>
                <span class="material-icons-round" style="color:var(--danger); font-size:20px;" onclick="event.stopPropagation(); lists_deleteList(${list.id})">delete_outline</span>
            </div>
        `;
        container.appendChild(card);
    });
}

function lists_openDetails(id) {
    lists_currentId = id;
    lists_scrollTop(); // Скролл при открытии списка
    const list = window.appData.myLists.find(l => l.id === id);
    document.getElementById('lists-details-title').innerText = list.title;
    document.getElementById('view-lists-main').classList.remove('active');
    document.getElementById('view-list-details').classList.add('active');
    lists_renderItems();
}

// Рендер элементов с датой
function lists_renderItems() {
    const list = window.appData.myLists.find(l => l.id === lists_currentId);
    const container = document.getElementById('lists-items-list');
    container.innerHTML = '';

    list.items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'goal-card';
        div.style.flexDirection = 'column';
        div.style.alignItems = 'flex-start';
        
        div.innerHTML = `
            <div style="width:100%; display:flex; justify-content:space-between; margin-bottom:4px;">
                <span style="font-size:12px; color:var(--text-sec); font-weight:500;">${item.date || ''}</span>
                <div style="color:#FFCC00; font-size:14px;">${'★'.repeat(item.rating)}${'☆'.repeat(5-item.rating)}</div>
            </div>
            <div style="font-weight:700; font-size:17px; margin-bottom:6px;">${item.name}</div>
            ${item.note ? `<div style="font-size:14px; color:#636366; line-height:1.4;">${item.note}</div>` : ''}
            <div style="display:flex; gap:15px; margin-top:12px; width:100%; justify-content:flex-end; border-top:1px solid #F2F2F7; padding-top:8px;">
                <span class="material-icons-round" style="font-size:18px; color:var(--text-sec);" onclick="lists_editItem(${index})">edit</span>
                <span class="material-icons-round" style="font-size:18px; color:var(--danger);" onclick="lists_deleteItem(${index})">delete_outline</span>
            </div>
        `;
        container.appendChild(div);
    });
}

// Открытие модалки для создания
function lists_openModal() {
    lists_editIndex = null; // Сбрасываем индекс редактирования
    document.getElementById('lists-modal').style.display = 'flex';
    document.querySelector('#lists-modal h3').innerText = "Новая запись";
    lists_setRating(0);
}

// Редактирование записи через модалку (теперь со звездами!)
function lists_editItem(index) {
    lists_editIndex = index;
    const list = window.appData.myLists.find(l => l.id === lists_currentId);
    const item = list.items[index];

    document.getElementById('lists-modal').style.display = 'flex';
    document.querySelector('#lists-modal h3').innerText = "Редактировать";
    
    document.getElementById('lists-input-name').value = item.name;
    document.getElementById('lists-input-note').value = item.note;
    lists_setRating(item.rating);
}

// Сохранение (и для новых, и для старых)
function lists_addItem() {
    const name = document.getElementById('lists-input-name').value;
    const note = document.getElementById('lists-input-note').value;
    if (!name.trim()) return;

    const list = window.appData.myLists.find(l => l.id === lists_currentId);

    if (lists_editIndex !== null) {
        // Редактируем существующий
        list.items[lists_editIndex].name = name.trim();
        list.items[lists_editIndex].note = note.trim();
        list.items[lists_editIndex].rating = lists_selectedRating;
    } else {
        // Создаем новый
        list.items.push({
            name: name.trim(),
            note: note.trim(),
            rating: lists_selectedRating,
            date: new Date().toLocaleDateString('ru-RU'),
            timestamp: Date.now()
        });
    }

    lists_save();
    lists_closeModal();
    lists_renderItems();
}

function lists_setRating(n) {
    lists_selectedRating = n;
    const stars = document.querySelectorAll('#lists-star-rating span');
    stars.forEach((s, i) => {
        s.innerText = (i < n) ? 'star' : 'star_border';
        s.style.color = (i < n) ? '#FFCC00' : '#8E8E93';
    });
}

function lists_closeModal() {
    document.getElementById('lists-modal').style.display = 'none';
    document.getElementById('lists-input-name').value = '';
    document.getElementById('lists-input-note').value = '';
}

function lists_deleteItem(index) {
    if (confirm("Удалить запись?")) {
        const list = window.appData.myLists.find(l => l.id === lists_currentId);
        list.items.splice(index, 1);
        lists_save();
        lists_renderItems();
    }
}

function lists_createNewList() {
    const name = prompt("Введите название списка:");
    if (name && name.trim()) {
        window.appData.myLists.push({ id: Date.now(), title: name.trim(), items: [] });
        lists_save();
        lists_renderMain();
    }
}

function lists_editListName(id) {
    const list = window.appData.myLists.find(l => l.id === id);
    const newName = prompt("Новое название:", list.title);
    if (newName && newName.trim()) {
        list.title = newName.trim();
        lists_save();
        lists_renderMain();
    }
}

function lists_deleteList(id) {
    if (confirm("Удалить весь список?")) {
        window.appData.myLists = window.appData.myLists.filter(l => l.id !== id);
        lists_save();
        lists_renderMain();
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
