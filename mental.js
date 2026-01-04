// Инициализация данных для менталки
if (!window.appData.mental) {
    window.appData.mental = {
        gratitude: [],
        emotions: [],
        achievements: [],
        good_day: []
    };
}

let currentDiaryType = ''; // Тип текущего дневника (например, 'gratitude')

// Функция открытия дневника
function openDiary(type, title) {
    currentDiaryType = type;
    document.getElementById('diary-title').innerText = title;
    
    // Переключаем экран
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('view-diary-details').classList.add('active');
    
    renderDiaryEntries();
}

// Отрисовка списка записей
function renderDiaryEntries() {
    const list = document.getElementById('diary-content-list');
    list.innerHTML = '';
    
    const entries = window.appData.mental[currentDiaryType] || [];
    
    if (entries.length === 0) {
        list.innerHTML = <p style="text-align:center; color:var(--text-sec); margin-top:50px;">Записей пока нет...</p>;
        return;
    }

    entries.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'goal-card';
        div.style.marginBottom = '15px';
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <span style="font-size:18px; line-height:1.4; flex:1;">${index + 1}. ${item}</span>
                <div style="display:flex; gap:10px; margin-left:10px;">
                    <span class="material-icons-round" style="font-size:20px; color:var(--text-sec);" onclick="editDiaryEntry(${index})">edit</span>
                    <span class="material-icons-round" style="font-size:20px; color:var(--danger);" onclick="deleteDiaryEntry(${index})">delete_outline</span>
                </div>
            </div>
        `;
        list.appendChild(div);
    });
}

// Добавление записи
function addDiaryEntry() {
    const question = currentDiaryType === 'gratitude' ? "За что вы благодарны сегодня?" : "Введите вашу запись:";
    const text = prompt(question);
    
    if (text && text.trim() !== "") {
        if (!window.appData.mental[currentDiaryType]) {
            window.appData.mental[currentDiaryType] = [];
        }
        window.appData.mental[currentDiaryType].push(text.trim());
        saveData(); // Используем твою общую функцию сохранения
        renderDiaryEntries();
    }
}

// Удаление записи
function deleteDiaryEntry(index) {
    if (confirm("Удалить эту запись?")) {
        window.appData.mental[currentDiaryType].splice(index, 1);
        saveData();
        renderDiaryEntries();
    }
}

// Редактирование записи
function editDiaryEntry(index) {
    const oldText = window.appData.mental[currentDiaryType][index];
    const newText = prompt("Редактировать запись:", oldText);
    
    if (newText && newText.trim() !== "") {
        window.appData.mental[currentDiaryType][index] = newText.trim();
        saveData();
        renderDiaryEntries();
    }
}
