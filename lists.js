let currentListId = null; // ID открытого списка
let editingItemId = null; // ID записи, которую редактируем (если null - значит создаем новую)

window.addEventListener('DOMContentLoaded', () => {
    // 1. Инициализация хранилища
    if (!window.appData) {
        window.appData = JSON.parse(localStorage.getItem('myPlannerData')) || {};
    }
    if (!window.appData.lists) {
        window.appData.lists = []; // Массив списков: [{id, title, items: []}]
    }

    renderCategories();
});

// --- УПРАВЛЕНИЕ КАТЕГОРИЯМИ (Списки списков) ---

function renderCategories() {
    const container = document.getElementById('lists-categories-container');
    if(!container) return;
    
    container.innerHTML = '';
    
    window.appData.lists.forEach(list => {
        const div = document.createElement('div');
        div.className = 'list-card';
        div.innerHTML = `
            <h3 onclick="openList(${list.id})">${list.title}</h3>
            <div style="font-size:12px; color:#888; margin-bottom:10px;">${list.items.length} записей</div>
            <div style="position:absolute; top:10px; right:10px;">
                <button onclick="deleteCategory(${list.id})" class="btn-control delete-icon">✕</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function openListModal() {
    document.getElementById('modal-category').style.display = 'flex';
    document.getElementById('cat-name-input').value = '';
}

function saveCategory() {
    const name = document.getElementById('cat-name-input').value.trim();
    if (!name) return alert("Введите название!");

    const newList = {
        id: Date.now(), // Уникальный ID
        title: name,
        items: []
    };

    window.appData.lists.push(newList);
    saveData();
    renderCategories();
    closeModals();
}

function deleteCategory(id) {
    if(confirm('Удалить весь список и все записи в нем?')) {
        window.appData.lists = window.appData.lists.filter(l => l.id !== id);
        saveData();
        renderCategories();
    }
}

// --- НАВИГАЦИЯ ---

function openList(id) {
    currentListId = id;
    const list = window.appData.lists.find(l => l.id === id);
    if (!list) return;

    document.getElementById('lists-view-main').style.display = 'none';
    document.getElementById('lists-view-details').style.display = 'block';
    document.getElementById('current-list-title').innerText = list.title;
    
    renderItems();
}

function backToCategories() {
    currentListId = null;
    document.getElementById('lists-view-main').style.display = 'block';
    document.getElementById('lists-view-details').style.display = 'none';
    renderCategories(); // Обновить счетчики
}

// --- УПРАВЛЕНИЕ ЗАПИСЯМИ (Фильмы, Книги и т.д.) ---

function renderItems() {
    const container = document.getElementById('list-items-container');
    const sortMode = document.getElementById('sort-select').value;
    const list = window.appData.lists.find(l => l.id === currentListId);
    
    if (!list || !container) return;
    
    container.innerHTML = '';

    // Клонируем массив, чтобы не менять порядок в базе при сортировке
    let sortedItems = [...list.items];

    // Логика сортировки
    if (sortMode === 'year') {
        sortedItems.sort((a, b) => (b.year || 0) - (a.year || 0));
    } else if (sortMode === 'alpha') {
        sortedItems.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortMode === 'rating') {
        sortedItems.sort((a, b) => b.rating - a.rating);
    } else {
        // По дате добавления (по ID, так как ID = timestamp)
        sortedItems.sort((a, b) => b.id - a.id);
    }

    sortedItems.forEach(item => {
        const stars = '★'.repeat(item.rating) + '☆'.repeat(5 - item.rating);
        
        const div = document.createElement('div');
        div.className = 'item-card';
        div.innerHTML = `
            <div class="item-info" style="flex:1;">
                <h4>${item.title}</h4>
                <div class="item-meta">
                    <span class="rating-stars">${stars}</span>
                    ${item.year ? `<span style="background:#eee; padding:2px 6px; border-radius:4px;">${item.year}</span>` : ''}
                </div>
                ${item.note ? `<div class="item-note">${item.note}</div>` : ''}
            </div>
            <div style="display:flex; flex-direction:column; gap:5px;">
                <button onclick="editItem(${item.id})" class="btn-control">✏️</button>
                <button onclick="deleteItem(${item.id})" class="btn-control delete-icon">🗑️</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function openItemModal() {
    editingItemId = null; // Режим создания
    document.getElementById('modal-item').style.display = 'flex';
    document.getElementById('item-modal-title').innerText = "Добавить запись";
    
    // Очистка полей
    document.getElementById('item-name').value = '';
    document.getElementById('item-year').value = '';
    document.getElementById('item-rating').value = '0';
    document.getElementById('item-note').value = '';
}

function editItem(itemId) {
    editingItemId = itemId; // Режим редактирования
    const list = window.appData.lists.find(l => l.id === currentListId);
    const item = list.items.find(i => i.id === itemId);

    if (!item) return;

    document.getElementById('modal-item').style.display = 'flex';
    document.getElementById('item-modal-title').innerText = "Редактировать";
    
    document.getElementById('item-name').value = item.title;
    document.getElementById('item-year').value = item.year || '';
    document.getElementById('item-rating').value = item.rating;
    document.getElementById('item-note').value = item.note || '';
}

function saveItem() {
    const title = document.getElementById('item-name').value.trim();
    const year = parseInt(document.getElementById('item-year').value);
    const rating = parseInt(document.getElementById('item-rating').value);
    const note = document.getElementById('item-note').value.trim();

    if (!title) return alert("Введите название!");

    const listIndex = window.appData.lists.findIndex(l => l.id === currentListId);
    if (listIndex === -1) return;

    if (editingItemId) {
        // Редактирование
        const itemIndex = window.appData.lists[listIndex].items.findIndex(i => i.id === editingItemId);
        if (itemIndex > -1) {
            window.appData.lists[listIndex].items[itemIndex] = {
                ...window.appData.lists[listIndex].items[itemIndex], // сохраняем старые поля если есть
                title, year, rating, note
            };
        }
    } else {
        // Создание нового
        const newItem = {
            id: Date.now(),
            title, year, rating, note
        };
        window.appData.lists[listIndex].items.push(newItem);
    }

    saveData();
    renderItems();
    closeModals();
}

function deleteItem(itemId) {
    if (!confirm('Удалить эту запись?')) return;
    
    const listIndex = window.appData.lists.findIndex(l => l.id === currentListId);
    if (listIndex > -1) {
        window.appData.lists[listIndex].items = window.appData.lists[listIndex].items.filter(i => i.id !== itemId);
        saveData();
        renderItems();
    }
}

// --- ОБЩИЕ ФУНКЦИИ ---

function closeModals() {
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
}

function saveData() {
    localStorage.setItem('myPlannerData', JSON.stringify(window.appData));
}
