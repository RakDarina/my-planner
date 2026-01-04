// Ждем полной загрузки страницы, чтобы данные точно были доступны
window.addEventListener('DOMContentLoaded', () => {
    if (!window.appData) {
        window.appData = JSON.parse(localStorage.getItem('myPlannerData')) || {};
    }
    if (!window.appData.mental) {
        window.appData.mental = {
            gratitude: [],
            emotions: [],
            achievements: [],
            good_day: []
        };
    }
});

function openDiary(type, title) {
    console.log("Открываем дневник:", type); // Это для проверки в консоли
    
    window.currentDiaryType = type;
    
    const titleEl = document.getElementById('diary-title');
    if (titleEl) titleEl.innerText = title;

    // Скрываем все страницы
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Показываем страницу записей
    const diaryPage = document.getElementById('view-diary-details');
    if (diaryPage) {
        diaryPage.classList.add('active');
        renderDiaryEntries();
    } else {
        alert("Ошибка: страница записей не найдена в HTML!");
    }
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

    entries.forEach((item, index) => {
        // Проверка: если запись старая (просто текст), делаем заглушку даты
        const text = typeof item === 'object' ? item.text : item;
        const date = typeof item === 'object' ? item.date : "";

        const div = document.createElement('div');
        div.className = 'goal-card';
        div.style.marginBottom = '15px';
        div.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:5px;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <span style="font-size:18px; line-height:1.4; flex:1; font-weight:500;">${index + 1}. ${text}</span>
                    <div style="display:flex; gap:15px; margin-left:10px;">
                        <span class="material-icons-round" style="font-size:20px; color:var(--text-sec); cursor:pointer;" onclick="editDiaryEntry(${index})">edit</span>
                        <span class="material-icons-round" style="font-size:20px; color:var(--danger); cursor:pointer;" onclick="deleteDiaryEntry(${index})">delete_outline</span>
                    </div>
                </div>
                ${date ? <span style="font-size:12px; color:var(--text-sec); margin-left:22px;">${date}</span> : ''}
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
        // Создаем текущую дату в формате "04.01.2026"
        const now = new Date();
        const dateStr = now.toLocaleDateString('ru-RU'); 

        // Сохраняем как объект
        const newEntry = {
            text: text.trim(),
            date: dateStr
        };

        window.appData.mental[type].push(newEntry);
        if (typeof saveData === 'function') saveData();
        renderDiaryEntries();
    }
}

function deleteDiaryEntry(index) {
    if (confirm("Удалить эту запись?")) {
        const type = window.currentDiaryType;
        window.appData.mental[type].splice(index, 1);
        if (typeof saveData === 'function') saveData();
        renderDiaryEntries();
    }
}

function editDiaryEntry(index) {
    const type = window.currentDiaryType;
    const entry = window.appData.mental[type][index];
    
    // Получаем старый текст в зависимости от формата (объект или строка)
    const oldText = typeof entry === 'object' ? entry.text : entry;
    
    const newText = prompt("Редактировать запись:", oldText);
    if (newText && newText.trim() !== "") {
        if (typeof entry === 'object') {
            window.appData.mental[type][index].text = newText.trim();
        } else {
            // Если была старая строка, превращаем её в объект с текущей датой
            window.appData.mental[type][index] = { text: newText.trim(), date: new Date().toLocaleDateString('ru-RU') };
        }
        if (typeof saveData === 'function') saveData();
        renderDiaryEntries();
    }
}
