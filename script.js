// 1. ХРАНИЛИЩЕ ДАННЫХ
let appData = JSON.parse(localStorage.getItem('myPlannerData')) || {
    categories: [],
    lists: [],
    diaryEntries: [],
    moods: {},
    waterCurrent: 0
};

function saveData() {
    localStorage.setItem('myPlannerData', JSON.stringify(appData));
    updateTotalProgress();
}

// 2. НАВИГАЦИЯ
function switchTab(tabId, btn) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    btn.classList.add('active');
    
    if(tabId === 'view-goals') renderGoals();
    if(tabId === 'view-mental') { renderMood(); renderWater(); }
    if(tabId === 'view-lists') renderLists();
    if(tabId === 'view-diary') renderDiary();
}

function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModals() { document.querySelectorAll('.modal').forEach(m => m.style.display = 'none'); }

// 3. ЦЕЛИ
function renderGoals() {
    const container = document.getElementById('goals-list');
    container.innerHTML = '';
    appData.categories.forEach((cat, idx) => {
        const div = document.createElement('div');
        div.className = 'goal-card';
        div.innerHTML = `<h3>${cat.title}</h3><p style="color:gray">Нажмите, чтобы открыть (в разработке)</p>`;
        container.appendChild(div);
    });
}

function saveGoalCategory() {
    const val = document.getElementById('goal-name-input').value;
    if(val) {
        appData.categories.push({title: val, tasks: []});
        saveData(); renderGoals(); closeModals();
        document.getElementById('goal-name-input').value = '';
    }
}

// 4. ВОДА И НАСТРОЕНИЕ
function renderWater() {
    const container = document.getElementById('glasses-container');
    document.getElementById('water-current').innerText = appData.waterCurrent;
    container.innerHTML = '';
    for(let i=0; i<8; i++) {
        const glass = document.createElement('div');
        glass.innerHTML = `<span class="material-icons-round" style="font-size:40px; color:${i*250 < appData.waterCurrent ? '#2196f3' : '#eee'}; cursor:pointer">water_drop</span>`;
        glass.onclick = () => { appData.waterCurrent = (i+1)*250; saveData(); renderWater(); };
        container.appendChild(glass);
    }
}

let moodDate = new Date();
function renderMood() {
    const grid = document.getElementById('mood-pixel-grid');
    document.getElementById('mood-month-title').innerText = moodDate.toLocaleDateString('ru-RU', {month:'long'});
    grid.innerHTML = '';
    const days = new Date(moodDate.getFullYear(), moodDate.getMonth()+1, 0).getDate();
    for(let d=1; d<=days; d++) {
        const key = `${moodDate.getFullYear()}-${moodDate.getMonth()}-${d}`;
        const p = document.createElement('div');
        p.className = `mood-pixel ${appData.moods[key] || ''}`;
        p.onclick = () => { window.currentMoodKey = key; openModal('modal-mood'); };
        grid.appendChild(p);
    }
}
function setMood(type) { appData.moods[window.currentMoodKey] = type; saveData(); renderMood(); closeModals(); }
function changeMoodMonth(v) { moodDate.setMonth(moodDate.getMonth()+v); renderMood(); }

// 5. СПИСКИ
let currentListId = null;
function renderLists() {
    const container = document.getElementById('lists-categories-container');
    container.innerHTML = '';
    appData.lists.forEach((list, idx) => {
        const div = document.createElement( 'div');
        div.className = 'goal-card';
        div.onclick = () => {
            currentListId = idx;
            document.getElementById('lists-view-main').style.display = 'none';
            document.getElementById('lists-view-details').style.display = 'block';
            document.getElementById('current-list-title').innerText = list.title;
            renderItems();
        };
        div.innerHTML = `<h3>${list.title}</h3><small>${list.items.length} пунктов</small>`;
        container.appendChild(div);
    });
}
function saveListCategory() {
    const val = document.getElementById('list-name-input').value;
    if(val) {
        appData.lists.push({title: val, items: []});
        saveData(); renderLists(); closeModals();
        document.getElementById('list-name-input').value = '';
    }
}
function renderItems() {
    const list = appData.lists[currentListId];
    document.getElementById('list-items-container').innerHTML = list.items.map(i => `<div class="item-card">${i}</div>`).join('');
}
function addListItem() {
    const val = document.getElementById('list-item-input').value;
    if(val) {
        appData.lists[currentListId].items.push(val);
        saveData(); renderItems();
        document.getElementById('list-item-input').value = '';
    }
}
function goBackToLists() {
    document.getElementById('lists-view-main').style.display = 'block';
    document.getElementById('lists-view-details').style.display = 'none';
}

// 6. ДНЕВНИК
let diaryMonth = new Date();
function renderDiary() {
    const container = document.getElementById('diary-list-container');
    document.getElementById('diary-month-title').innerText = diaryMonth.toLocaleDateString('ru-RU', {month:'long', year:'numeric'});
    container.innerHTML = '';
    const entries = appData.diaryEntries.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === diaryMonth.getMonth() && d.getFullYear() === diaryMonth.getFullYear();
    });
    entries.forEach(e => {
        const div = document.createElement('div');
        div.className = 'diary-card';
        div.innerHTML = `<div class="diary-day-number">${new Date(e.date).getDate()}</div><div>${e.text}</div>`;
        container.appendChild(div);
    });
}
function saveDiaryEntry() {
    const text = document.getElementById('diary-text-input').value;
    const date = document.getElementById('diary-date-input').value;
    if(text && date) {
        appData.diaryEntries.push({text, date});
        saveData(); renderDiary(); closeModals();
    }
}
function changeDiaryMonth(v) { diaryMonth.setMonth(diaryMonth.getMonth()+v); renderDiary(); }

function updateTotalProgress() {
    // Упрощенная логика для примера
    document.getElementById('total-percent').innerText = '0%';
}

// ЗАПУСК
window.onload = () => { renderGoals(); };
