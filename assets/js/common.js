document.addEventListener("DOMContentLoaded", function() {
    const section = document.getElementById("HTMLdata")?.getAttribute("section");
    const currentLink = section && document.getElementById(`${section}MenuButton`);
    if (currentLink) currentLink.setAttribute("aria-current", "page");

    document.querySelectorAll(".linkPopUp").forEach(link => {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
    });

    const header = document.querySelector(".site-header");
    const menuButton = header?.querySelector(".site-menu-toggle");
    const navigation = header?.querySelector(".site-navigation");
    if (!header || !menuButton || !navigation) return;

    function setMenuOpen(open, returnFocus = false) {
        header.classList.toggle("is-menu-open", open);
        menuButton.setAttribute("aria-expanded", String(open));
        if (returnFocus) menuButton.focus();
    }

    menuButton.addEventListener("click", () => {
        setMenuOpen(menuButton.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
            setMenuOpen(false, true);
        }
    });
    document.addEventListener("click", event => {
        if (!header.contains(event.target)) setMenuOpen(false);
    });
    navigation.addEventListener("click", event => {
        if (event.target.closest("a")) setMenuOpen(false);
    });
    window.matchMedia("(min-width: 761px)").addEventListener("change", event => {
        if (event.matches) setMenuOpen(false);
    });
});
