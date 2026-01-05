// Используем уникальные имена переменных
let currentListId = null; 

window.addEventListener('DOMContentLoaded', () => {
    // Ждем инициализации данных из основного скрипта
    setTimeout(() => {
        if (window.appData && !window.appData.lists) {
            window.appData.lists = []; 
        }
        renderListsMain();
    }, 100);
});

// Отрисовка главных карточек (категорий списков)
function renderListsMain() {
    const container = document.getElementById('lists-categories-container');
    if(!container || !window.appData || !window.appData.lists) return;
    
    container.innerHTML = '';
    
    window.appData.lists.forEach(list => {
        const div = document.createElement('div');
        div.className = 'goal-card'; // Используем ваш готовый стиль из CSS
        div.style.position = 'relative';
        div.style.cursor = 'pointer';
        div.innerHTML = `
            <div onclick="openListDetails(${list.id})">
                <h3 style="margin:0; font-size:18px; padding-right: 25px;">${list.title}</h3>
                <div style="font-size:12px; color:var(--text-sec); margin-top:5px;">
                    ${list.items ? list.items.length : 0} записей
                </div>
            </div>
            <button onclick="event.stopPropagation(); deleteListCategory(${list.id})" 
                    style="position:absolute; top:15px; right:15px; background:none; border:none; color:var(--danger); cursor:pointer;">
                <span class="material-icons-round" style="font-size:20px;">close</span>
            </button>
        `;
        container.appendChild(div);
    });
}

// Открытие списка и отрисовка его элементов
function openListDetails(id) {
    currentListId = id;
    const list = window.appData.lists.find(l => l.id === id);
    if (!list) return;

    const mainView = document.getElementById('lists-view-main');
    const detailsView = document.getElementById('lists-view-details');
    
    if (mainView && detailsView) {
        mainView.style.display = 'none';
        detailsView.style.display = 'block';
        document.getElementById('current-list-title').innerText = list.title;
        renderListItems(); // Рисуем содержимое списка
    }
}

// Отрисовка самих записей внутри списка
function renderListItems() {
    const container = document.getElementById('list-items-container');
    if (!container) return;
    
    const list = window.appData.lists.find(l => l.id === currentListId);
    container.innerHTML = '';

    if (list && list.items) {
        list.items.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'item-card'; // Ваш стиль из CSS
            div.innerHTML = `
                <span style="flex:1; font-size:16px;">${item}</span>
                <button onclick="deleteListItem(${index})" class="btn-control delete-btn">
                    <span class="material-icons-round">delete_outline</span>
                </button>
            `;
            container.appendChild(div);
        });
    }
}

// Добавление новой строки в список
function addListItem() {
    const input = document.getElementById('list-item-input');
    if (!input || !input.value.trim()) return;

    const list = window.appData.lists.find(l => l.id === currentListId);
    if (list) {
        list.items.push(input.value.trim());
        input.value = '';
        saveData(); // Сохраняем глобально
        renderListItems();
    }
}

// Удаление строки из списка
function deleteListItem(index) {
    const list = window.appData.lists.find(l => l.id === currentListId);
    if (list) {
        list.items.splice(index, 1);
        saveData();
        renderListItems();
    }
}

function deleteListCategory(id) {
    if(confirm('Удалить этот список целиком?')) {
        window.appData.lists = window.appData.lists.filter(l => l.id !== id);
        saveData();
        renderListsMain();
    }
}

function goBackToLists() {
    const mainView = document.getElementById('lists-view-main');
    const detailsView = document.getElementById('lists-view-details');
    if (mainView && detailsView) {
        mainView.style.display = 'block';
        detailsView.style.display = 'none';
        renderListsMain(); // Обновляем счетчик записей на главной
    }
}

// Модалка создания нового списка
function openListModal() {
    const modal = document.getElementById('modal-list-category');
    if (modal) modal.style.display = 'flex';
}

function saveListCategory() {
    const input = document.getElementById('list-name-input');
    const name = input ? input.value.trim() : "";
    
    if (name) {
        if (!window.appData.lists) window.appData.lists = [];
        window.appData.lists.push({
            id: Date.now(),
            title: name,
            items: []
        });
        
        saveData();
        renderListsMain();
        input.value = '';
        closeModals(); // Общая функция из script.js
    }
}
