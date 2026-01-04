// Функция открытия дневника
function openDiary(type, title) {
    // 1. Проверяем, есть ли у нас вообще раздел mental в данных
    if (!window.appData.mental) {
        window.appData.mental = {
            gratitude: [],
            emotions: [],
            achievements: [],
            good_day: []
        };
        // Сразу сохраняем, чтобы больше не проверять
        if (typeof saveData === 'function') saveData();
    }

    // 2. Устанавливаем текущий тип
    window.currentDiaryType = type;
    
    // 3. Меняем заголовок на странице записей
    const titleEl = document.getElementById('diary-title');
    if (titleEl) titleEl.innerText = title;

    // 4. Переключаем экран (скрываем всё, показываем дневник)
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const diaryPage = document.getElementById('view-diary-details');
    if (diaryPage) {
        diaryPage.classList.add('active');
    }

    // 5. Отрисовываем записи
    renderDiaryEntries();
}

function renderDiaryEntries() {
    const list = document.getElementById('diary-content-list');
    if (!list) return;
    list.innerHTML = '';
    
    const type = window.currentDiaryType;
    const entries = window.appData.mental[type] || [];
    
    if (entries.length === 0) {
        list.innerHTML = <p style="text-align:center; color:var(--text-sec); margin-top:50px;">Записей пока нет...</p>;
        return;
    }

    entries.forEach((text, index) => {
        const div = document.createElement('div');
        div.className = 'goal-card';
        div.style.marginBottom = '15px';
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <span style="font-size:18px; line-height:1.4; flex:1;">${index + 1}. ${text}</span>
                <div style="display:flex; gap:15px; margin-left:10px;">
                    <span class="material-icons-round" style="font-size:22px; color:var(--text-sec);" onclick="editDiaryEntry(${index})">edit</span>
                    <span class="material-icons-round" style="font-size:22px; color:var(--danger);" onclick="deleteDiaryEntry(${index})">delete_outline</span>
                </div>
            </div>
        `;
        list.appendChild(div);
    });
}

function addDiaryEntry() {
    const type = window.currentDiaryType;
    let question = "Введите запись:";
    if (type === 'gratitude') question = "За что вы благодарны сегодня?";
    if (type === 'emotions') question = "Что вы чувствуете?";
    if (type === 'achievements') question = "Какое достижение сегодня?";
    if (type === 'good_day') question = "Что хорошего случилось?";

    const text = prompt(question);
    if (text && text.trim() !== "") {
        window.appData.mental[type].push(text.trim());
        if (typeof saveData === 'function') saveData();
        renderDiaryEntries();
    }
}

function deleteDiaryEntry(index) {
    if (confirm("Удалить запись?")) {
        const type = window.currentDiaryType;
        window.appData.mental[type].splice(index, 1);
        if (typeof saveData === 'function') saveData();
        renderDiaryEntries();
    }
}

function editDiaryEntry(index) {
    const type = window.currentDiaryType;
    const oldText = window.appData.mental[type][index];
    const newText = prompt("Редактировать:", oldText);
    if (newText && newText.trim() !== "") {
        window.appData.mental[type][index] = newText.trim();
        if (typeof saveData === 'function') saveData();
        renderDiaryEntries();
    }
}
