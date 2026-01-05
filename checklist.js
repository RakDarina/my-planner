let currentChecklistCategory = '';

function openChecklistCategory(cat) {
    currentChecklistCategory = cat;
    document.getElementById('checklist-menu').style.display = 'none';
    document.getElementById('checklist-category-view').style.display = 'block';
    
    const title = document.getElementById('checklist-category-title');
    const inputArea = document.getElementById('misc-input-area');
    
    // Скрываем ввод для уборки и красоты (заполним их позже)
    inputArea.style.display = (cat === 'misc') ? 'flex' : 'none';

    if (cat === 'cleaning') title.innerText = 'Уборка';
    if (cat === 'beauty') title.innerText = 'Красота';
    if (cat === 'misc') title.innerText = 'Разное';

    renderChecklist();
}

function closeChecklistCategory() {
    document.getElementById('checklist-menu').style.display = 'grid';
    document.getElementById('checklist-category-view').style.display = 'none';
}

function renderChecklist() {
    const listContainer = document.getElementById('checklist-items-list');
    listContainer.innerHTML = '';

    if (currentChecklistCategory === 'misc') {
        const items = JSON.parse(localStorage.getItem('checklist_misc') || '[]');
        
        items.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = checklist-item ${item.completed ? 'completed' : ''};
            div.onclick = () => toggleItem(index);

            div.innerHTML = `
                <div class="checklist-checkbox">
                    <span class="material-icons-round">done</span>
                </div>
                <span class="checklist-text">${item.text}</span>
            `;
            listContainer.appendChild(div);
        });
    } else {
        // Заглушка для пустых категорий
        listContainer.innerHTML = '<p style="text-align:center; color:#999; margin-top:20px;">Пока пусто. Мы заполним это позже!</p>';
    }
}

function addMiscItem() {
    const input = document.getElementById('new-misc-item');
    const text = input.value.trim();
    
    if (text) {
        const items = JSON.parse(localStorage.getItem('checklist_misc') || '[]');
        items.push({ text: text, completed: false });
        localStorage.setItem('checklist_misc', JSON.stringify(items));
        input.value = '';
        renderChecklist();
    }
}

function toggleItem(index) {
    const items = JSON.parse(localStorage.getItem('checklist_misc') || '[]');
    items[index].completed = !items[index].completed;
    localStorage.setItem('checklist_misc', JSON.stringify(items));
    renderChecklist();
}
