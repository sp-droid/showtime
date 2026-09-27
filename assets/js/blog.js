document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("blog-search-input");
    const filters = document.getElementById("blog-filters");
    const results = document.getElementById("blog-results");
    const count = document.getElementById("blog-count");
    const eyebrow = document.getElementById("blog-eyebrow");
    const heading = document.getElementById("blog-heading");
    const lede = document.getElementById("blog-lede");
    const dateFormatter = new Intl.DateTimeFormat("en-GB", {
        day: "numeric", month: "short", year: "numeric", timeZone: "UTC"
    });

    let posts = [];
    let loaded = false;
    let selectedTag = "All";

    function isDraftView() {
        return window.location.hash.toLowerCase() === "#wip";
    }

    function decoratePost(post) {
        const [day, month, year] = post.date.split("/").map(Number);
        const timestamp = Date.UTC(year, month - 1, day);
        return {
            ...post,
            timestamp,
            year: String(year),
            isoDate: [year, String(month).padStart(2, "0"), String(day).padStart(2, "0")].join("-"),
            displayDate: dateFormatter.format(new Date(timestamp))
        };
    }

    function scopedPosts() {
        return posts.filter(post => (post.tag === "WIP") === isDraftView());
    }

    function renderHeader() {
        const drafts = isDraftView();
        eyebrow.textContent = drafts ? "Drafts" : "Writing";
        heading.textContent = drafts ? "Work in progress" : "Blog";
        lede.textContent = drafts
            ? "Notes that are still taking shape."
            : "Notes on software, algorithms, space engineering, and the occasional detour.";
        document.title = drafts ? "Work in progress | Blog" : "Blog";
    }

    function renderFilters() {
        const tags = ["All", ...new Set(scopedPosts().map(post => post.tag))].sort((a, b) => {
            if (a === "All") return -1;
            if (b === "All") return 1;
            return a.localeCompare(b);
        });
        filters.replaceChildren();

        for (const tag of tags) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "blog-filter";
            button.textContent = tag;
            button.setAttribute("aria-pressed", String(selectedTag === tag));
            button.addEventListener("click", () => {
                selectedTag = tag;
                renderFilters();
                renderResults();
            });
            filters.appendChild(button);
        }
    }

    function createPost(post) {
        const article = document.createElement("article");
        article.className = "blog-entry";

        const link = document.createElement("a");
        link.className = "blog-entry__link";
        link.href = "blog/" + encodeURIComponent(post.file) + ".html";

        const meta = document.createElement("span");
        meta.className = "blog-entry__meta";

        const date = document.createElement("time");
        date.dateTime = post.isoDate;
        date.textContent = post.displayDate;

        const tag = document.createElement("span");
        tag.className = "blog-entry__tag";
        tag.textContent = post.tag;

        const title = document.createElement("h3");
        title.className = "blog-entry__title";
        title.textContent = post.title;

        const arrow = document.createElement("span");
        arrow.className = "blog-entry__arrow";
        arrow.setAttribute("aria-hidden", "true");
        const arrowIcon = document.createElement("i");
        arrowIcon.className = "fa-solid fa-arrow-right";
        arrow.appendChild(arrowIcon);

        meta.append(date, tag);
        link.append(meta, title, arrow);
        article.appendChild(link);
        return article;
    }

    function renderEmpty(hasFilters) {
        const empty = document.createElement("div");
        empty.className = "blog-empty";

        const title = document.createElement("h2");
        title.textContent = hasFilters ? "No posts found" : "No posts yet";
        const message = document.createElement("p");
        message.textContent = hasFilters
            ? "Try another title or category."
            : "Check back for new writing.";
        empty.append(title, message);

        if (hasFilters) {
            const clear = document.createElement("button");
            clear.type = "button";
            clear.className = "blog-clear";
            clear.textContent = "Clear filters";
            clear.addEventListener("click", () => {
                searchInput.value = "";
                selectedTag = "All";
                renderFilters();
                renderResults();
                searchInput.focus();
            });
            empty.appendChild(clear);
        }
        results.appendChild(empty);
    }

    function renderResults() {
        if (!loaded) return;

        const query = searchInput.value.trim().toLowerCase();
        const visible = scopedPosts().filter(post =>
            (selectedTag === "All" || post.tag === selectedTag) &&
            post.title.toLowerCase().includes(query)
        );
        count.textContent = visible.length + (visible.length === 1 ? " post" : " posts");
        results.replaceChildren();
        results.setAttribute("aria-busy", "false");

        if (visible.length === 0) {
            renderEmpty(Boolean(query || selectedTag !== "All"));
            return;
        }

        let currentYear = "";
        let yearList;
        for (const post of visible) {
            if (post.year !== currentYear) {
                currentYear = post.year;
                const group = document.createElement("section");
                group.className = "blog-year";
                const yearHeading = document.createElement("h2");
                yearHeading.className = "blog-year__heading";
                yearHeading.textContent = currentYear;
                yearList = document.createElement("div");
                yearList.className = "blog-year__entries";
                group.append(yearHeading, yearList);
                results.appendChild(group);
            }
            yearList.appendChild(createPost(post));
        }
    }

    function showLoadError() {
        count.textContent = "Posts unavailable";
        filters.replaceChildren();
        results.replaceChildren();
        results.setAttribute("aria-busy", "false");

        const empty = document.createElement("div");
        empty.className = "blog-empty";
        const title = document.createElement("h2");
        title.textContent = "Posts couldn’t load";
        const message = document.createElement("p");
        message.textContent = "Please try again.";
        const retry = document.createElement("button");
        retry.type = "button";
        retry.className = "blog-clear";
        retry.textContent = "Retry";
        retry.addEventListener("click", loadPosts);
        empty.append(title, message, retry);
        results.appendChild(empty);
    }

    async function loadPosts() {
        loaded = false;
        count.textContent = "";
        results.setAttribute("aria-busy", "true");
        results.innerHTML = '<p class="blog-loading">Loading posts…</p>';

        try {
            const response = await fetch("../content/blog.json");
            if (!response.ok) throw new Error("Blog data request failed");
            const data = await response.json();
            if (!Array.isArray(data)) throw new Error("Blog data is invalid");
            posts = data.map(decoratePost).sort((a, b) => b.timestamp - a.timestamp);
            loaded = true;
            renderFilters();
            renderResults();
        } catch (error) {
            console.error("Unable to load blog posts:", error);
            showLoadError();
        }
    }

    searchInput.addEventListener("input", renderResults);
    window.addEventListener("hashchange", () => {
        selectedTag = "All";
        searchInput.value = "";
        renderHeader();
        if (loaded) {
            renderFilters();
            renderResults();
        }
    });

    renderHeader();
    loadPosts();
});
