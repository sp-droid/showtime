function applyStyleJS(document) {
    // TEXT //
    // linkPopUp //
    const links = document.querySelectorAll(".linkPopUp");
    for (var i = 0; i < links.length; i++) {
        links[i].setAttribute("target", "_blank");
        links[i].setAttribute("rel", "noopener noreferrer");
    }

};