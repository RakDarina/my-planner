// Инициализация данных, если их нет
if (!window.appData.myLists) {
    window.appData.myLists = [];
}

let lists_currentListId = null;
let lists_tempRating = 0;

// Функция для авто-скролла вверх
function lists_scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 1. Управление списками (Главный экран)
function lists_renderMain() {
    lists_scrollToTop();
    const container = document.getElementById('lists-container');
    container.innerHTML = '';

    window.appData.myLists.forEach(list => {
        const div = document.createElement('div');
        div.className = 'goal-card'; // Используем твой стиль карточек
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center">
                <span style="font-weight:700; font-size:18px" onclick="lists_openList(${list.id})">${list.title}</span>
                <div style="display:flex; gap:10px">
                    <span class="material-icons-round" style="color:var(--text-sec); font-size:20px" onclick="lists_editListName(${list.id})">edit</span>
                    <span class="material-icons-round" style="color:var(--danger); font-size:20px" onclick="lists_deleteList(${list.id})">delete_outline</span>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

function lists_createNewList() {
    const name = prompt("Название нового списка:");
    if (name) {
        window.appData.myLists.push({ id: Date.now(), title: name, items: [] });
        saveData();
        lists_renderMain();
    }
}

// 2. Внутри списка
function lists_openList(id) {
    lists_currentListId = id;
    const list = window.appData.myLists.find(l => l.id === id);
    document.getElementById('lists-details-title').innerText = list.title;
    
    document.getElementById('view-lists-main').classList.remove('active');
    document.getElementById('view-list-details').classList.add('active');
    lists_renderItems();
}

function lists_renderItems() {
    lists_scrollToTop();
    const container = document.getElementById('lists-items-list');
    const list = window.appData.myLists.find(l => l.id === lists_currentListId);
    container.innerHTML = '';

    list.items.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'lists-item-card';
        card.innerHTML = `
            <div class="lists-item-date">${item.date}</div>
            <div class="lists-item-header">
                <div style="font-weight:700; font-size:18px">${item.name}</div>
                <div class="lists-stars-display">${'★'.repeat(item.rating)}${'☆'.repeat(5-item.rating)}</div>
            </div>
            <div style="margin-top:10px; font-size:14px; color:#444; white-space: pre-wrap;">${item.note}</div>
            <div style="display:flex; justify-content:flex-end; gap:15px; margin-top:10px; border-top:1px solid #f2f2f7; padding-top:10px">
                <span class="material-icons-round" style="color:var(--text-sec); font-size:18px" onclick="lists_editItem(${index})">edit</span>
                <span class="material-icons-round" style="color:var(--danger); font-size:18px" onclick="lists_deleteItem(${index})">delete_outline</span>
            </div>
        `;
        container.appendChild(card);
    });
}

// 3. Работа с формой (Модалка)
function lists_openModal() {
    document.getElementById('lists-modal').style.display = 'flex';
    lists_setStars(0);
}

function lists_closeModal() {
    document.getElementById('lists-modal').style.display = 'none';
    document.getElementById('lists-input-name').value = '';
    document.getElementById('lists-input-note').value = '';
}

function lists_setStars(count) {
    lists_tempRating = count;
    const stars = document.querySelectorAll('#lists-star-rating span');
    stars.forEach((s, i) => {
        s.innerText = i < count ? 'star' : 'star_border';
        s.style.color = i < count ? '#FFCC00' : '#8E8E93';
    });
}

function lists_addItem() {
    const name = document.getElementById('lists-input-name').value;
    const note = document.getElementById('lists-input-note').value;
    if (!name) return;

    const list = window.appData.myLists.find(l => l.id === lists_currentListId);
    const date = new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });

    list.items.push({
        name: name,
        note: note,
        rating: lists_tempRating,
        date: date,
        timestamp: Date.now()
    });

    saveData();
    lists_closeModal();
    lists_renderItems();
}

// 4. Сортировка
function lists_sort(type) {
    const list = window.appData.myLists.find(l => l.id === lists_currentListId);
    if (type === 'date') list.items.sort((a, b) => b.timestamp - a.timestamp);
    if (type === 'alpha') list.items.sort((a, b) => a.name.localeCompare(b.name));
    if (type === 'rank') list.items.sort((a, b) => b.rating - a.rating);
    lists_renderItems();
}

function lists_goBack() {
    document.getElementById('view-list-details').classList.remove('active');
    document.getElementById('view-lists-main').classList.add('active');
    lists_renderMain();
}

// Удаление и редактирование списков
function lists_deleteList(id) {
    if(confirm("Удалить весь список?")) {
        window.appData.myLists = window.appData.myLists.filter(l => l.id !== id);
        saveData(); lists_renderMain();
    }
}

// Авто-увеличение поля ввода
document.getElementById('lists-input-note').addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});
