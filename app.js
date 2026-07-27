/* ============================================
   ОБРАЗОВАТЕЛЬНЫЙ КАТАЛОГ — ЛОГИКА
   ============================================ */

let DATA = null;
let activeCategory = 'all';
let activeGrade = null;
let searchTerm = '';

// === LOAD ===
async function loadData() {
    const res = await fetch('apps.json');
    DATA = await res.json();
    document.getElementById('stat-total').textContent = DATA.apps.length;
    renderFilters();
    renderGrid();
}

// === RENDER FILTERS ===
function renderFilters() {
    // Category chips
    const catContainer = document.getElementById('chips-category');
    let cats = `<div class="chip active" data-cat="all">Все</div>`;
    for (const [key, cat] of Object.entries(DATA.categories)) {
        const count = DATA.apps.filter(a => a.category === key).length;
        cats += `<div class="chip" data-cat="${key}">${cat.icon} ${cat.name} <span style="opacity:.5">${count}</span></div>`;
    }
    catContainer.innerHTML = cats;
    catContainer.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            catContainer.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            activeCategory = chip.dataset.cat;
            renderGrid();
        });
    });

    // Grade chips
    const gradeContainer = document.getElementById('chips-grade');
    const allGrades = [...new Set(DATA.apps.flatMap(a => a.grades))].sort();
    let grades = `<div class="chip active" data-grade="all">Все</div>`;
    for (const g of allGrades) {
        grades += `<div class="chip" data-grade="${g}">${g} класс</div>`;
    }
    gradeContainer.innerHTML = grades;
    gradeContainer.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            gradeContainer.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            activeGrade = chip.dataset.grade === 'all' ? null : parseInt(chip.dataset.grade);
            renderGrid();
        });
    });
}

// === RENDER GRID ===
function renderGrid() {
    const grid = document.getElementById('grid');
    const filtered = DATA.apps.filter(app => {
        // Category filter
        if (activeCategory !== 'all' && app.category !== activeCategory) return false;
        // Grade filter
        if (activeGrade !== null && !app.grades.includes(activeGrade)) return false;
        // Search
        if (searchTerm) {
            const haystack = (app.title + ' ' + app.desc + ' ' + app.tags.join(' ')).toLowerCase();
            if (!haystack.includes(searchTerm)) return false;
        }
        return true;
    });

    if (filtered.length === 0) {
        grid.innerHTML = '';
        document.getElementById('empty').style.display = 'block';
        return;
    }
    document.getElementById('empty').style.display = 'none';

    grid.innerHTML = filtered.map(app => {
        const cat = DATA.categories[app.category];
        const gradeText = app.grades.length === 1
            ? `${app.grades[0]} класс`
            : `${Math.min(...app.grades)}–${Math.max(...app.grades)} класс`;
        const tags = app.tags.slice(0, 3).map(t => `<span class="card__tag">${t}</span>`).join('');
        return `
        <a href="${app.url}" target="_blank" class="card" data-id="${app.id}">
            <div class="card__preview">
                <span class="card__preview-icon">${cat.icon}</span>
                <span class="card__preview-overlay">${cat.name}</span>
            </div>
            <div class="card__body">
                <div class="card__title">${app.title}</div>
                <div class="card__desc">${app.desc}</div>
                <div class="card__tags">${tags}</div>
                <div class="card__footer">
                    <span class="card__grade">${gradeText}</span>
                    <span class="card__cta">Открыть →</span>
                </div>
            </div>
        </a>`;
    }).join('');
}

// === SEARCH ===
document.getElementById('search').addEventListener('input', (e) => {
    searchTerm = e.target.value.toLowerCase().trim();
    renderGrid();
});

// === RESET ===
function resetFilters() {
    activeCategory = 'all';
    activeGrade = null;
    searchTerm = '';
    document.getElementById('search').value = '';
    document.querySelectorAll('.chip').forEach(c => {
        c.classList.toggle('active', c.dataset.cat === 'all' || c.dataset.grade === 'all');
    });
    renderGrid();
}

// === INIT ===
loadData();
