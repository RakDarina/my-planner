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

// Уникальное имя функции для отрисовки
function renderListsMain() {
    const container = document.getElementById('lists-categories-container');
    if(!container || !window.appData || !window.appData.lists) return;
    
    container.innerHTML = '';
    
    window.appData.lists.forEach(list => {
        const div = document.createElement('div');
        div.className = 'list-card'; // Проверьте, что в CSS есть этот класс
        div.style.position = 'relative';
        div.innerHTML = `
            <div onclick="openListDetails(${list.id})">
                <h3 style="margin:0; font-size:18px;">${list.title}</h3>
                <div style="font-size:12px; color:#888; margin-top:5px;">${list.items ? list.items.length : 0} записей</div>
            </div>
            <button onclick="deleteListCategory(${list.id})" 
                    style="position:absolute; top:10px; right:10px; background:none; border:none; color:red; cursor:pointer;">
                <span class="material-icons-round" style="font-size:20px;">close</span>
            </button>
        `;
        container.appendChild(div);
    });
}

// Открытие модалки (уникальное имя)
function openListModal() {
    const modal = document.getElementById('modal-list-category');
    if (modal) modal.style.display = 'flex';
}

// Сохранение (уникальное имя)
function saveListCategory() {
    const input = document.getElementById('list-name-input');
    const name = input.value.trim();
    
    if (name) {
        if (!window.appData.lists) window.appData.lists = [];
        window.appData.lists.push({
            id: Date.now(),
            title: name,
            items: []
        });
        
        // Вызываем общую функцию сохранения из script.js
        if (typeof saveData === 'function') {
            saveData();
        } else {
            localStorage.setItem('myPlannerData', JSON.stringify(window.appData));
        }
        
        renderListsMain();
        input.value = '';
        closeModals(); // Эта функция общая в script.js
    }
}

function openListDetails(id) {
    currentListId = id;
    const list = window.appData.lists.find(l => l.id === id);
    if (!list) return;

    document.getElementById('lists-view-main').style.display = 'none';
    document.getElementById('lists-view-details').style.display = 'block';
    document.getElementById('current-list-title').innerText = list.title;
}

function deleteListCategory(id) {
    if(confirm('Удалить этот список?')) {
        window.appData.lists = window.appData.lists.filter(l => l.id !== id);
        saveData();
        renderListsMain();
    }
}
