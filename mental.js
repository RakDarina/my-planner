window.addEventListener('DOMContentLoaded', () => {
    if (!window.appData) {
        window.appData = JSON.parse(localStorage.getItem('myPlannerData')) || {};
    }
    if (!window.appData.mental) {
        window.appData.mental = { gratitude: [], emotions: [], achievements: [], good_day: [] };
    }
    if (!window.appData.water) {
        window.appData.water = { current: 0, goal: 2000, glassSize: 250, consumedGlasses: 0 };
    }
    updateWaterUI();
});

// --- ТРЕКЕР ВОДЫ ---

function updateWaterUI() {
    const currentEl = document.getElementById('water-current');
    const goalEl = document.getElementById('water-goal');
    if (currentEl) currentEl.innerText = window.appData.water.current;
    if (goalEl) goalEl.innerText = window.appData.water.goal;
    
    const container = document.getElementById('glasses-container');
    if (!container) return;
    
    const totalGlasses = Math.ceil(window.appData.water.goal / window.appData.water.glassSize);
    container.innerHTML = '';
    
    for (let i = 0; i < totalGlasses; i++) {
        const glass = document.createElement('div');
        glass.className = 'glass-icon';
        if (i < window.appData.water.consumedGlasses) {
            glass.classList.add('active');
        }
        glass.innerHTML = '<div class="water"></div>';
        glass.onclick = () => toggleGlass(i);
        container.appendChild(glass);
    }
}

function toggleGlass(index) {
    const w = window.appData.water;
    if (index < w.consumedGlasses) {
        // Уменьшаем количество выпитого
        w.consumedGlasses = index;
        w.current = w.consumedGlasses * w.glassSize;
        saveData();
        updateWaterUI();
    } else {
        // Наполняем с анимацией 1 сек
        w.consumedGlasses = index + 1;
        w.current = w.consumedGlasses * w.glassSize;
        saveData();
        updateWaterUI();
        
        const container = document.getElementById('glasses-container');
        const glasses = container.querySelectorAll('.glass-icon');
        const targetGlass = glasses[index];

        if (targetGlass) {
            targetGlass.classList.remove('active');
            targetGlass.classList.add('animating');
            setTimeout(() => { targetGlass.classList.add('active'); }, 20);
            setTimeout(() => { targetGlass.classList.remove('animating'); }, 1000);
        }
    }
}

function openWaterSettings() {
    document.getElementById('water-modal').style.display = 'flex';
    document.getElementById('input-water-goal').value = window.appData.water.goal;
    document.getElementById('input-glass-size').value = window.appData.water.glassSize;
}

function closeWaterModal() { document.getElementById('water-modal').style.display = 'none'; }

function saveWaterSettings() {
    window.appData.water.goal = parseInt(document.getElementById('input-water-goal').value) || 2000;
    window.appData.water.glassSize = parseInt(document.getElementById('input-glass-size').value) || 250;
    window.appData.water.current = window.appData.water.consumedGlasses * window.appData.water.glassSize;
    saveData(); updateWaterUI(); closeWaterModal();
}

function calculateWaterGoal() {
    const weight = prompt("Введите ваш вес в кг:");
    if (weight) document.getElementById('input-water-goal').value = weight * 30;
}

// --- ДНЕВНИКИ (ТВОЙ КОД БЕЗ ИЗМЕНЕНИЙ) ---

function openMentalModal(question, defaultValue, onSave, isSMER = false) {
    const modal = document.getElementById('mental-modal');
    const textarea = document.getElementById('modal-textarea');
    const saveBtn = document.getElementById('modal-save-btn');
    document.getElementById('modal-question').innerText = question;

    if (isSMER) {
        textarea.style.display = 'none';
        let formHtml = `<div id="smer-form" style="display:flex; flex-direction:column; gap:10px; width:100%; text-align:left;">
            <div><b>1. Ситуация:</b><textarea id="sm-1" class="smer-input" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:8px;"></textarea></div>
            <div><b>2. Эмоции:</b><textarea id="sm-2" class="smer-input" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:8px;"></textarea></div>
            <div><b>3. Мысли:</b><textarea id="sm-3" class="smer-input" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:8px;"></textarea></div>
            <div><b>4. Поведение:</b><textarea id="sm-4" class="smer-input" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:8px;"></textarea></div>
            <div><b>5. Альтернатива:</b><textarea id="sm-5" class="smer-input" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:8px;"></textarea></div>
        </div>`;
        if (!document.getElementById('smer-form')) textarea.insertAdjacentHTML('afterend', formHtml);
        else document.getElementById('smer-form').style.display = 'flex';

        if (typeof defaultValue === 'object') {
            document.getElementById('sm-1').value = defaultValue.situation || "";
            document.getElementById('sm-2').value = defaultValue.emotion || "";
            document.getElementById('sm-3').value = defaultValue.thoughts || "";
            document.getElementById('sm-4').value = defaultValue.behavior || "";
            document.getElementById('sm-5').value = defaultValue.alternative || "";
        }
    } else {
        textarea.style.display = 'block';
        if (document.getElementById('smer-form')) document.getElementById('smer-form').style.display = 'none';
        textarea.value = defaultValue || "";
    }
    modal.style.display = 'flex';
    saveBtn.onclick = () => {
        if (isSMER) {
            onSave({
                situation: document.getElementById('sm-1').value,
                emotion: document.getElementById('sm-2').value,
                thoughts: document.getElementById('sm-3').value,
                behavior: document.getElementById('sm-4').value,
                alternative: document.getElementById('sm-5').value,
                isComplex: true
            });
        } else { onSave(textarea.value.trim()); }
        closeMentalModal();
    };
}

function closeMentalModal() {
    document.getElementById('mental-modal').style.display = 'none';
    const form = document.getElementById('smer-form');
    if (form) form.querySelectorAll('textarea').forEach(t => t.value = '');
}

function openDiary(type, title) {
    window.currentDiaryType = type;
    document.getElementById('diary-title').innerText = title;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('view-diary-details').classList.add('active');
    renderDiaryEntries();
}

function renderDiaryEntries() {
    const list = document.getElementById('diary-content-list');
    list.innerHTML = '';
    const entries = window.appData.mental[window.currentDiaryType] || [];
    entries.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'goal-card';
        let content = item.isComplex ? `
            <div style="font-size:14px; display:flex; flex-direction:column; gap:8px; white-space: pre-wrap;">
                <div><b>Ситуация:</b>\n${item.situation}</div>
                <div><b>Эмоции:</b>\n${item.emotion}</div>
                <div><b>Мысли:</b>\n${item.thoughts}</div>
                <div><b>Поведение:</b>\n${item.behavior}</div>
                <div style="color: #27ae60;"><b>Альтернатива:</b>\n${item.alternative}</div>
            </div>` : `<span style="font-size:16px; white-space: pre-wrap;">${item.text}</span>`;
        div.innerHTML = `<div style="display:flex; justify-content:space-between; margin-bottom:10px;">
            <b style="color:var(--primary)">${item.date}</b>
            <div style="display:flex; gap:10px;">
                <span class="material-icons-round" style="font-size:20px; color:var(--text-sec); cursor:pointer;" onclick="editDiaryEntry(${index})">edit</span>
                <span class="material-icons-round" style="font-size:20px; color:var(--danger); cursor:pointer;" onclick="deleteDiaryEntry(${index})">delete_outline</span>
            </div>
        </div>${content}`;
        list.appendChild(div);
    });
}

function addDiaryEntry() {
    const type = window.currentDiaryType;
    if (type === 'emotions') {
        openMentalModal("Новая запись СМЭР", {}, (data) => {
            window.appData.mental[type].push({ ...data, date: new Date().toLocaleDateString('ru-RU') });
            saveData(); renderDiaryEntries();
        }, true);
    } else {
        let q = type === 'achievements' ? "Достижение дня" : "За что вы благодарны?";
        openMentalModal(q, "", (text) => {
            window.appData.mental[type].push({ text, date: new Date().toLocaleDateString('ru-RU'), isComplex: false });
            saveData(); renderDiaryEntries();
        });
    }
}

function editDiaryEntry(index) {
    const type = window.currentDiaryType;
    const item = window.appData.mental[type][index];
    if (item.isComplex) {
        openMentalModal("Редактировать СМЭР", item, (data) => {
            window.appData.mental[type][index] = { ...data, date: item.date };
            saveData(); renderDiaryEntries();
        }, true);
    } else {
        openMentalModal("Редактировать", item.text, (text) => {
            window.appData.mental[type][index].text = text;
            saveData(); renderDiaryEntries();
        });
    }
}

function deleteDiaryEntry(index) {
    if (confirm("Удалить запись?")) {
        window.appData.mental[window.currentDiaryType].splice(index, 1);
        saveData(); renderDiaryEntries();
    }
}

// Инициализация данных сна
if (!window.appData.sleep) {
    window.appData.sleep = [];
}

let sleepChart = null;
let editingSleepIndex = null;

// Запуск при загрузке
window.addEventListener('DOMContentLoaded', () => {
    updateSleepUI();
});

function openSleepModal(index = null) {
    editingSleepIndex = index;
    const modal = document.getElementById('sleep-modal');
    const startInput = document.getElementById('sleep-start');
    const endInput = document.getElementById('sleep-end');
    
    if (index !== null) {
        const entry = window.appData.sleep[index];
        startInput.value = entry.start;
        endInput.value = entry.end;
        document.getElementById('sleep-modal-title').innerText = "Редактировать сон";
    } else {
        startInput.value = "";
        endInput.value = "";
        document.getElementById('sleep-modal-title').innerText = "Запись сна";
    }
    modal.style.display = 'flex';
}

function closeSleepModal() {
    document.getElementById('sleep-modal').style.display = 'none';
}

function saveSleepEntry() {
    const start = document.getElementById('sleep-start').value;
    const end = document.getElementById('sleep-end').value;

    if (!start || !end) return alert("Заполни время!");

    const duration = (new Date(end) - new Date(start)) / (1000 * 60 * 60); // часы
    if (duration <= 0) return alert("Время вставания должно быть позже времени начала сна!");

    const entry = {
        start,
        end,
        duration: parseFloat(duration.toFixed(1)),
        date: new Date(end).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
    };

    if (editingSleepIndex !== null) {
        window.appData.sleep[editingSleepIndex] = entry;
    } else {
        window.appData.sleep.push(entry);
    }

    saveData();
    closeSleepModal();
    updateSleepUI();
}

function deleteSleepEntry(index) {
    if (confirm("Удалить запись о сне?")) {
        window.appData.sleep.splice(index, 1);
        saveData();
        updateSleepUI();
    }
}

function updateSleepUI() {
    renderSleepList();
    renderSleepChart();
}

function renderSleepList() {
    const list = document.getElementById('sleep-list');
    if (!list) return;
    list.innerHTML = '';

    // Показываем последние 5 записей
    const displayEntries = [...window.appData.sleep].reverse().slice(0, 5);

    displayEntries.forEach((entry) => {
        // Находим оригинальный индекс в основном массиве для корректного удаления/правки
        const index = window.appData.sleep.indexOf(entry);
        const color = entry.duration >= 8 ? '#4caf50' : (entry.duration >= 6 ? '#ffc107' : '#f44336');
        
        const div = document.createElement('div');
        div.style.cssText = `
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            padding: 12px 0; 
            border-top: 1px solid #f0f0f0;
        `;
        
        div.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 8px; height: 8px; border-radius: 50%; background: ${color};"></div>
                <div>
                    <div style="font-size: 14px; font-weight: 600;">${entry.date}</div>
                    <div style="font-size: 12px; color: var(--text-sec);">${entry.duration} ч. сна</div>
                </div>
            </div>
            
            <div style="position: relative;">
                <button onclick="toggleSleepMenu(event, ${index})" style="background:none; border:none; color:var(--text-sec); cursor:pointer; padding: 5px;">
                    <span class="material-icons-round">more_vert</span>
                </button>
                
                <div id="sleep-menu-${index}" style="display:none; position:absolute; right:0; top:30px; background:white; box-shadow:0 4px 12px rgba(0,0,0,0.15); border-radius:10px; z-index:10; min-width:120px; overflow:hidden;">
                    <button onclick="openSleepModal(${index})" style="width:100%; padding:10px; border:none; background:none; text-align:left; display:flex; align-items:center; gap:8px; font-size:13px; cursor:pointer;">
                        <span class="material-icons-round" style="font-size:18px;">edit</span> Редактировать
                    </button>
                    <button onclick="deleteSleepEntry(${index})" style="width:100%; padding:10px; border:none; background:none; text-align:left; display:flex; align-items:center; gap:8px; font-size:13px; color:var(--danger); cursor:pointer;">
                        <span class="material-icons-round" style="font-size:18px;">delete_outline</span> Удалить
                    </button>
                </div>
            </div>
        `;
        list.appendChild(div);
    });
}

// Функция для открытия/закрытия выпадающего меню
function toggleSleepMenu(event, index) {
    event.stopPropagation();
    const allMenus = document.querySelectorAll('[id^="sleep-menu-"]');
    const currentMenu = document.getElementById(`sleep-menu-${index}`);
    
    // Закрываем все открытые меню, кроме текущего
    allMenus.forEach(menu => {
        if (menu !== currentMenu) menu.style.display = 'none';
    });
    
    // Переключаем текущее
    currentMenu.style.display = currentMenu.style.display === 'none' ? 'block' : 'none';
}

// Закрытие меню при клике в любом месте экрана
document.addEventListener('click', () => {
    document.querySelectorAll('[id^="sleep-menu-"]').forEach(menu => menu.style.display = 'none');
});

function renderSleepChart() {
    const ctx = document.getElementById('sleepChart');
    if (!ctx) return;

    const last7Days = window.appData.sleep.slice(-7);
    const labels = last7Days.map(d => d.date);
    const dataPoints = last7Days.map(d => d.duration);
    const colors = last7Days.map(d => d.duration >= 8 ? '#4caf50' : (d.duration >= 6 ? '#ffc107' : '#f44336'));

    if (sleepChart) sleepChart.destroy();

    sleepChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Часы сна',
                data: dataPoints,
                backgroundColor: colors,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true, max: 12 } },
            plugins: { legend: { display: false } }
        }
    });
}

// Функция скрыть/показать историю
function toggleSleepHistory() {
    const container = document.getElementById('sleep-history-container');
    const btn = event.target;
    if (container.style.display === 'block') {
        container.style.display = 'none';
        btn.innerText = 'История';
    } else {
        container.style.display = 'block';
        btn.innerText = 'Скрыть';
    }
}

// Обновленная функция отрисовки графика
function renderSleepChart() {
    const ctx = document.getElementById('sleepChart');
    if (!ctx) return;

    // Берем все данные сна
    const sleepData = window.appData.sleep || [];
    const labels = sleepData.map(d => d.date);
    const dataPoints = sleepData.map(d => d.duration);
    const colors = sleepData.map(d => d.duration >= 8 ? '#4caf50' : (d.duration >= 6 ? '#ffc107' : '#f44336'));

    if (sleepChart) sleepChart.destroy();

    sleepChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: dataPoints,
                backgroundColor: colors,
                borderRadius: 6,
                barThickness: 25 // Фиксированная ширина столбика
            }]
        },
        options: {
            maintainAspectRatio: false, // Важно для прокрутки
            responsive: true,
            scales: {
                y: { beginAtZero: true, max: 12, ticks: { stepSize: 2 } },
                x: { grid: { display: false } }
            },
            plugins: { legend: { display: false } }
        }
    });

    // Авто-скролл графика в самый конец (к последним дням)
    const scrollContainer = document.querySelector('.chart-scroll-container');
    setTimeout(() => {
        scrollContainer.scrollLeft = scrollContainer.scrollWidth;
    }, 100);
}

let currentCalDate = new Date();
if (!window.appData.cycle) {
    window.appData.cycle = {
        periodDays: [], // Список дат, когда были месячные (формат YYYY-MM-DD)
        cycleLength: 28,
        periodLength: 5
    };
}

function renderCalendar() {
    const grid = document.getElementById('calendar-days');
    const monthYearLabel = document.getElementById('calendar-month-year');
    if (!grid) return;

    grid.innerHTML = '';
    const year = currentCalDate.getFullYear();
    const month = currentCalDate.getMonth();
    
    monthYearLabel.innerText = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(currentCalDate);

    // Дни недели
    ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].forEach(day => {
        grid.innerHTML += `<div class="day-name">${day}</div>`;
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = firstDay === 0 ? 6 : firstDay - 1;

    // Пустые ячейки для начала месяца
    for (let i = 0; i < offset; i++) grid.innerHTML += '<div></div>';

    // Заполнение числами
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isPeriod = window.appData.cycle.periodDays.includes(dateStr);
        const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
        
        // Логика фертильности (упрощенно: середина цикла, если была отметка)
        // В будущем сюда можно добавить полноценный расчет прогноза
        
        let classes = 'calendar-day';
        if (isPeriod) classes += ' day-period';
        if (isToday) classes += ' day-today';

        grid.innerHTML += `<div class="${classes}" onclick="togglePeriodDate('${dateStr}')">${day}</div>`;
    }
    
    updateCycleTips();
}

function togglePeriodDate(dateStr) {
    const index = window.appData.cycle.periodDays.indexOf(dateStr);
    if (index > -1) {
        window.appData.cycle.periodDays.splice(index, 1);
    } else {
        window.appData.cycle.periodDays.push(dateStr);
    }
    saveData();
    renderCalendar();
}

function changeMonth(dir) {
    currentCalDate.setMonth(currentCalDate.getMonth() + dir);
    renderCalendar();
}

function updateCycleTips() {
    const tipsEl = document.getElementById('cycle-tips');
    // Здесь можно добавить логику: если день = период, показывать одни советы, если нет - другие
    const isPeriodToday = window.appData.cycle.periodDays.includes(new Date().toISOString().split('T')[0]);
    
    if (isPeriodToday) {
        tipsEl.innerHTML = `<b>Период:</b> Возможна слабость и боли. Рекомендуется йога, тепло и покой. Избегай сильных нагрузок.`;
    } else {
        tipsEl.innerHTML = `<b>Фаза фолликулярная:</b> Время прилива энергии! Отличное время для обучения, новых дел и активного спорта.`;
    }
}

// Инициализация при загрузке
window.addEventListener('DOMContentLoaded', renderCalendar);
