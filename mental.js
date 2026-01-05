// --- ИНИЦИАЛИЗАЦИЯ ДАННЫХ ---
window.addEventListener('DOMContentLoaded', () => {
    if (!window.appData) {
        window.appData = JSON.parse(localStorage.getItem('myPlannerData')) || {};
    }
    // Гарантируем наличие всех разделов
    if (!window.appData.mental) {
        window.appData.mental = { gratitude: [], emotions: [], achievements: [], good_day: [] };
    }
    if (!window.appData.water) {
        window.appData.water = { current: 0, goal: 2000, glassSize: 250, consumedGlasses: 0 };
    }
    if (!window.appData.cycle) {
        window.appData.cycle = { periodDays: [], cycleLength: 28, periodLength: 5 };
    }
    if (!window.appData.sleep) {
        window.appData.sleep = [];
    }

    // Запуск UI только если мы на нужных вкладках или элементы существуют
    updateWaterUI();
    updateSleepUI();
    if (document.getElementById('calendar-days')) {
        renderCalendar();
    }
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
        w.consumedGlasses = index;
    } else {
        w.consumedGlasses = index + 1;
        // Эффект анимации
        const container = document.getElementById('glasses-container');
        if (container) {
            const glasses = container.querySelectorAll('.glass-icon');
            const targetGlass = glasses[index];
            if (targetGlass) {
                targetGlass.classList.add('animating');
                setTimeout(() => targetGlass.classList.remove('animating'), 1000);
            }
        }
    }
    w.current = w.consumedGlasses * w.glassSize;
    saveData(); 
    updateWaterUI();
}

function openWaterSettings() {
    const modal = document.getElementById('water-modal');
    if (modal) {
        modal.style.display = 'flex';
        document.getElementById('input-water-goal').value = window.appData.water.goal;
        document.getElementById('input-glass-size').value = window.appData.water.glassSize;
    }
}

function saveWaterSettings() {
    window.appData.water.goal = parseInt(document.getElementById('input-water-goal').value) || 2000;
    window.appData.water.glassSize = parseInt(document.getElementById('input-glass-size').value) || 250;
    window.appData.water.current = window.appData.water.consumedGlasses * window.appData.water.glassSize;
    saveData(); 
    updateWaterUI(); 
    closeModals(); // Используем общую функцию закрытия
}

function calculateWaterGoal() {
    const weight = prompt("Введите ваш вес в кг:");
    if (weight) {
        const goal = Math.round(weight * 30);
        const input = document.getElementById('input-water-goal');
        if (input) input.value = goal;
    }
}

// --- ДНЕВНИКИ (СМЭР И ОБЫЧНЫЕ) ---

function openMentalModal(question, defaultValue, onSave, isSMER = false) {
    const modal = document.getElementById('mental-modal');
    const textarea = document.getElementById('modal-textarea');
    const saveBtn = document.getElementById('modal-save-btn');
    if (!modal) return;

    document.getElementById('modal-question').innerText = question;

    if (isSMER) {
        textarea.style.display = 'none';
        let form = document.getElementById('smer-form');
        if (!form) {
            let formHtml = `<div id="smer-form" style="display:flex; flex-direction:column; gap:10px; width:100%; text-align:left; margin-top:15px;">
                <div><b>1. Ситуация:</b><textarea id="sm-1" class="smer-input" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:8px;"></textarea></div>
                <div><b>2. Эмоции:</b><textarea id="sm-2" class="smer-input" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:8px;"></textarea></div>
                <div><b>3. Мысли:</b><textarea id="sm-3" class="smer-input" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:8px;"></textarea></div>
                <div><b>4. Поведение:</b><textarea id="sm-4" class="smer-input" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:8px;"></textarea></div>
                <div><b>5. Альтернатива:</b><textarea id="sm-5" class="smer-input" style="width:100%; border-radius:10px; border:1px solid #ddd; padding:8px;"></textarea></div>
            </div>`;
            textarea.insertAdjacentHTML('afterend', formHtml);
            form = document.getElementById('smer-form');
        }
        form.style.display = 'flex';

        if (typeof defaultValue === 'object') {
            document.getElementById('sm-1').value = defaultValue.situation || "";
            document.getElementById('sm-2').value = defaultValue.emotion || "";
            document.getElementById('sm-3').value = defaultValue.thoughts || "";
            document.getElementById('sm-4').value = defaultValue.behavior || "";
            document.getElementById('sm-5').value = defaultValue.alternative || "";
        }
    } else {
        textarea.style.display = 'block';
        const form = document.getElementById('smer-form');
        if (form) form.style.display = 'none';
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
        } else { 
            onSave(textarea.value.trim()); 
        }
        closeModals();
    };
}

function openDiary(type, title) {
    window.currentDiaryType = type;
    const titleEl = document.getElementById('diary-title');
    if (titleEl) titleEl.innerText = title;
    
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const detailsPage = document.getElementById('view-diary-details');
    if (detailsPage) detailsPage.classList.add('active');
    renderDiaryEntries();
}

function renderDiaryEntries() {
    const list = document.getElementById('diary-content-list');
    if (!list) return;
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
    const dateStr = new Date().toLocaleDateString('ru-RU');
    if (type === 'emotions') {
        openMentalModal("Новая запись СМЭР", {}, (data) => {
            window.appData.mental[type].push({ ...data, date: dateStr });
            saveData(); renderDiaryEntries();
        }, true);
    } else {
        let q = type === 'achievements' ? "Достижение дня" : "За что вы благодарны?";
        openMentalModal(q, "", (text) => {
            if(text) {
                window.appData.mental[type].push({ text, date: dateStr, isComplex: false });
                saveData(); renderDiaryEntries();
            }
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
            if(text) {
                window.appData.mental[type][index].text = text;
                saveData(); renderDiaryEntries();
            }
        });
    }
}

function deleteDiaryEntry(index) {
    if (confirm("Удалить запись?")) {
        window.appData.mental[window.currentDiaryType].splice(index, 1);
        saveData(); renderDiaryEntries();
    }
}

// --- ТРЕКЕР СНА ---
// (Функции сна оставлены как есть, добавлены проверки на существование элементов)

let sleepChart = null;

function updateSleepUI() {
    if (document.getElementById('sleep-list')) renderSleepList();
    if (document.getElementById('sleepChart')) renderSleepChart();
}

function renderSleepList() {
    const list = document.getElementById('sleep-list');
    if (!list) return;
    list.innerHTML = '';
    const displayEntries = [...(window.appData.sleep || [])].reverse().slice(0, 5);
    displayEntries.forEach((entry) => {
        const index = window.appData.sleep.indexOf(entry);
        const color = entry.duration >= 8 ? '#4caf50' : (entry.duration >= 6 ? '#ffc107' : '#f44336');
        const div = document.createElement('div');
        div.style.cssText = `display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-top: 1px solid #f0f0f0;`;
        div.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 8px; height: 8px; border-radius: 50%; background: ${color};"></div>
                <div>
                    <div style="font-size: 14px; font-weight: 600;">${entry.date}</div>
                    <div style="font-size: 12px; color: var(--text-sec);">${entry.duration} ч. сна</div>
                </div>
            </div>
            <button onclick="deleteSleepEntry(${index})" style="background:none; border:none; color:var(--danger); cursor:pointer;">
                <span class="material-icons-round">delete_outline</span>
            </button>`;
        list.appendChild(div);
    });
}

function renderSleepChart() {
    const canvas = document.getElementById('sleepChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const sleepData = window.appData.sleep || [];
    if (sleepData.length === 0) return;

    const labels = sleepData.map(d => d.date);
    const dataPoints = sleepData.map(d => d.duration);
    const colors = sleepData.map(d => d.duration >= 8 ? '#4caf50' : (d.duration >= 6 ? '#ffc107' : '#f44336'));
    
    if (sleepChart) sleepChart.destroy();
    sleepChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{ data: dataPoints, backgroundColor: colors, borderRadius: 6, barThickness: 25 }]
        },
        options: {
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, max: 12 } },
            plugins: { legend: { display: false } }
        }
    });
}

// --- ЖЕНСКИЙ КАЛЕНДАРЬ ---

let currentCalDate = new Date();

function renderCalendar() {
    const grid = document.getElementById('calendar-days');
    const monthYearLabel = document.getElementById('calendar-month-year');
    if (!grid) return;

    grid.innerHTML = '';
    const year = currentCalDate.getFullYear();
    const month = currentCalDate.getMonth();
    
    monthYearLabel.innerText = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(currentCalDate);

    ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].forEach(day => {
        grid.innerHTML += `<div class="day-name">${day}</div>`;
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = firstDay === 0 ? 6 : firstDay - 1;

    for (let i = 0; i < offset; i++) grid.innerHTML += '<div></div>';

    const sortedStarts = [...window.appData.cycle.periodDays]
        .filter(d => d.isStart)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const lastStart = sortedStarts.length > 0 ? new Date(sortedStarts[sortedStarts.length - 1].date) : null;

    for (let day = 1; day <= daysInMonth; day++) {
        const curDate = new Date(year, month, day);
        const dateStr = curDate.toISOString().split('T')[0];
        let classes = 'calendar-day';
        
        const isPeriod = window.appData.cycle.periodDays.some(d => d.date === dateStr);
        if (isPeriod) classes += ' day-period';
        if (new Date().toDateString() === curDate.toDateString()) classes += ' day-today';

        if (lastStart && !isPeriod) {
            const diffDays = Math.floor((curDate - lastStart) / 86400000);
            const cycleDay = diffDays % window.appData.cycle.cycleLength;
            if (diffDays > 0 && cycleDay < window.appData.cycle.periodLength) classes += ' day-prediction';
            if (cycleDay >= 10 && cycleDay <= 15) classes += ' day-fertile';
        }
        grid.innerHTML += `<div class="${classes}" onclick="handleDayClick('${dateStr}')">${day}</div>`;
    }
    updateCycleTips();
}

function handleDayClick(dateStr) {
    const startDate = new Date(dateStr);
    const existingIndex = window.appData.cycle.periodDays.findIndex(d => d.date === dateStr);

    if (existingIndex > -1) {
        const wasStart = window.appData.cycle.periodDays[existingIndex].isStart;
        if (wasStart) {
            window.appData.cycle.periodDays = window.appData.cycle.periodDays.filter(d => {
                const diff = (new Date(d.date) - startDate) / 86400000;
                return !(diff >= 0 && diff < 5);
            });
        } else {
            window.appData.cycle.periodDays.splice(existingIndex, 1);
        }
    } else {
        for (let i = 0; i < 5; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            const dStr = d.toISOString().split('T')[0];
            if (!window.appData.cycle.periodDays.some(day => day.date === dStr)) {
                window.appData.cycle.periodDays.push({ date: dStr, isStart: i === 0 });
            }
        }
    }
    saveData(); renderCalendar();
}

function changeMonth(dir) {
    currentCalDate.setMonth(currentCalDate.getMonth() + dir);
    renderCalendar();
}

function updateCycleTips() {
    const tipsEl = document.getElementById('cycle-tips');
    if (!tipsEl) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const isPeriodToday = window.appData.cycle.periodDays.some(d => d.date === todayStr);

    if (isPeriodToday) {
        tipsEl.innerHTML = `<b>Фаза: Менструация.</b> Активность низкая. Пейте больше воды, избегайте нагрузок.`;
    } else {
        tipsEl.innerHTML = `<b>Фаза: Фолликулярная.</b> Энергия растет! Отличное время для активной работы.`;
    }
}
