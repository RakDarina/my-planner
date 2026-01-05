// Инициализация данных
window.appData = JSON.parse(localStorage.getItem('myPlannerData')) || {
    year: "2026",
    categories: [],
    lists: [],
    diaryEntries: [],
    moods: {},
    water: { goal: 2000, current: 0 }
};

// Сохранение
window.saveData = function() {
    localStorage.setItem('myPlannerData', JSON.stringify(window.appData));
    if (typeof renderCategories === 'function') renderCategories();
    if (typeof updateTotalProgress === 'function') updateTotalProgress();
};

// Переключение вкладок
function switchTab(tabId, btn) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    btn.classList.add('active');

    // Обновляем данные при переходе
    if (tabId === 'view-goals') renderCategories();
    if (tabId === 'view-mental') { renderMood(); updateWaterUI(); }
    if (tabId === 'view-lists') renderListsMain();
    if (tabId === 'view-diary') renderDiary();
}

function closeModals() {
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
}

// Функции для целей
function openGoalModal() { document.getElementById('modal-goal-category').style.display = 'flex'; }

function saveGoalCategory() {
    const input = document.getElementById('goal-name-input');
    if (input.value.trim()) {
        window.appData.categories.push({ id: Date.now(), title: input.value.trim(), tasks: [] });
        saveData();
        input.value = '';
        closeModals();
        renderCategories();
    }
}

// Запуск при старте
window.onload = () => {
    renderCategories();
    updateTotalProgress();
};
