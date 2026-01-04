// Функция инициализации (вызывается из основного script.js при загрузке)
function initMental() {
    checkWaterDate();
    renderWater();
    checkGratitudeToday();
}

// --- ЛОГИКА ВОДЫ ---
function checkWaterDate() {
    const today = new Date().toLocaleDateString();
    if (window.appData.water.lastDate !== today) {
        window.appData.water.current = 0;
        window.appData.water.lastDate = today;
        saveData();
    }
}

function renderWater() {
    const container = document.getElementById('glasses-list');
    if(!container) return;
    container.innerHTML = '';
    
    const count = Math.ceil(window.appData.water.goal / window.appData.water.glassSize);
    const filledCount = Math.floor(window.appData.water.current / window.appData.water.glassSize);
    
    for(let i=0; i<count; i++) {
        const glass = document.createElement('span');
        glass.className = `material-icons-round glass ${i < filledCount ? 'filled' : ''}`;
        glass.innerText = 'local_drink';
        glass.onclick = () => {
            const size = window.appData.water.glassSize;
            if (i < filledCount) window.appData.water.current -= size;
            else window.appData.water.current += size;
            if(window.appData.water.current < 0) window.appData.water.current = 0;
            saveData();
            renderWater();
        };
        container.appendChild(glass);
    }
    document.getElementById('water-current').innerText = window.appData.water.current;
    document.getElementById('water-goal').innerText = window.appData.water.goal;
}

function settingsWater() {
    const g = prompt("Ваша цель в мл (например, 2000):", window.appData.water.goal);
    const s = prompt("Объем одного стакана в мл (например, 250):", window.appData.water.glassSize);
    if(g) window.appData.water.goal = parseInt(g);
    if(s) window.appData.water.glassSize = parseInt(s);
    saveData();
    renderWater();
}

// --- ЛОГИКА ДНЕВНИКОВ ---
let currentDiaryType = '';

function openDiary(type, title) {
    currentDiaryType = type;
    document.getElementById('diary-title').innerText = title;
    
    // Скрываем вкладку менталки и показываем страницу списка записей
    document.getElementById('view-mental').classList.remove('active');
    document.getElementById('view-diary-details').classList.add('active');
    
    // Настраиваем кнопку "Добавить"
    document.getElementById('add-diary-btn').onclick = () => addDiaryEntry(type);
    renderDiaryEntries();
}

function renderDiaryEntries() {
    const list = document.getElementById('diary-content-list');
    list.innerHTML = '';
    const entries = window.appData.diaries[currentDiaryType];
    
    entries.forEach((entry, index) => {
        const div = document.createElement('div');
        div.className = 'diary-item';
        
        let content = `<div class="diary-date">${entry.date}</div>`;
        
        // Специальное отображение для Дневника Эмоций (где много полей)
        if (currentDiaryType === 'emotions') {
            content += `
                <div style="margin-top:5px">
                    <p><b>Ситуация:</b> ${entry.situation}</p>
                    <p><b>Эмоции:</b> ${entry.emotions}</p>
                    <p><b>Мысли:</b> ${entry.thoughts}</p>
                    <p><b>Поведение:</b> ${entry.behavior}</p>
                    <p><b>Альтернатива:</b> ${entry.alternative}</p>
                </div>`;
        } else {
            // Для обычных дневников (Благодарность, Достижения, Хорошее)
            content += `<div style="margin-top:5px">${index + 1}. ${entry.text}</div>`;
        }
        
        // Кнопки удаления и редактирования
        content += `
            <div style="text-align:right; margin-top:10px; display:flex; justify-content:flex-end; gap:15px">
                <span onclick="editEntry(${index})" class="material-icons-round" style="color:#8e8e93; font-size:18px; cursor:pointer">edit</span>
                <span onclick="deleteEntry(${index})" class="material-icons-round" style="color:#FF3B30; font-size:18px; cursor:pointer">delete_outline</span>
            </div>`;
        
        div.innerHTML = content;
        list.appendChild(div);
    });
}

function addDiaryEntry(type) {
    const date = new Date().toLocaleDateString();
    
    if (type === 'emotions') {
        const situation = prompt("Опишите ситуацию:");
        if(!situation) return;
        const emotions = prompt("Какие эмоции вы чувствовали?");
        const thoughts = prompt("О чем вы думали?");
        const behavior = prompt("Как вы себя вели?");
        const alternative = prompt("Альтернативный взгляд на ситуацию:");
        
        window.appData.diaries[type].unshift({
            date, situation, emotions, thoughts, behavior, alternative
        });
    } else {
        const text = prompt("Сделайте запись:");
        if(!text) return;
        window.appData.diaries[type].unshift({ date, text });
    }
    
    saveData();
    renderDiaryEntries();
    if(type === 'gratitude') checkGratitudeToday();
}

function deleteEntry(index) {
    if(confirm("Удалить эту запись?")) {
        window.appData.diaries[currentDiaryType].splice(index, 1);
        saveData();
        renderDiaryEntries();
        if(currentDiaryType === 'gratitude') checkGratitudeToday();
    }
}

function editEntry(index) {
    const entry = window.appData.diaries[currentDiaryType][index];
    if (currentDiaryType === 'emotions') {
        const sit = prompt("Изменить ситуацию:", entry.situation);
        if(sit) entry.situation = sit;
        // Можно добавить остальные поля, если нужно
    } else {
        const txt = prompt("Редактировать запись:", entry.text);
        if(txt) entry.text = txt;
    }
    saveData();
    renderDiaryEntries();
}

function checkGratitudeToday() {
    const today = new Date().toLocaleDateString();
    const hasToday = window.appData.diaries.gratitude.some(e => e.date === today);
    const btn = document.getElementById('btn-gratitude');
    if(btn) {
        if (!hasToday) {
            btn.style.borderColor = "#FF3B30"; // Горит красным
        } else {
            btn.style.borderColor = "transparent"; // Обычная
        }
    }
}
