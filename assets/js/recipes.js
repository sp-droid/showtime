document.addEventListener('DOMContentLoaded', async () => {
    const search = document.getElementById('recipeSearch');
    const viewToggle = document.getElementById('recipeViewToggle');
    const gallery = document.getElementById('recipeGallery');
    const advanced = document.getElementById('recipeAdvanced');
    const count = document.getElementById('recipeResultCount');
    const empty = document.getElementById('recipeEmpty');
    const tableBody = document.getElementById('recipeTableBody');
    const tableScroll = document.querySelector('.recipes-table-scroll');
    const preview = document.getElementById('recipePreview');
    const originFilter = document.getElementById('recipeOrigin');
    const cuisineWatermark = document.getElementById('recipeCuisineWatermark');
    const categoryButtons = [...document.querySelectorAll('.recipes-categories button')];
    const sortButtons = [...document.querySelectorAll('.recipes-table th button')];
    const dietaryFilters = ['lactoseFree', 'glutenFree', 'vegetarian', 'vegan'].map(key => ({
        key,
        input: document.getElementById(`recipe${key[0].toUpperCase()}${key.slice(1)}`)
    }));
    const unfinished = document.getElementById('recipeUnfinished');
    const previewImage = document.getElementById('recipePreviewImage');

    let recipes = [];
    let shownInTable = [];
    let activeCategory = '';
    let selectedFile = null;
    let advancedOpen = false;
    let sort = { key: null, direction: 1 };

    function shuffleOnce(items) {
        const shuffled = [...items];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    function imageFor(entry, lowResolution = false) {
        const folder = lowResolution ? 'lowRes/' : '';
        return `../assets/img/recipes/${folder}${encodeURIComponent(entry.file)}.jpg`;
    }

    function setRecipeImage(image, entry, lowResolution = false) {
        image.classList.remove('is-image-missing');
        image.alt = '';
        image.onerror = () => {
            if (lowResolution) {
                lowResolution = false;
                image.src = imageFor(entry);
            } else {
                image.onerror = null;
                image.classList.add('is-image-missing');
                image.alt = `No photo available for ${entry.name}`;
                image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
                    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420"><rect width="600" height="420" fill="#332b25"/><circle cx="300" cy="177" r="48" fill="none" stroke="#a48161" stroke-width="4"/><path d="M260 177h80M300 137v80" stroke="#a48161" stroke-width="4"/><text x="300" y="285" fill="#dbc6ae" font-family="Arial,sans-serif" font-size="22" text-anchor="middle">Photo coming soon</text></svg>'
                );
            }
        };
        image.src = imageFor(entry, lowResolution);
    }

    function recipeUrl(entry) {
        return `recipes/${encodeURIComponent(entry.file)}.html`;
    }

    function matchesQuickFilters(entry) {
        return (!activeCategory || entry.category === activeCategory) &&
            (!originFilter.value || entry.cuisine === originFilter.value) &&
            entry.name.toLocaleLowerCase().includes(search.value.trim().toLocaleLowerCase());
    }

    function updateCuisineWatermark() {
        const cuisine = originFilter.value;
        const hasIcon = Boolean(cuisine && cuisine !== 'No information');
        originFilter.parentElement.classList.toggle('is-active', Boolean(cuisine));
        cuisineWatermark.hidden = !hasIcon;
        if (hasIcon) cuisineWatermark.src = `../assets/img/icons/cuisine${encodeURIComponent(cuisine)}.png`;
        else cuisineWatermark.removeAttribute('src');
    }

    function galleryEntries() {
        return recipes.filter(entry => entry.finished && matchesQuickFilters(entry));
    }

    function minutes(value) {
        let total = 0;
        for (const match of String(value).matchAll(/(\d+)\s*(d|h|m|min|')/gi)) {
            const unit = match[2].toLowerCase();
            total += Number(match[1]) * (unit === 'd' ? 1440 : unit === 'h' ? 60 : 1);
        }
        return total;
    }

    function sortValue(entry, key) {
        if (key === 'time') return minutes(entry.time);
        if (key === 'difficulty') return ['Very easy', 'Easy', 'Medium', 'Hard'].indexOf(entry.difficulty);
        return String(entry[key]).toLocaleLowerCase();
    }

    function tableEntries() {
        const filtered = recipes.filter(entry =>
            entry.finished !== unfinished.checked &&
            matchesQuickFilters(entry) &&
            dietaryFilters.every(({ key, input }) => !input.checked || entry[key])
        );
        if (!sort.key) return filtered;
        return filtered.sort((a, b) => {
            const first = sortValue(a, sort.key);
            const second = sortValue(b, sort.key);
            const comparison = typeof first === 'number' ? first - second : first.localeCompare(second);
            return comparison * sort.direction;
        });
    }

    function makeIconBadge(label, iconClass, extraClass = '') {
        const badge = document.createElement('span');
        badge.className = `recipes-card__badge ${extraClass}`.trim();
        badge.title = label;
        badge.setAttribute('aria-hidden', 'true');
        const icon = document.createElement('i');
        icon.className = iconClass;
        badge.append(icon);
        return badge;
    }

    function makeCard(entry) {
        const card = document.createElement('a');
        card.className = 'recipes-card';
        card.href = recipeUrl(entry);
        card.setAttribute('aria-label', [entry.name, entry.category, entry.cuisine !== 'No information' ? entry.cuisine : ''].filter(Boolean).join(', '));

        const image = document.createElement('img');
        image.alt = '';
        image.loading = 'lazy';
        image.decoding = 'async';
        setRecipeImage(image, entry, true);
        card.append(image);

        const badges = document.createElement('span');
        badges.className = 'recipes-card__badges';
        const categoryIcons = {
            'Main courses': 'fa-solid fa-drumstick-bite',
            'Desserts': 'fa-solid fa-ice-cream',
            'Drinks': 'fa-solid fa-beer-mug-empty',
            'Other': 'fa-solid fa-lemon'
        };
        badges.append(makeIconBadge(entry.category, categoryIcons[entry.category] || 'fa-solid fa-utensils'));
        if (entry.cuisine && entry.cuisine !== 'No information') {
            const cuisineBadge = document.createElement('span');
            cuisineBadge.className = 'recipes-card__badge recipes-card__badge--cuisine';
            cuisineBadge.title = `${entry.cuisine} cuisine`;
            cuisineBadge.setAttribute('aria-hidden', 'true');
            const cuisineIcon = document.createElement('img');
            cuisineIcon.alt = '';
            cuisineIcon.src = `../assets/img/icons/cuisine${encodeURIComponent(entry.cuisine)}.png`;
            cuisineBadge.append(cuisineIcon);
            badges.append(cuisineBadge);
        }
        card.append(badges);

        const title = document.createElement('span');
        title.className = 'recipes-card__title';
        title.textContent = entry.name;
        card.append(title);
        return card;
    }

    function renderGallery(entries) {
        gallery.replaceChildren(...entries.map(makeCard));
    }

    function updatePreview() {
        const index = shownInTable.findIndex(entry => entry.file === selectedFile);
        if (index < 0) {
            preview.hidden = true;
            return;
        }
        const entry = shownInTable[index];
        preview.hidden = false;
        setRecipeImage(previewImage, entry, true);
        document.getElementById('recipePreviewPosition').textContent = `${index + 1} of ${shownInTable.length}`;
        document.getElementById('recipePreviewTitle').textContent = entry.name;
        document.getElementById('recipePreviewDescription').textContent = entry.description || entry.origin || '';
        document.getElementById('recipePreviewLink').href = recipeUrl(entry);
        const facts = [entry.category, entry.cuisine !== 'No information' ? entry.cuisine : null, entry.time, entry.difficulty].filter(Boolean);
        const factBox = document.getElementById('recipePreviewFacts');
        factBox.replaceChildren(...facts.map(value => {
            const span = document.createElement('span');
            span.textContent = value;
            return span;
        }));
        for (const button of tableBody.querySelectorAll('.recipes-table__select')) {
            const isSelected = button.dataset.file === selectedFile;
            button.setAttribute('aria-pressed', String(isSelected));
            button.closest('tr').classList.toggle('is-selected', isSelected);
        }
    }

    function renderTable(entries) {
        shownInTable = entries;
        if (!entries.some(entry => entry.file === selectedFile)) selectedFile = entries[0]?.file || null;
        const rows = entries.map(entry => {
            const row = document.createElement('tr');
            const nameCell = document.createElement('td');
            const select = document.createElement('button');
            select.type = 'button';
            select.className = 'recipes-table__select';
            select.dataset.file = entry.file;
            select.textContent = entry.name;
            select.setAttribute('aria-label', `Preview ${entry.name}`);
            select.addEventListener('click', () => {
                selectedFile = entry.file;
                updatePreview();
            });
            nameCell.append(select);
            row.append(nameCell);
            for (const value of [entry.category, entry.cuisine === 'No information' ? '—' : entry.cuisine, entry.time, entry.difficulty]) {
                const cell = document.createElement('td');
                cell.textContent = value;
                row.append(cell);
            }
            row.addEventListener('click', event => {
                if (event.target.closest('button')) return;
                selectedFile = entry.file;
                updatePreview();
            });
            return row;
        });
        tableBody.replaceChildren(...rows);
        tableScroll.hidden = entries.length === 0;
        updatePreview();
    }

    function render() {
        const visible = advancedOpen ? tableEntries() : galleryEntries();
        if (advancedOpen) renderTable(visible);
        else renderGallery(visible);
        count.textContent = `${visible.length} ${visible.length === 1 ? 'recipe' : 'recipes'}${advancedOpen && unfinished.checked ? ' in progress' : ''}`;
        empty.hidden = visible.length !== 0;
        empty.textContent = advancedOpen && unfinished.checked
            ? 'No unfinished recipes match these filters. Try another name, origin, category, or dietary choice.'
            : 'No recipes match your filters. Try another name, origin, or category.';
    }

    function setView(open) {
        advancedOpen = open;
        advanced.hidden = !open;
        gallery.hidden = open;
        viewToggle.setAttribute('aria-pressed', String(open));
        viewToggle.classList.toggle('is-active', open);
        const label = open ? 'Photo gallery' : 'Advanced search';
        viewToggle.setAttribute('aria-label', label);
        viewToggle.title = label;
        document.querySelector('.recipes-gallery-hint').hidden = open;
        render();
    }

    viewToggle.addEventListener('click', () => setView(!advancedOpen));
    search.addEventListener('input', render);
    originFilter.addEventListener('change', () => {
        updateCuisineWatermark();
        render();
    });
    for (const button of categoryButtons) {
        button.addEventListener('click', () => {
            activeCategory = button.dataset.category;
            for (const option of categoryButtons) {
                const active = option === button;
                option.classList.toggle('is-active', active);
                option.setAttribute('aria-pressed', String(active));
            }
            render();
        });
    }
    for (const { input } of dietaryFilters) input.addEventListener('change', render);
    unfinished.addEventListener('change', render);
    for (const button of sortButtons) {
        button.addEventListener('click', () => {
            const key = button.dataset.sort;
            sort = { key, direction: sort.key === key ? -sort.direction : 1 };
            for (const option of sortButtons) {
                const th = option.closest('th');
                if (option === button) th.setAttribute('aria-sort', sort.direction === 1 ? 'ascending' : 'descending');
                else th.removeAttribute('aria-sort');
                option.querySelector('i').className = option === button
                    ? `fa-solid fa-sort-${sort.direction === 1 ? 'up' : 'down'}`
                    : 'fa-solid fa-sort';
            }
            render();
        });
    }
    function movePreview(delta) {
        if (!shownInTable.length) return;
        const index = shownInTable.findIndex(entry => entry.file === selectedFile);
        selectedFile = shownInTable[(index + delta + shownInTable.length) % shownInTable.length].file;
        updatePreview();
    }
    document.getElementById('recipePrevious').addEventListener('click', () => movePreview(-1));
    document.getElementById('recipeNext').addEventListener('click', () => movePreview(1));

    try {
        const response = await fetch('../content/recipes-index.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        recipes = shuffleOnce(await response.json());
        const cuisines = [...new Set(recipes.map(entry => entry.cuisine).filter(Boolean))].sort((a, b) => a.localeCompare(b));
        originFilter.append(...cuisines.map(cuisine => {
            const option = document.createElement('option');
            option.value = cuisine;
            option.textContent = cuisine;
            return option;
        }));
        updateCuisineWatermark();
        render();
    } catch (error) {
        count.textContent = 'Recipes could not be loaded.';
        empty.hidden = false;
        empty.textContent = 'Please reload the page to try again.';
        console.error('Could not load recipe index:', error);
    }
});
