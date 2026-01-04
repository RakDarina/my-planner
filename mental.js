// Ждем полной загрузки страницы
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

// --- ФУНКЦИИ МОДАЛЬНОГО ОКНА ---

function openMentalModal(question, defaultValue, onSave) {
    const modal = document.getElementById('mental-modal');
    const textarea = document.getElementById('modal-textarea');
    const saveBtn = document.getElementById('modal-save-btn');
    
    document.getElementById('modal-question').innerText = question;
    textarea.value = defaultValue || "";
    modal.style.display = 'flex';
    
    // Автофокус и сброс высоты
    textarea.focus();
    textarea.style.height = 'auto';
    textarea.style.height = (textarea.scrollHeight) + 'px';

    // Слушатель для расширения поля при вводе
    textarea.oninput = function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    };

    saveBtn.onclick = () => {
        const result = textarea.value.trim();
        if (result) {
            onSave(result);
            closeMentalModal();
        }
    };
}

function closeMentalModal() {
    document.getElementById('mental-modal').style.display = 'none';
}

// --- ОСНОВНАЯ ЛОГИКА ---

function openDiary(type, title) {
    window.currentDiaryType = type;
    const titleEl = document.getElementById('diary-title');
    if (titleEl) titleEl.innerText = title;

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const diaryPage = document.getElementById('view-diary-details');
    if (diaryPage) {
        diaryPage.classList.add('active');
        renderDiaryEntries();
    }
}

function renderDiaryEntries() {
    const list = document.getElementById('diary-content-list');
    if (!list) return;
    list.innerHTML = '';
    
    const type = window.currentDiaryType;
    const entries = window.appData.mental[type] || [];
    
    if (entries.length === 0) {
        list.innerHTML = `<p style="text-align:center; color:var(--text-sec); margin-top:50px;">Записей пока нет...</p>`;
        return;
    }

    entries.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'goal-card';
        div.style.marginBottom = '15px';
        div.style.padding = '15px';

        if (item.isComplex) {
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
                </div>`;
        } else {
            const text = typeof item === 'object' ? item.text : item;
            const date = typeof item === 'object' ? item.date : "";
            div.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:5px;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <span style="font-size:16px; flex:1; white-space: pre-wrap;">${index + 1}. ${text}</span>
                        <div style="display:flex; gap:10px;">
                            <span class="material-icons-round" style="font-size:20px; color:var(--text-sec); cursor:pointer;" onclick="editDiaryEntry(${index})">edit</span>
                            <span class="material-icons-round" style="font-size:20px; color:var(--danger); cursor:pointer;" onclick="deleteDiaryEntry(${index})">delete_outline</span>
                        </div>
                    </div>
                    <span style="font-size:12px; color:var(--text-sec);">${date}</span>
                </div>`;
        }
        list.appendChild(div);
    });
}

function addDiaryEntry() {
    const type = window.currentDiaryType;

    if (type === 'emotions') {
        // Оставляем prompt для эмоций, так как там 5 быстрых вопросов
        const s = prompt("1. Ситуация:"); if (!s) return;
        const e = prompt("2. Эмоции:");
        const t = prompt("3. Мысли:");
        const b = prompt("4. Поведение:");
        const a = prompt("5. Альтернатива:");

        window.appData.mental[type].push({
            isComplex: true, situation: s, emotion: e, thoughts: t, behavior: b, alternative: a,
            date: new Date().toLocaleDateString('ru-RU')
        });
        if (typeof saveData === 'function') saveData();
        renderDiaryEntries();
    } else {
        let question = "За что вы благодарны сегодня?";
        if (type === 'achievements') question = "Какое достижение сегодня?";
        if (type === 'good_day') question = "Что хорошего случилось?";

        openMentalModal(question, "", (text) => {
            window.appData.mental[type].push({
                text: text,
                date: new Date().toLocaleDateString('ru-RU')
            });
            if (typeof saveData === 'function') saveData();
            renderDiaryEntries();
        });
    }
}

function editDiaryEntry(index) {
    const type = window.currentDiaryType;
    const item = window.appData.mental[type][index];

    if (item.isComplex) {
        const s = prompt("Ситуация:", item.situation);
        const e = prompt("Эмоции:", item.emotion);
        const t = prompt("Мысли:", item.thoughts);
        const b = prompt("Поведение:", item.behavior);
        const a = prompt("Альтернатива:", item.alternative);
        window.appData.mental[type][index] = { ...item, situation: s, emotion: e, thoughts: t, behavior: b, alternative: a };
        if (typeof saveData === 'function') saveData();
        renderDiaryEntries();
    } else {
        const oldText = typeof item === 'object' ? item.text : item;
        openMentalModal("Редактировать запись:", oldText, (newText) => {
            if (typeof item === 'object') {
                window.appData.mental[type][index].text = newText;
            } else {
                window.appData.mental[type][index] = { text: newText, date: new Date().toLocaleDateString('ru-RU') };
            }
            if (typeof saveData === 'function') saveData();
            renderDiaryEntries();
        });
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
