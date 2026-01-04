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
    window.currentDiaryType = type;
    
    const titleEl = document.getElementById('diary-title');
    if (titleEl) titleEl.innerText = title;

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
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
        const div = document.createElement('div');
        div.className = 'goal-card';
        div.style.marginBottom = '15px';
        div.style.padding = '15px';

        if (item.isComplex) {
            // Дизайн для дневника эмоций
            div.innerHTML = `
                <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                    <b style="color:var(--primary)">${item.date}</b>
                    <div style="display:flex; gap:10px;">
                        <span class="material-icons-round" style="font-size:20px; color:var(--text-sec); cursor:pointer;" onclick="editDiaryEntry(${index})">edit</span>
                        <span class="material-icons-round" style="font-size:20px; color:var(--danger); cursor:pointer;" onclick="deleteDiaryEntry(${index})">delete_outline</span>
                    </div>
                </div>
                <div style="font-size:14px; display:flex; flex-direction:column; gap:8px;">
                    <div><b>Ситуация:</b> ${item.situation}</div>
                    <div><b>Эмоции:</b> ${item.emotion}</div>
                    <div><b>Мысли:</b> ${item.thoughts}</div>
                    <div><b>Поведение:</b> ${item.behavior}</div>
                    <div style="color: #27ae60;"><b>Альтернатива:</b> ${item.alternative}</div>
                </div>
            `;
        } else {
            // Обычный дизайн для благодарностей и прочего
            const text = typeof item === 'object' ? item.text : item;
            const date = typeof item === 'object' ? item.date : "";
            div.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:5px;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <span style="font-size:16px; flex:1;">${index + 1}. ${text}</span>
                        <div style="display:flex; gap:10px;">
                            <span class="material-icons-round" style="font-size:20px; color:var(--text-sec); cursor:pointer;" onclick="editDiaryEntry(${index})">edit</span>
                            <span class="material-icons-round" style="font-size:20px; color:var(--danger); cursor:pointer;" onclick="deleteDiaryEntry(${index})">delete_outline</span>
                        </div>
                    </div>
                    <span style="font-size:12px; color:var(--text-sec);">${date}</span>
                </div>
            `;
        }
        list.appendChild(div);
    });
}

function addDiaryEntry() {
    const type = window.currentDiaryType;
    
    // Если это дневник эмоций - заполняем 5 пунктов
    if (type === 'emotions') {
        const situation = prompt("1. Ситуация (что произошло?):");
        if (!situation) return;
        const emotion = prompt("2. Эмоции (что почувствовали и на сколько %?):");
        const thoughts = prompt("3. Мысли (о чем подумали в тот момент?):");
        const behavior = prompt("4. Поведение (что сделали?):");
        const alternative = prompt("5. Альтернатива (как можно посмотреть на это иначе?):");

        const newEntry = {
            isComplex: true, // Пометка, что это сложная запись
            situation,
            emotion,
            thoughts,
            behavior,
            alternative,
            date: new Date().toLocaleDateString('ru-RU')
        };
        
        window.appData.mental[type].push(newEntry);
    } else {
        // Для остальных дневников оставляем как было
        let question = "Введите запись:";
        if (type === 'gratitude') question = "За что вы благодарны сегодня?";
        if (type === 'achievements') question = "Какое достижение сегодня?";
        if (type === 'good_day') question = "Что хорошего случилось?";

        const text = prompt(question);
        if (text && text.trim() !== "") {
            window.appData.mental[type].push({
                text: text.trim(),
                date: new Date().toLocaleDateString('ru-RU')
            });
        }
    }

    if (typeof saveData === 'function') saveData();
    renderDiaryEntries();
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
    const item = window.appData.mental[type][index];

    if (item.isComplex) {
        const situation = prompt("Ситуация:", item.situation);
        const emotion = prompt("Эмоции:", item.emotion);
        const thoughts = prompt("Мысли:", item.thoughts);
        const behavior = prompt("Поведение:", item.behavior);
        const alternative = prompt("Альтернатива:", item.alternative);

        window.appData.mental[type][index] = {
            ...item,
            situation: situation || item.situation,
            emotion: emotion || item.emotion,
            thoughts: thoughts || item.thoughts,
            behavior: behavior || item.behavior,
            alternative: alternative || item.alternative
        };
    } else {
        const oldText = typeof item === 'object' ? item.text : item;
        const newText = prompt("Редактировать запись:", oldText);
        if (newText && newText.trim() !== "") {
            if (typeof item === 'object') {
                window.appData.mental[type][index].text = newText.trim();
            } else {
                window.appData.mental[type][index] = { text: newText.trim(), date: new Date().toLocaleDateString('ru-RU') };
            }
        }
    }
    
    if (typeof saveData === 'function') saveData();
    renderDiaryEntries();
}
