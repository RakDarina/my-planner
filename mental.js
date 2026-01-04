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
    // Защита: если вдруг данных нет, создаем их на лету
    if (!window.appData.mental) window.appData.mental = {};
    if (!window.appData.mental[type]) window.appData.mental[type] = [];
    
    const entries = window.appData.mental[type];
    
    if (entries.length === 0) {
        list.innerHTML = `<p style="text-align:center; color:var(--text-sec); margin-top:50px;">Записей пока нет. Нажмите "Добавить", чтобы создать первую!</p>`;
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
                    <span class="material-icons-round" style="font-size:22px; color:var(--text-sec); cursor:pointer;" onclick="editDiaryEntry(${index})">edit</span>
                    <span class="material-icons-round" style="font-size:22px; color:var(--danger); cursor:pointer;" onclick="deleteDiaryEntry(${index})">delete_outline</span>
                </div>
            </div>
        `;
        list.appendChild(div);
    });
}

function addDiaryEntry() {
    const type = window.currentDiaryType;
    let question = "Запишите ваши мысли:";
    
    if (type === 'gratitude') question = "За что вы благодарны сегодня?";
    if (type === 'emotions') question = "Что вы чувствуете прямо сейчас?";
    if (type === 'achievements') question = "Какое достижение сегодня было главным?";
    if (type === 'good_day') question = "Что хорошего произошло за день?";

    const text = prompt(question);
    if (text && text.trim() !== "") {
        window.appData.mental[type].push(text.trim());
        
        // Пытаемся сохранить через главную функцию или напрямую
        if (typeof saveData === 'function') {
            saveData();
        } else {
            localStorage.setItem('myPlannerData', JSON.stringify(window.appData));
        }
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
    const oldText = window.appData.mental[type][index];
    const newText = prompt("Отредактируйте запись:", oldText);
    if (newText && newText.trim() !== "") {
        window.appData.mental[type][index] = newText.trim();
        if (typeof saveData === 'function') saveData();
        renderDiaryEntries();
    }
}
