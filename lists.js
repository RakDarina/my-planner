// lists.js — Заглушка
function renderListsMain() {
    const container = document.getElementById('lists-categories-container');
    if (container) {
        container.innerHTML = '<p style="text-align:center; padding:20px; color:gray;">Здесь будут ваши списки</p>';
    }
}

function openListModal() {
    alert("Создание нового списка скоро заработает!");
}

function saveListCategory() {
    console.log("Категория списка сохранена");
}

function goBackToLists() {
    // Эта функция нужна для кнопки "Назад" внутри списка
    document.getElementById('lists-view-main').style.display = 'block';
    document.getElementById('lists-view-details').style.display = 'none';
}
