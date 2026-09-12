// Optional presentation settings do not invalidate the tournament or its scores.
document.addEventListener('DOMContentLoaded', () => {
    const clubInput = document.getElementById('club-name-input');
    const sportInput = document.getElementById('sport-name-input');
    const fileInput = document.getElementById('club-logo-input');
    const resetButton = document.getElementById('remove-logo');
    const status = document.getElementById('logo-status');
    const brandIcon = document.querySelector('.brand-icon');
    const preview = document.getElementById('logo-preview');
    let logoUrl = null;
    let uploadVersion = 0;

    for (const formId of ['branding-form', 'tournament-name-form']) {
        document.getElementById(formId).addEventListener('submit', event => event.preventDefault());
    }
    clubInput.addEventListener('input', () => {
        const name = clubInput.value.trim() || 'court club';
        document.getElementById('brand-name').textContent = name;
        document.getElementById('footer-club-name').textContent = name.toUpperCase();
        document.querySelector('.brand').setAttribute('aria-label', `${name} home`);
    });
    sportInput.addEventListener('input', () => {
        const sport = sportInput.value.trim() || 'Badminton';
        document.getElementById('sport-name').textContent = sport.toUpperCase();
        document.getElementById('sidebar-sport').textContent = sport.toLowerCase();
    });

    fileInput.addEventListener('change', async () => {
        const version = ++uploadVersion;
        const file = fileInput.files[0];
        if (!file) return;
        if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) {
            status.textContent = 'Choose a PNG, JPG or WebP image no larger than 2 MB.';
            fileInput.value = '';
            return;
        }
        const url = URL.createObjectURL(file);
        const image = new Image();
        image.src = url;
        try {
            await image.decode();
            if (version !== uploadVersion) { URL.revokeObjectURL(url); return; }
            for (const container of [brandIcon, preview]) {
                const logo = image.cloneNode();
                logo.alt = '';
                container.replaceChildren(logo);
                container.classList.add('has-logo');
            }
            if (logoUrl) URL.revokeObjectURL(logoUrl);
            logoUrl = url;
            resetButton.hidden = false;
            status.textContent = `Logo updated (${image.naturalWidth} × ${image.naturalHeight} px).`;
        } catch {
            URL.revokeObjectURL(url);
            if (version !== uploadVersion) return;
            status.textContent = 'This image could not be read. Please choose another file.';
            fileInput.value = '';
        }
    });
    resetButton.addEventListener('click', () => {
        uploadVersion++;
        for (const container of [brandIcon, preview]) {
            container.textContent = '↗';
            container.classList.remove('has-logo');
        }
        if (logoUrl) URL.revokeObjectURL(logoUrl);
        logoUrl = null;
        fileInput.value = '';
        resetButton.hidden = true;
        status.textContent = 'Default logo restored.';
    });
});
