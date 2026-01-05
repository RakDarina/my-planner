// diary_tab.js — Заглушка
function renderDiary() {
    const container = document.getElementById('diary-list-container');
    if (container) {
        container.innerHTML = '<p style="text-align:center; padding:20px; color:gray;">Дневник пока пуст (Заглушка)</p>';
    }
}

function openDiaryModal() {
    alert("Окно добавления записи скоро будет настроено!");
}

function saveDiaryEntry() {
    console.log("Сохранение записи в дневник...");
}

function changeDiaryMonth(step) {
    console.log("Переключение месяца дневника на " + step);
}
