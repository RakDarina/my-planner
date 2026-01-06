/* diary_tab.js - Логика вкладки Дневник */

// Хранилище данных
let diary_tab_moods = JSON.parse(localStorage.getItem('diary_tab_moods')) || [];
let diary_tab_entries = JSON.parse(localStorage.getItem('diary_tab_entries')) || [];

// Настройки цветов настроения
const diary_tab_moodConfig = {
    5: { color: '#2ECC71', icon: 'sentiment_very_satisfied', label: 'Супер' },
    4: { color: '#A0D468', icon: 'sentiment_satisfied', label: 'Хорошо' },
    3: { color: '#4A90E2', icon: 'sentiment_neutral', label: 'Норм' },
    2: { color: '#FF9F43', icon: 'sentiment_dissatisfied', label: 'Плохо' },
    1: { color: '#FF3B30', icon: 'sentiment_very_dissatisfied', label: 'Ужасно' }
};

// Текущее состояние
let diary_tab_selectedMood = null;
let diary_tab_currentDate = new Date();
let diary_tab_editingEntryId = null;

// --- ИНИЦИАЛИЗАЦИЯ ---
function diary_tab_init() {
    diary_tab_renderMain();
}

// Рендер основной страницы
function diary_tab_renderMain() {
    diary_tab_renderMoodWidget();
    diary_tab_renderDiaryList();
}

// --- БЛОК 1: НАСТРОЕНИЕ ---

function diary_tab_openMoodModal() {
    document.getElementById('diary_tab-mood-modal').style.display = 'flex';
    // По умолчанию ставим сегодня
    document.getElementById('diary_tab-mood-date').valueAsDate = new Date();
    diary_tab_selectMood(null); // Сброс выбора
    document.getElementById('diary_tab-mood-note').value = '';
}

function diary_tab_closeMoodModal() {
    document.getElementById('diary_tab-mood-modal').style.display = 'none';
}

function diary_tab_selectMood(rating) {
    diary_tab_selectedMood = rating;
    // Визуальное выделение
    for (let i = 1; i <= 5; i++) {
        const el = document.getElementById(`mood-opt-${i}`);
        if (el) {
            el.classList.toggle('selected', i === rating);
        }
    }
}

function diary_tab_saveMood() {
    if (!diary_tab_selectedMood) {
        alert('Пожалуйста, выберите смайлик!');
        return;
    }

    const dateStr = document.getElementById('diary_tab-mood-date').value;
    if (!dateStr) return;

    const note = document.getElementById('diary_tab-mood-note').value;

    const newMood = {
        id: Date.now(),
        date: dateStr,
        rating: diary_tab_selectedMood,
        note: note
    };

    // Удаляем старую запись за эту дату, если есть (одна эмоция в день)
    diary_tab_moods = diary_tab_moods.filter(m => m.date !== dateStr);
    diary_tab_moods.push(newMood);

    localStorage.setItem('diary_tab_moods', JSON.stringify(diary_tab_moods));
    
    diary_tab_closeMoodModal();
    diary_tab_renderMoodWidget();
}

function diary_tab_renderMoodWidget() {
    const container = document.getElementById('diary_tab-today-mood-display');
    const todayStr = new Date().toISOString().split('T')[0];
    const todayMood = diary_tab_moods.find(m => m.date === todayStr);

    if (todayMood) {
        const config = diary_tab_moodConfig[todayMood.rating];
        container.innerHTML = `
            <div style="margin-top: 10px;">
                <span class="material-icons-round" style="color: ${config.color}; font-size: 60px;">${config.icon}</span>
                <div style="font-weight: bold; color: ${config.color};">${config.label}</div>
                <div style="font-size: 12px; color: #8E8E93;">${todayMood.note || ''}</div>
                <button onclick="diary_tab_deleteMood('${todayMood.date}')" style="margin-top:5px; border:none; background:none; color:var(--danger); font-size:12px;">Удалить</button>
            </div>
        `;
    } else {
        container.innerHTML = `<div style="color:#8E8E93; font-size:14px; margin: 10px 0;">Сегодня еще нет записи</div>`;
    }
}

function diary_tab_deleteMood(dateStr) {
    if(confirm('Удалить отметку настроения?')) {
        diary_tab_moods = diary_tab_moods.filter(m => m.date !== dateStr);
        localStorage.setItem('diary_tab_moods', JSON.stringify(diary_tab_moods));
        diary_tab_renderMoodWidget();
    }
}

// --- БЛОК 2: ДНЕВНИК ---

function diary_tab_changeMonth(delta) {
    diary_tab_currentDate.setMonth(diary_tab_currentDate.getMonth() + delta);
    diary_tab_renderDiaryList();
}

function diary_tab_renderDiaryList() {
    const listEl = document.getElementById('diary_tab-entries-list');
    const labelEl = document.getElementById('diary_tab-current-month-label');
    
    // Форматируем заголовок месяца
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    labelEl.textContent = `${monthNames[diary_tab_currentDate.getMonth()]} ${diary_tab_currentDate.getFullYear()}`;

    // Фильтруем записи
    const targetMonth = diary_tab_currentDate.getMonth();
    const targetYear = diary_tab_currentDate.getFullYear();

    const filteredEntries = diary_tab_entries.filter(entry => {
        const d = new Date(entry.date);
        return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
    }).sort((a, b) => new Date(b.date) - new Date(a.date)); // Сортировка: новые сверху

    listEl.innerHTML = '';

    if (filteredEntries.length === 0) {
        listEl.innerHTML = `<div style="text-align:center; color:#8E8E93; padding:20px;">Нет записей в этом месяце</div>`;
        return;
    }

    filteredEntries.forEach(entry => {
        const d = new Date(entry.date);
        // Формат даты: 01.01.2026
        const dateFormatted = `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
        
        const div = document.createElement('div');
        div.className = 'diary_tab-list-item';
        div.innerHTML = `
            <div class="diary_tab-list-layout">
                <div class="diary_tab-date-col">${dateFormatted}</div>
                <div class="diary_tab-text-col">${entry.text}</div>
            </div>
            <div class="diary_tab-actions">
                <span class="material-icons-round" onclick="diary_tab_editEntry(${entry.id})" style="font-size: 18px; cursor: pointer;">edit</span>
                <span class="material-icons-round" onclick="diary_tab_deleteEntry(${entry.id})" style="font-size: 18px; cursor: pointer; color: var(--danger);">delete</span>
            </div>
        `;
        listEl.appendChild(div);
    });
}

function diary_tab_openEntryModal(editId = null) {
    const modal = document.getElementById('diary_tab-entry-modal');
    modal.style.display = 'flex';
    
    const dateInput = document.getElementById('diary_tab-entry-date');
    const textInput = document.getElementById('diary_tab-entry-text');

    if (editId) {
        const entry = diary_tab_entries.find(e => e.id === editId);
        dateInput.value = entry.date;
        textInput.value = entry.text;
        diary_tab_editingEntryId = editId;
    } else {
        dateInput.valueAsDate = new Date();
        textInput.value = '';
        diary_tab_editingEntryId = null;
    }
}

function diary_tab_closeEntryModal() {
    document.getElementById('diary_tab-entry-modal').style.display = 'none';
}

function diary_tab_saveEntry() {
    const dateStr = document.getElementById('diary_tab-entry-date').value;
    const text = document.getElementById('diary_tab-entry-text').value;

    if (!dateStr || !text.trim()) {
        alert('Заполните дату и текст!');
        return;
    }

    if (diary_tab_editingEntryId) {
        // Редактирование
        const index = diary_tab_entries.findIndex(e => e.id === diary_tab_editingEntryId);
        if (index !== -1) {
            diary_tab_entries[index].date = dateStr;
            diary_tab_entries[index].text = text;
        }
    } else {
        // Создание
        diary_tab_entries.push({
            id: Date.now(),
            date: dateStr,
            text: text
        });
    }

    localStorage.setItem('diary_tab_entries', JSON.stringify(diary_tab_entries));
    diary_tab_closeEntryModal();
    diary_tab_renderDiaryList();
}

function diary_tab_editEntry(id) {
    diary_tab_openEntryModal(id);
}

function diary_tab_deleteEntry(id) {
    if(confirm('Удалить эту запись?')) {
        diary_tab_entries = diary_tab_entries.filter(e => e.id !== id);
        localStorage.setItem('diary_tab_entries', JSON.stringify(diary_tab_entries));
        diary_tab_renderDiaryList();
    }
}

// --- БЛОК 3: ГРАФИКИ И СТАТИСТИКА ---

function diary_tab_openStatsModal() {
    document.getElementById('diary_tab-stats-modal').style.display = 'block';
    diary_tab_renderCharts();
}

function diary_tab_closeStatsModal() {
    document.getElementById('diary_tab-stats-modal').style.display = 'none';
}

let diary_tab_chartInstance = null;

function diary_tab_renderCharts() {
    // 1. Круговая диаграмма (За текущий месяц)
    const ctx = document.getElementById('diary_tab-pie-chart').getContext('2d');
    
    // Считаем статистику за текущий отображаемый месяц
    const counts = { 1:0, 2:0, 3:0, 4:0, 5:0 };
    const targetMonth = diary_tab_currentDate.getMonth();
    
    diary_tab_moods.forEach(m => {
        if (new Date(m.date).getMonth() === targetMonth) {
            if(counts[m.rating] !== undefined) counts[m.rating]++;
        }
    });

    const dataValues = [counts[5], counts[4], counts[3], counts[2], counts[1]];
    const bgColors = [
        diary_tab_moodConfig[5].color,
        diary_tab_moodConfig[4].color,
        diary_tab_moodConfig[3].color,
        diary_tab_moodConfig[2].color,
        diary_tab_moodConfig[1].color
    ];

    if (diary_tab_chartInstance) {
        diary_tab_chartInstance.destroy();
    }

    diary_tab_chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Супер', 'Хорошо', 'Норм', 'Плохо', 'Ужасно'],
            datasets: [{
                data: dataValues,
                backgroundColor: bgColors,
                borderWidth: 0
            }]
        },
        options: {
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });

    // 2. Год в точках (Year in Pixels)
    const grid = document.getElementById('diary_tab-pixels-grid');
    grid.innerHTML = ''; // Очистка
    
    // Рисуем заголовки месяцев (по вертикали или просто сетка)
    // Упрощенная версия: 12 колонок (месяцы) x 31 строка (дни)
    
    // Создаем матрицу данных
    const yearMap = {};
    const yearToShow = diary_tab_currentDate.getFullYear();
    
    diary_tab_moods.forEach(m => {
        const d = new Date(m.date);
        if (d.getFullYear() === yearToShow) {
            const key = `${d.getMonth()}-${d.getDate()}`; // "0-1" (январь, 1 число)
            yearMap[key] = m.rating;
        }
    });

    // Сетка: 12 колонок
    grid.style.gridTemplateColumns = 'repeat(12, 1fr)'; 
    grid.style.gap = '3px';

    // Создаем ячейки. Проходим по дням (строки) и месяцам (колонки)
    // Но чтобы выглядело как на фото (месяцы сверху вниз или слева направо)
    // Обычно Year in Pixels: Колонки = Месяцы. Строки = Дни (1-31).
    
    for (let day = 1; day <= 31; day++) {
        for (let month = 0; month < 12; month++) {
            const cell = document.createElement('div');
            cell.className = 'pixels-cell';
            
            const key = `${month}-${day}`;
            const rating = yearMap[key];
            
            if (rating) {
                cell.style.backgroundColor = diary_tab_moodConfig[rating].color;
            } else {
                // Проверяем, существует ли такой день в месяце (напр. 30 февраля нет)
                const daysInMonth = new Date(yearToShow, month + 1, 0).getDate();
                if (day > daysInMonth) {
                    cell.style.backgroundColor = 'transparent'; // Пустота, если дня нет
                }
            }
            grid.appendChild(cell);
        }
    }
}
