let diaryViewDate = new Date(); // Текущий просматриваемый месяц
let editingDiaryId = null;

window.addEventListener('DOMContentLoaded', () => {
    if (!window.appData) {
        window.appData = JSON.parse(localStorage.getItem('myPlannerData')) || {};
    }
    if (!window.appData.diaryEntries) {
        window.appData.diaryEntries = []; 
    }
    
    // При загрузке сразу показываем текущий месяц
    updateDiaryHeader();
    renderDiary();
});

// --- НАВИГАЦИЯ ПО МЕСЯЦАМ ---

function changeDiaryMonth(offset) {
    // Меняем месяц на +1 или -1
    diaryViewDate.setMonth(diaryViewDate.getMonth() + offset);
    updateDiaryHeader();
    renderDiary();
}

function updateDiaryHeader() {
    const title = document.getElementById('diary-month-title');
    if (title) {
        // Форматируем: "Январь 2026"
        const monthName = diaryViewDate.toLocaleDateString('ru-RU', { month: 'long' });
        const year = diaryViewDate.getFullYear();
        // Делаем первую букву заглавной
        title.innerText = monthName.charAt(0).toUpperCase() + monthName.slice(1) + ' ' + year;
    }
}

// --- ОТРИСОВКА ЗАПИСЕЙ ---

function renderDiary() {
    const container = document.getElementById('diary-list-container');
    if (!container) return;
    
    container.innerHTML = '';

    // 1. Фильтруем записи (только для выбранного месяца и года)
    const currentMonth = diaryViewDate.getMonth();
    const currentYear = diaryViewDate.getFullYear();

    const filteredEntries = window.appData.diaryEntries.filter(entry => {
        const entryDate = new Date(entry.date); // Превращаем строку даты в объект
        return entryDate.getMonth() === currentMonth && 
               entryDate.getFullYear() === currentYear;
    });

    // 2. Сортируем по дням (от 1 к 31)
    filteredEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

    // 3. Если записей нет
    if (filteredEntries.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; color:#aaa; padding: 40px;">
                <span class="material-icons-round" style="font-size:48px; opacity:0.3;">auto_stories</span>
                <p>В этом месяце пока пусто...</p>
            </div>
        `;
        return;
    }

    // 4. Рисуем
    filteredEntries.forEach(entry => {
        const dayNumber = new Date(entry.date).getDate(); // Получаем число (1, 6, 25)
        
        const div = document.createElement('div');
        div.className = 'diary-card';
        div.innerHTML = `
            <div class="diary-day-number">${dayNumber}.</div>
            <div class="diary-content">
                <div class="diary-text">${entry.text}</div>
            </div>
            
            <div class="item-controls" style="border-left:none; margin-left:0; padding-left:0;">
                <button onclick="editDiaryEntry(${entry.id})" class="btn-control edit-btn">
                    <span class="material-icons-round">edit</span>
                </button>
                <button onclick="deleteDiaryEntry(${entry.id})" class="btn-control delete-btn">
                    <span class="material-icons-round">delete</span>
                </button>
            </div>
        `;
        container.appendChild(div);
    });
}

// --- ДОБАВЛЕНИЕ / РЕДАКТИРОВАНИЕ ---

function openDiaryModal() {
    editingDiaryId = null;
    const modal = document.getElementById('modal-diary');
    document.getElementById('diary-modal-title').innerText = "Новая запись";
    document.getElementById('diary-text-input').value = '';
    
    // Устанавливаем дату в инпуте
    // Если мы смотрим текущий месяц -> ставим "сегодня"
    // Если листаем прошлый/будущий месяц -> ставим 1-е число того месяца (для удобства)
    const today = new Date();
    let defaultDate = new Date(diaryViewDate);
    
    if (today.getMonth() === diaryViewDate.getMonth() && today.getFullYear() === diaryViewDate.getFullYear()) {
        defaultDate = today; // Если смотрим текущий месяц, ставим сегодняшнюю дату
    } else {
        defaultDate.setDate(1); // Иначе 1-е число
    }
    
    // Формат для инпута type="date" (YYYY-MM-DD)
    // Учитываем часовой пояс, чтобы день не съехал
    const offset = defaultDate.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(defaultDate - offset)).toISOString().slice(0, 10);
    
    document.getElementById('diary-date-input').value = localISOTime;
    
    modal.style.display = 'flex';
}

function editDiaryEntry(id) {
    editingDiaryId = id;
    const entry = window.appData.diaryEntries.find(e => e.id === id);
    if (!entry) return;

    document.getElementById('diary-modal-title').innerText = "Редактировать";
    document.getElementById('diary-text-input').value = entry.text;
    document.getElementById('diary-date-input').value = entry.date; // Там уже хранится YYYY-MM-DD

    document.getElementById('modal-diary').style.display = 'flex';
}

function saveDiaryEntry() {
    const text = document.getElementById('diary-text-input').value.trim();
    const dateStr = document.getElementById('diary-date-input').value; // YYYY-MM-DD

    if (!text || !dateStr) return alert("Заполните дату и текст!");

    if (editingDiaryId) {
        // Редактируем
        const index = window.appData.diaryEntries.findIndex(e => e.id === editingDiaryId);
        if (index > -1) {
            window.appData.diaryEntries[index].text = text;
            window.appData.diaryEntries[index].date = dateStr;
        }
    } else {
        // Создаем
        const newEntry = {
            id: Date.now(),
            text: text,
            date: dateStr // Сохраняем дату как строку "2026-01-06"
        };
        window.appData.diaryEntries.push(newEntry);
    }

    saveData();
    
    // Если мы добавили запись в другой месяц (не тот, на который смотрим), переключимся туда?
    // Или останемся? Логичнее обновить viewDate на дату записи, чтобы пользователь увидел, что добавил.
    const newDate = new Date(dateStr);
    diaryViewDate.setMonth(newDate.getMonth());
    diaryViewDate.setFullYear(newDate.getFullYear());
    updateDiaryHeader();

    renderDiary();
    closeDiaryModal();
}

function deleteDiaryEntry(id) {
    if (!confirm("Удалить это воспоминание?")) return;
    
    window.appData.diaryEntries = window.appData.diaryEntries.filter(e => e.id !== id);
    saveData();
    renderDiary();
}

function closeDiaryModal() {
    document.getElementById('modal-diary').style.display = 'none';
}

function saveData() {
    localStorage.setItem('myPlannerData', JSON.stringify(window.appData));
}
let moodDate = new Date();
let moodKey = null;

function renderMood() {
    const grid = document.getElementById('mood-pixel-grid');
    const title = document.getElementById('mood-month-title');
    if (!grid) return;

    grid.innerHTML = '';
    const year = moodDate.getFullYear();
    const month = moodDate.getMonth();
    title.innerText = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(moodDate);

    const days = new Date(year, month + 1, 0).getDate();
    const data = JSON.parse(localStorage.getItem('moodStorage') || '{}');
    let counts = { good: 0, neutral: 0, bad: 0 };

    for (let d = 1; d <= days; d++) {
        const key = `${year}-${month + 1}-${d}`;
        const pixel = document.createElement('div');
        pixel.className = 'mood-pixel';
        if (data[key]) {
            pixel.classList.add(data[key]);
            counts[data[key]]++;
        }
        pixel.onclick = () => {
            moodKey = key;
            document.getElementById('mood-date-display').innerText = d + ' ' + title.innerText;
            document.getElementById('modal-mood').style.display = 'flex';
        };
        grid.appendChild(pixel);
    }
    updateMoodPie(counts);
}

function updateMoodPie(counts) {
    const total = counts.good + counts.neutral + counts.bad;
    const chart = document.getElementById('mood-pie-chart');
    if (!chart) return;
    if (total === 0) {
        chart.style.background = '#eee';
        document.getElementById('mood-legend').innerHTML = 'Нет данных';
        return;
    }
    const gP = (counts.good / total) * 100;
    const nP = (counts.neutral / total) * 100;
    chart.style.background = `conic-gradient(#4CD964 0% ${gP}%, #007AFF ${gP}% ${gP+nP}%, #FF3B30 ${gP+nP}% 100%)`;
    document.getElementById('mood-legend').innerHTML = `
        <div style="color:#4CD964">● Хорошее: ${Math.round(gP)}%</div>
        <div style="color:#007AFF">● Нейтральное: ${Math.round(nP)}%</div>
        <div style="color:#FF3B30">● Плохое: ${Math.round((counts.bad/total)*100)}%</div>
    `;
}

function setMood(type) {
    const data = JSON.parse(localStorage.getItem('moodStorage') || '{}');
    data[moodKey] = type;
    localStorage.setItem('moodStorage', JSON.stringify(data));
    renderMood();
    closeMoodModal();
}

function closeMoodModal() { document.getElementById('modal-mood').style.display = 'none'; }
function changeMoodMonth(v) { moodDate.setMonth(moodDate.getMonth() + v); renderMood(); }

// Запуск
document.addEventListener('DOMContentLoaded', renderMood);
