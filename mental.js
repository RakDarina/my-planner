// Ждем полной загрузки страницы, чтобы данные были доступны
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

// --- ФУНКЦИИ МОДАЛЬНОГО ОКНА (БОЛЬШОЕ ПОЛЕ ВВОДА) ---

function openMentalModal(question, defaultValue, onSave) {
    const modal = document.getElementById('mental-modal');
    const textarea = document.getElementById('modal-textarea');
    const saveBtn = document.getElementById('modal-save-btn');
    
    document.getElementById('modal-question').innerText = question;
    textarea.value = defaultValue || "";
    modal.style.display = 'flex';
    
    // Автофокус и настройка высоты под текст
    textarea.focus();
    textarea.style.height = 'auto';
    textarea.style.height = (textarea.scrollHeight) + 'px';

    // Чтобы поле расширялось при печати
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

// --- ОСНОВНАЯ ЛОГИКА ОТОБРАЖЕНИЯ ---

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
        
        // Стили для карточки: предотвращаем вылет текста за границы
        div.style.cssText = "margin-bottom: 15px; padding: 15px; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;";

        // Получаем текст (поддерживаем и старый формат СМЭР, и новый текстовый)
        let displayHtml = "";
        const date = item.date || "";

        if (item.isComplex) {
            // Для старых записей СМЭР (если они остались в памяти)
            displayHtml = `
                <div style="font-size:14px; display:flex; flex-direction:column; gap:8px; white-space: pre-wrap;">
                    <div><b>Ситуация:</b> ${item.situation}</div>
                    <div><b>Эмоции:</b> ${item.emotion}</div>
                    <div><b>Мысли:</b> ${item.thoughts}</div>
                    <div><b>Поведение:</b> ${item.behavior}</div>
                    <div style="color: #27ae60;"><b>Альтернатива:</b> ${item.alternative}</div>
                </div>`;
        } else {
            // Для всех новых записей (с поддержкой абзацев)
            displayHtml = `<span style="font-size:16px; white-space: pre-wrap;">${item.text}</span>`;
        }

        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                <b style="color:var(--primary); font-size:14px;">${date}</b>
                <div style="display:flex; gap:12px;">
                    <span class="material-icons-round" style="font-size:20px; color:var(--text-sec); cursor:pointer;" onclick="editDiaryEntry(${index})">edit</span>
                    <span class="material-icons-round" style="font-size:20px; color:var(--danger); cursor:pointer;" onclick="deleteDiaryEntry(${index})">delete_outline</span>
                </div>
            </div>
            ${displayHtml}
        `;
        list.appendChild(div);
    });
}

// --- ДОБАВЛЕНИЕ И РЕДАКТИРОВАНИЕ ---

function addDiaryEntry() {
    const type = window.currentDiaryType;
    let question = "За что вы благодарны сегодня?";
    let defaultValue = "";

    if (type === 'emotions') {
        question = "Дневник эмоций (СМЭР):";
        defaultValue = "1. Ситуация:\n\n2. Эмоции:\n\n3. Мысли:\n\n4. Поведение:\n\n5. Альтернатива:";
    } else if (type === 'achievements') {
        question = "Какое достижение сегодня?";
    } else if (type === 'good_day') {
        question = "Что хорошего случилось?";
    }

    openMentalModal(question, defaultValue, (text) => {
        window.appData.mental[type].push({
            text: text,
            date: new Date().toLocaleDateString('ru-RU'),
            isComplex: false // Теперь сохраняем всё как единый текст с абзацами
        });
        if (typeof saveData === 'function') saveData();
        renderDiaryEntries();
    });
}

function editDiaryEntry(index) {
    const type = window.currentDiaryType;
    const item = window.appData.mental[type][index];
    
    // Подготовка текста для редактирования
    let currentText = item.text;
    if (item.isComplex) {
        currentText = `1. Ситуация: ${item.situation}\n2. Эмоции: ${item.emotion}\n3. Мысли: ${item.thoughts}\n4. Поведение: ${item.behavior}\n5. Альтернатива: ${item.alternative}`;
    }

    openMentalModal("Редактировать запись:", currentText, (newText) => {
        window.appData.mental[type][index] = {
            text: newText,
            date: item.date || new Date().toLocaleDateString('ru-RU'),
            isComplex: false
        };
        if (typeof saveData === 'function') saveData();
        renderDiaryEntries();
    });
}

function deleteDiaryEntry(index) {
    if (confirm("Удалить эту запись?")) {
        const type = window.currentDiaryType;
        window.appData.mental[type].splice(index, 1);
        if (typeof saveData === 'function') saveData();
        renderDiaryEntries();
    }
}
