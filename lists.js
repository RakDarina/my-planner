// Заглушка для чек-листов
function renderListsMain() {
    const container = document.getElementById('lists-categories-container');
    if (container) {
        container.innerHTML = `
            <div style="text-align:center; padding:50px; color:#aaa;">
                <span class="material-icons-round" style="font-size:48px; opacity:0.2;">format_list_bulleted</span>
                <p>Раздел "Списки" в разработке...</p>
            </div>
        `;
    }
}

function openListModal() {
    alert("Функция создания списков скоро появится!");
}

function goBackToLists() {
    console.log("Назад к спискам");
}
