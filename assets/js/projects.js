document.addEventListener("DOMContentLoaded", async () => {
    const grid = document.getElementById("gridProjects");
    const searchInput = document.getElementById("projectsSearch");
    const orderButton = document.getElementById("projectsOrder");
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
            option.textContent = value;
            select.appendChild(option);
        }
        select.disabled = false;
    }

    function createCard(project, isNewest) {
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

        const badgeLabels = [];
        if (isNewest) badgeLabels.push("Newest");
        if (project.importance === "High") badgeLabels.push("Featured");
        if (badgeLabels.length) {
            const badges = document.createElement("div");
            badges.className = "project-card__badges";
            for (const label of badgeLabels) {
                const badge = document.createElement("span");
                badge.className = "project-card__badge";
                badge.textContent = label;
                badges.appendChild(badge);
            }
            media.appendChild(badges);
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
        // Chronological: newest first. Curated: the newest project, then by importance, newest first within each group.
        const chronological = (await response.json()).sort((a, b) => dateKey(b.date) - dateKey(a.date));
        const newest = chronological[0];
        const importanceOrder = ["High", "Medium", "Low"];
        const importanceRank = project => {
            const rank = importanceOrder.indexOf(project.importance);
            return rank === -1 ? importanceOrder.length : rank;
        };
        const curated = chronological.slice(0, 1).concat(chronological.slice(1)
            .sort((a, b) => importanceRank(a) - importanceRank(b) || dateKey(b.date) - dateKey(a.date)));
        let curatedOrder = true;

        const tools = [...new Set(chronological.flatMap(project => project.tools))]
            .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
        addOptions(toolSelect, tools);

        function render() {
            const query = searchInput.value.trim().toLocaleLowerCase();
            const tool = toolSelect.value;
            const visible = (curatedOrder ? curated : chronological).filter(project =>
                (!query || [project.header, project.desc, project.type, ...project.tools]
                    .join(" ").toLocaleLowerCase().includes(query)) &&
                (!tool || project.tools.includes(tool))
            );
            const cards = document.createDocumentFragment();
            visible.forEach(project => cards.appendChild(createCard(project, project === newest)));
            grid.replaceChildren(cards);
            resultCount.textContent = `${visible.length} of ${chronological.length} entries`;
            clearButton.hidden = !query && !tool;
            emptyState.hidden = visible.length !== 0;
        }

        searchInput.addEventListener("input", render);
        toolSelect.addEventListener("change", render);
        orderButton.addEventListener("click", () => {
            curatedOrder = !curatedOrder;
            orderButton.textContent = `Order: ${curatedOrder ? "Curated" : "Chronological"}`;
            render();
        });
        clearButton.addEventListener("click", () => {
            searchInput.value = "";
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
