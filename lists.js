let currentListId = null; 
let editingItemId = null; 

window.addEventListener('DOMContentLoaded', () => {
    if (!window.appData) {
        window.appData = JSON.parse(localStorage.getItem('myPlannerData')) || {};
    }
    if (!window.appData.lists) {
        window.appData.lists = []; 
    }
    renderCategories();
});

// --- КАТЕГОРИИ ---
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
        id: Date.now(),
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
    renderCategories();
}

// --- ЗАПИСИ (ЭЛЕМЕНТЫ СПИСКА) ---
function renderItems() {
    const container = document.getElementById('list-items-container');
    const sortMode = document.getElementById('sort-select').value;
    const list = window.appData.lists.find(l => l.id === currentListId);
    
    if (!list || !container) return;
    
    container.innerHTML = '';

    let sortedItems = [...list.items];

    // Сортировка
    if (sortMode === 'year') {
        // По году выхода произведения (который ты вводишь вручную)
        sortedItems.sort((a, b) => (b.year || 0) - (a.year || 0));
    } else if (sortMode === 'alpha') {
        sortedItems.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortMode === 'rating') {
        sortedItems.sort((a, b) => b.rating - a.rating);
    } else {
        // По дате добавления (используем ID, так как это timestamp)
        // Новые сверху
        sortedItems.sort((a, b) => b.id - a.id);
    }

    sortedItems.forEach(item => {
        // Логика звезд: если рейтинг > 0, рисуем звезды. Если 0 - пустую строку.
        let starsHtml = '';
        if (item.rating && item.rating > 0) {
            starsHtml = `<span class="rating-stars" style="color: #ffc107; font-size: 16px;">${'★'.repeat(item.rating)}</span>`;
        }

        // Логика даты добавления
        const dateAddedStr = item.dateAdded || 'Дата не указана';

        const div = document.createElement('div');
        div.className = 'item-card';
        div.innerHTML = `
            <div class="item-info" style="flex:1;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <h4 style="margin:0 0 5px 0; font-size: 18px;">${item.title}</h4>
                </div>
                
                <div class="item-meta" style="font-size: 13px; color: #666; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 6px;">
                    ${starsHtml}
                    ${item.year ? `<span style="background:#eee; padding:2px 8px; border-radius:6px; font-weight:bold;">${item.year} г.</span>` : ''}
                </div>

                <div style="font-size: 11px; color: #aaa; margin-bottom: 8px;">
                    Добавлено: ${dateAddedStr}
                </div>

                ${item.note ? `<div class="item-note">${item.note}</div>` : ''}
            </div>
            
            <div class="item-controls">
                <button onclick="editItem(${item.id})" class="btn-control edit-btn">
                    <span class="material-icons-round">edit</span>
                </button>
                <button onclick="deleteItem(${item.id})" class="btn-control delete-btn">
                    <span class="material-icons-round">delete</span>
                </button>
            </div>
        `;
        container.appendChild(div);
    });
}

function openItemModal() {
    editingItemId = null;
    document.getElementById('modal-item').style.display = 'flex';
    document.getElementById('item-modal-title').innerText = "Добавить запись";
    
    document.getElementById('item-name').value = '';
    document.getElementById('item-year').value = '';
    document.getElementById('item-rating').value = '0';
    document.getElementById('item-note').value = '';
}

function editItem(itemId) {
    editingItemId = itemId;
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

    // Форматируем текущую дату: "5 января 2026 г."
    const today = new Date().toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    if (editingItemId) {
        // Редактирование
        const itemIndex = window.appData.lists[listIndex].items.findIndex(i => i.id === editingItemId);
        if (itemIndex > -1) {
            const oldItem = window.appData.lists[listIndex].items[itemIndex];
            window.appData.lists[listIndex].items[itemIndex] = {
                ...oldItem,
                title, year, rating, note
                // При редактировании дату добавления НЕ меняем, оставляем старую
            };
        }
    } else {
        // Создание нового
        const newItem = {
            id: Date.now(),
            title, year, rating, note,
            dateAdded: today // Сохраняем дату добавления
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

function closeModals() {
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
}

function saveData() {
    localStorage.setItem('myPlannerData', JSON.stringify(window.appData));
}
