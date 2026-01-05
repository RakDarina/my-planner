let currentListId = null; 
let editingItemId = null; 

window.addEventListener('DOMContentLoaded', () => {
    if (!window.appData) {
        window.appData = JSON.parse(localStorage.getItem('myPlannerData')) || {};
    }
    if (!window.appData.lists) {
        window.appData.lists = []; 
    }
    renderListCategories();
});

// --- КАТЕГОРИИ СПИСКОВ ---
function renderListCategories() {
    const container = document.getElementById('lists-categories-container');
    if(!container) return;
    
    container.innerHTML = '';
    
    window.appData.lists.forEach(list => {
        const div = document.createElement('div');
        div.className = 'list-card';
        div.style.position = 'relative'; // Для позиционирования кнопки удаления
        div.innerHTML = `
            <h3 onclick="openList(${list.id})">${list.title}</h3>
            <div style="font-size:12px; color:#888; margin-bottom:10px;">${list.items ? list.items.length : 0} записей</div>
            <div style="position:absolute; top:10px; right:10px;">
                <button onclick="deleteListCategory(${list.id})" class="btn-control delete-icon" style="background:none; border:none; cursor:pointer; color:var(--danger)">✕</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function openListModal() {
    const modal = document.getElementById('modal-list-category');
    if (modal) {
        modal.style.display = 'flex';
        document.getElementById('list-name-input').value = '';
    }
}

function saveListCategory() {
    const input = document.getElementById('list-name-input');
    const name = input.value.trim();
    
    if (!name) return alert("Введите название!");

    const newList = {
        id: Date.now(),
        title: name,
        items: []
    };

    if (!window.appData.lists) window.appData.lists = [];
    window.appData.lists.push(newList);
    
    saveListData();
    renderListCategories();
    closeAllModals();
}

function deleteListCategory(id) {
    if(confirm('Удалить весь список и все записи в нем?')) {
        window.appData.lists = window.appData.lists.filter(l => l.id !== id);
        saveListData();
        renderListCategories();
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
    
    renderListItems();
}

function backToCategories() {
    currentListId = null;
    document.getElementById('lists-view-main').style.display = 'block';
    document.getElementById('lists-view-details').style.display = 'none';
    renderListCategories();
}

// --- ЗАПИСИ ВНУТРИ СПИСКА ---
function renderListItems() {
    const container = document.getElementById('list-items-container');
    if (!container) return;
    
    const list = window.appData.lists.find(l => l.id === currentListId);
    if (!list) return;
    
    container.innerHTML = '';

    // Если в HTML нет селектора сортировки, просто выводим список
    let items = [...list.items];

    items.forEach(item => {
        let starsHtml = '';
        if (item.rating && item.rating > 0) {
            starsHtml = `<span style="color: #ffc107;">${'★'.repeat(item.rating)}</span>`;
        }

        const div = document.createElement('div');
        div.className = 'item-card';
        div.style.background = 'white';
        div.style.padding = '15px';
        div.style.borderRadius = '15px';
        div.style.marginBottom = '10px';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        
        div.innerHTML = `
            <div>
                <h4 style="margin:0">${item.title}</h4>
                <div style="font-size:13px; margin:5px 0;">${starsHtml} ${item.year ? `• ${item.year} г.` : ''}</div>
                ${item.note ? `<div style="font-size:12px; color:#666;">${item.note}</div>` : ''}
            </div>
            <div class="item-controls" style="display:flex; gap:10px;">
                 <button onclick="deleteListItem(${item.id})" style="border:none; background:none; color:var(--danger)" class="material-icons-round">delete</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function deleteListItem(itemId) {
    if (!confirm('Удалить эту запись?')) return;
    
    const list = window.appData.lists.find(l => l.id === currentListId);
    if (list) {
        list.items = list.items.filter(i => i.id !== itemId);
        saveListData();
        renderListItems();
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
}

function saveListData() {
    localStorage.setItem('myPlannerData', JSON.stringify(window.appData));
}
