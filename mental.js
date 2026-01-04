// Ждем полной загрузки страницы
window.addEventListener('DOMContentLoaded', () => {
    if (!window.appData) {
        window.appData = JSON.parse(localStorage.getItem('myPlannerData')) || {};
    }
    if (!window.appData.mental) {
        window.appData.mental = { gratitude: [], emotions: [], achievements: [], good_day: [] };
    }
});

// --- УЛУЧШЕННОЕ МОДАЛЬНОЕ ОКНО ---

function openMentalModal(question, defaultValue, onSave, isSMER = false) {
    const modal = document.getElementById('mental-modal');
    const textarea = document.getElementById('modal-textarea');
    const saveBtn = document.getElementById('modal-save-btn');
    const questionEl = document.getElementById('modal-question');
    
    questionEl.innerText = question;

    // Если это СМЭР, мы скрываем стандартное поле и показываем форму (создадим её динамически)
    if (isSMER) {
        textarea.style.display = 'none';
        let formHtml = `
            <div id="smer-form" style="display:flex; flex-direction:column; gap:10px; width:100%; text-align:left;">
                <div><b>1. Ситуация:</b><textarea id="sm-1" class="smer-input" style="width:100%; margin-top:5px; border-radius:10px; border:1px solid #ddd; padding:8px;"></textarea></div>
                <div><b>2. Эмоции:</b><textarea id="sm-2" class="smer-input" style="width:100%; margin-top:5px; border-radius:10px; border:1px solid #ddd; padding:8px;"></textarea></div>
                <div><b>3. Мысли:</b><textarea id="sm-3" class="smer-input" style="width:100%; margin-top:5px; border-radius:10px; border:1px solid #ddd; padding:8px;"></textarea></div>
                <div><b>4. Поведение:</b><textarea id="sm-4" class="smer-input" style="width:100%; margin-top:5px; border-radius:10px; border:1px solid #ddd; padding:8px;"></textarea></div>
                <div><b>5. Альтернатива:</b><textarea id="sm-5" class="smer-input" style="width:100%; margin-top:5px; border-radius:10px; border:1px solid #ddd; padding:8px;"></textarea></div>
            </div>`;
        
        // Вставляем форму перед кнопкой сохранения, если её еще нет
        if (!document.getElementById('smer-form')) {
            textarea.insertAdjacentHTML('afterend', formHtml);
        } else {
            document.getElementById('smer-form').style.display = 'flex';
        }

        // Если мы редактируем, заполняем поля
        if (typeof defaultValue === 'object') {
            document.getElementById('sm-1').value = defaultValue.situation || "";
            document.getElementById('sm-2').value = defaultValue.emotion || "";
            document.getElementById('sm-3').value = defaultValue.thoughts || "";
            document.getElementById('sm-4').value = defaultValue.behavior || "";
            document.getElementById('sm-5').value = defaultValue.alternative || "";
        }
    } else {
        // Обычный режим
        textarea.style.display = 'block';
        if (document.getElementById('smer-form')) document.getElementById('smer-form').style.display = 'none';
        textarea.value = defaultValue || "";
    }

    modal.style.display = 'flex';

    saveBtn.onclick = () => {
        if (isSMER) {
            const data = {
                situation: document.getElementById('sm-1').value,
                emotion: document.getElementById('sm-2').value,
                thoughts: document.getElementById('sm-3').value,
                behavior: document.getElementById('sm-4').value,
                alternative: document.getElementById('sm-5').value,
                isComplex: true
            };
            onSave(data);
        } else {
            onSave(textarea.value.trim());
        }
        closeMentalModal();
    };
}

function closeMentalModal() {
    document.getElementById('mental-modal').style.display = 'none';
    // Очищаем форму СМЭР при закрытии
    const form = document.getElementById('smer-form');
    if (form) {
        form.querySelectorAll('textarea').forEach(t => t.value = '');
    }
}

// --- ОСНОВНАЯ ЛОГИКА ---

function openDiary(type, title) {
    window.currentDiaryType = type;
    const titleEl = document.getElementById('diary-title');
    if (titleEl) titleEl.innerText = title;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('view-diary-details').classList.add('active');
    renderDiaryEntries();
}

function renderDiaryEntries() {
    const list = document.getElementById('diary-content-list');
    if (!list) return;
    list.innerHTML = '';
    const type = window.currentDiaryType;
    const entries = window.appData.mental[type] || [];

    entries.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'goal-card';
        div.style.cssText = "margin-bottom: 15px; padding: 15px; word-wrap: break-word; overflow-wrap: break-word;";

        let content = "";
        if (item.isComplex) {
            content = `
                <div style="font-size:14px; display:flex; flex-direction:column; gap:8px; white-space: pre-wrap;">
                    <div><b>Ситуация:</b>\n${item.situation}</div>
                    <div><b>Эмоции:</b>\n${item.emotion}</div>
                    <div><b>Мысли:</b>\n${item.thoughts}</div>
                    <div><b>Поведение:</b>\n${item.behavior}</div>
                    <div style="color: #27ae60;"><b>Альтернатива:</b>\n${item.alternative}</div>
                </div>`;
        } else {
            content = `<span style="font-size:16px; white-space: pre-wrap;">${item.text}</span>`;
        }

        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <b style="color:var(--primary)">${item.date}</b>
                <div style="display:flex; gap:10px;">
                    <span class="material-icons-round" style="font-size:20px; color:var(--text-sec); cursor:pointer;" onclick="editDiaryEntry(${index})">edit</span>
                    <span class="material-icons-round" style="font-size:20px; color:var(--danger); cursor:pointer;" onclick="deleteDiaryEntry(${index})">delete_outline</span>
                </div>
            </div>
            ${content}`;
        list.appendChild(div);
    });
}

function addDiaryEntry() {
    const type = window.currentDiaryType;
    if (type === 'emotions') {
        openMentalModal("Новая запись СМЭР", {}, (data) => {
            window.appData.mental[type].push({ ...data, date: new Date().toLocaleDateString('ru-RU') });
            saveData(); renderDiaryEntries();
        }, true);
    } else {
        let q = type === 'achievements' ? "Достижение дня" : "За что вы благодарны?";
        openMentalModal(q, "", (text) => {
            window.appData.mental[type].push({ text, date: new Date().toLocaleDateString('ru-RU'), isComplex: false });
            saveData(); renderDiaryEntries();
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
            window.appData.mental[type][index].text = text;
            saveData(); renderDiaryEntries();
        });
    }
}

function deleteDiaryEntry(index) {
    if (confirm("Удалить запись?")) {
        window.appData.mental[window.currentDiaryType].splice(index, 1);
        saveData(); renderDiaryEntries();
    }
}
