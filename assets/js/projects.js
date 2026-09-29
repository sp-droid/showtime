document.addEventListener("DOMContentLoaded", async () => {
    const grid = document.getElementById("gridProjects");
    const searchInput = document.getElementById("projectsSearch");
    const prioritySelect = document.getElementById("projectsPriority");
    const toolSelect = document.getElementById("projectsTool");
    const clearButton = document.getElementById("projectsClearFilters");
    const resultCount = document.getElementById("projectsResultCount");
    const emptyState = document.getElementById("projectsEmpty");
    const webGpuNote = document.getElementById("projectsWebGpuNote");
    const previewAllowed = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");

    async function checkWebGpu() {
        if (!navigator.gpu || typeof navigator.gpu.requestAdapter !== "function") {
            webGpuNote.hidden = false;
            return;
        }

        try {
            webGpuNote.hidden = Boolean(await navigator.gpu.requestAdapter());
        } catch {
            webGpuNote.hidden = false;
        }
    }

    checkWebGpu();

    function dateKey(value) {
        const [day, month, year] = value.split("/").map(Number);
        return year * 10000 + month * 100 + day;
    }

    function projectDate(value) {
        const [day, month, year] = value.split("/").map(Number);
        const date = new Date(year, month - 1, day);
        return {
            machine: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
            display: new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(date)
        };
    }

    function addOptions(select, values) {
        for (const value of values) {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = select === prioritySelect ? `${value} priority` : value;
            select.appendChild(option);
        }
        select.disabled = false;
    }

    function createCard(project) {
        const linked = project.link !== "#";
        const card = document.createElement(linked ? "a" : "article");
        card.className = `project-card${linked ? " project-card--linked" : ""}`;

        if (linked) {
            card.href = project.link;
            if (new URL(project.link, document.baseURI).origin !== window.location.origin) {
                card.target = "_blank";
                card.rel = "noopener noreferrer";
            }
        } else {
            card.tabIndex = 0;
        }

        const media = document.createElement("div");
        media.className = "project-card__media";

        const image = document.createElement("img");
        const stillImage = `../assets/img/projects/${project.bg}.jpg`;
        image.src = stillImage;
        image.alt = "";
        image.loading = "lazy";
        image.decoding = "async";
        media.appendChild(image);

        if (project.gif) {
            const animatedImage = `../assets/img/projects/${project.bg}.avif`;
            image.dataset.still = stillImage;
            card.addEventListener("mouseenter", () => {
                if (previewAllowed.matches) image.src = animatedImage;
            });
            card.addEventListener("mouseleave", () => { image.src = stillImage; });
        }

        if (project.importance === "High") {
            const badge = document.createElement("span");
            badge.className = "project-card__badge";
            badge.textContent = "Featured";
            media.appendChild(badge);
        }
        card.appendChild(media);

        const body = document.createElement("div");
        body.className = "project-card__body";

        const meta = document.createElement("div");
        meta.className = "project-card__meta";
        const type = document.createElement("span");
        type.textContent = project.type;
        meta.appendChild(type);
        const date = document.createElement("time");
        const formattedDate = projectDate(project.date);
        date.dateTime = formattedDate.machine;
        date.textContent = formattedDate.display;
        meta.appendChild(date);
        body.appendChild(meta);

        const content = document.createElement("div");
        content.className = "project-card__content";
        const front = document.createElement("div");
        front.className = "project-card__front";

        const title = document.createElement("h2");
        title.className = "project-card__title";
        title.textContent = project.header;
        front.appendChild(title);

        const description = document.createElement("p");
        description.className = "project-card__description";
        description.textContent = project.desc;

        if (project.tools.length) {
            const tools = document.createElement("ul");
            tools.className = "project-card__tools";
            tools.setAttribute("aria-label", "Tools used");
            for (const tool of project.tools) {
                const chip = document.createElement("li");
                chip.dataset.tool = tool;
                chip.textContent = tool;
                tools.appendChild(chip);
            }
            front.appendChild(tools);
        }

        content.append(front, description);
        body.appendChild(content);
        card.appendChild(body);
        return card;
    }

    previewAllowed.addEventListener("change", () => {
        if (!previewAllowed.matches) {
            grid.querySelectorAll("img[data-still]").forEach(image => { image.src = image.dataset.still; });
        }
    });

    try {
        const response = await fetch("../content/projects.json");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        // Featured (High importance) projects first, then newest first.
        const isFeatured = project => project.importance === "High";
        const projects = (await response.json()).sort((a, b) =>
            (isFeatured(b) - isFeatured(a)) || (dateKey(b.date) - dateKey(a.date)));

        const priorityOrder = ["Major", "High", "Medium", "Low"];
        const priorities = [...new Set(projects.map(project => project.importance))]
            .sort((a, b) => priorityOrder.indexOf(a) - priorityOrder.indexOf(b));
        const tools = [...new Set(projects.flatMap(project => project.tools))]
            .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
        addOptions(prioritySelect, priorities);
        addOptions(toolSelect, tools);

        function render() {
            const query = searchInput.value.trim().toLocaleLowerCase();
            const priority = prioritySelect.value;
            const tool = toolSelect.value;
            const visible = projects.filter(project =>
                (!query || [project.header, project.desc, project.type, ...project.tools]
                    .join(" ").toLocaleLowerCase().includes(query)) &&
                (!priority || project.importance === priority) &&
                (!tool || project.tools.includes(tool))
            );
            const cards = document.createDocumentFragment();
            visible.forEach(project => cards.appendChild(createCard(project)));
            grid.replaceChildren(cards);
            resultCount.textContent = `${visible.length} of ${projects.length} entries`;
            clearButton.hidden = !query && !priority && !tool;
            emptyState.hidden = visible.length !== 0;
        }

        searchInput.addEventListener("input", render);
        prioritySelect.addEventListener("change", render);
        toolSelect.addEventListener("change", render);
        clearButton.addEventListener("click", () => {
            searchInput.value = "";
            prioritySelect.value = "";
            toolSelect.value = "";
            render();
            searchInput.focus();
        });
        render();
    } catch (error) {
        console.error("Could not load projects:", error);
        resultCount.textContent = "Projects could not be loaded. Please try again later.";
    }
});
