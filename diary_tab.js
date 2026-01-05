let diaryViewDate = new Date(); // Текущий просматриваемый месяц
let editingDiaryId = null;

window.addEventListener('DOMContentLoaded', () => {
    // 1. Инициализация данных
    if (!window.appData) {
        window.appData = JSON.parse(localStorage.getItem('myPlannerData')) || {};
    }
    if (!window.appData.diaryEntries) {
        window.appData.diaryEntries = []; 
    }
    
    // 2. Запуск дневника
    updateDiaryHeader();
    renderDiary();
    
    // 3. Запуск настроения (Mood)
    renderMood();
});

// --- НАВИГАЦИЯ ДНЕВНИКА ---

function changeDiaryMonth(offset) {
    diaryViewDate.setMonth(diaryViewDate.getMonth() + offset);
    updateDiaryHeader();
    renderDiary();
}

function updateDiaryHeader() {
    const title = document.getElementById('diary-month-title');
    if (title) {
        const monthName = diaryViewDate.toLocaleDateString('ru-RU', { month: 'long' });
        const year = diaryViewDate.getFullYear();
        title.innerText = monthName.charAt(0).toUpperCase() + monthName.slice(1) + ' ' + year;
    }
}

// --- ОТРИСОВКА ЗАПИСЕЙ ---

function renderDiary() {
    const container = document.getElementById('diary-list-container');
    if (!container) return;
    
    container.innerHTML = '';

    const currentMonth = diaryViewDate.getMonth();
    const currentYear = diaryViewDate.getFullYear();

    const filteredEntries = (window.appData.diaryEntries || []).filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() === currentMonth && 
               entryDate.getFullYear() === currentYear;
    });

    filteredEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (filteredEntries.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; color:#aaa; padding: 40px;">
                <span class="material-icons-round" style="font-size:48px; opacity:0.3;">auto_stories</span>
                <p>В этом месяце пока пусто...</p>
            </div>
        `;
        return;
    }

    filteredEntries.forEach(entry => {
        const dayNumber = new Date(entry.date).getDate();
        
        const div = document.createElement('div');
        div.className = 'diary-card'; // Используем ваш CSS
        div.innerHTML = `
            <div class="diary-day-number">${dayNumber}.</div>
            <div style="flex:1; margin: 0 15px;">
                <div style="font-size:16px; line-height:1.5;">${entry.text}</div>
            </div>
            <div class="diary-controls">
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

// --- УПРАВЛЕНИЕ ЗАПИСЯМИ ---

function openDiaryModal() {
    editingDiaryId = null;
    const modal = document.getElementById('modal-diary');
    if(!modal) return;

    document.getElementById('diary-modal-title').innerText = "Новая запись";
    document.getElementById('diary-text-input').value = '';
    
    const today = new Date();
    let defaultDate = new Date(diaryViewDate);
    
    if (today.getMonth() === diaryViewDate.getMonth() && today.getFullYear() === diaryViewDate.getFullYear()) {
        defaultDate = today;
    } else {
        defaultDate.setDate(1);
    }
    
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
    document.getElementById('diary-date-input').value = entry.date;

    document.getElementById('modal-diary').style.display = 'flex';
}

function saveDiaryEntry() {
    const text = document.getElementById('diary-text-input').value.trim();
    const dateStr = document.getElementById('diary-date-input').value;

    if (!text || !dateStr) {
        alert("Заполните дату и текст!");
        return;
    }

    if (editingDiaryId) {
        const index = window.appData.diaryEntries.findIndex(e => e.id === editingDiaryId);
        if (index > -1) {
            window.appData.diaryEntries[index].text = text;
            window.appData.diaryEntries[index].date = dateStr;
        }
    } else {
        window.appData.diaryEntries.push({
            id: Date.now(),
            text: text,
            date: dateStr
        });
    }

    // Вызываем глобальное сохранение из script.js
    if (typeof window.saveData === 'function') {
        window.saveData();
    } else {
        localStorage.setItem('myPlannerData', JSON.stringify(window.appData));
    }
    
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
    
    if (typeof window.saveData === 'function') {
        window.saveData();
    } else {
        localStorage.setItem('myPlannerData', JSON.stringify(window.appData));
    }
    renderDiary();
}

function closeDiaryModal() {
    const modal = document.getElementById('modal-diary');
    if(modal) modal.style.display = 'none';
}

// --- НАСТРОЕНИЕ (MOOD PIXELS) ---

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
    
    // Храним настроение внутри общего объекта appData для синхронизации
    if (!window.appData.moods) window.appData.moods = {};
    const data = window.appData.moods;

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
    if (!window.appData.moods) window.appData.moods = {};
    window.appData.moods[moodKey] = type;
    
    if (typeof window.saveData === 'function') {
        window.saveData();
    } else {
        localStorage.setItem('myPlannerData', JSON.stringify(window.appData));
    }
    
    renderMood();
    closeMoodModal();
}

function closeMoodModal() { 
    const modal = document.getElementById('modal-mood');
    if(modal) modal.style.display = 'none'; 
}

function changeMoodMonth(v) { 
    moodDate.setMonth(moodDate.getMonth() + v); 
    renderMood(); 
}
