document.addEventListener("DOMContentLoaded", function() {
    // Section
    const section = document.getElementById('HTMLdata').getAttribute('section');

    // Bolden required button
    const boldenButtonName = `${section}MenuButton`;
    const boldenButton = document.getElementById(boldenButtonName);
    boldenButton.style.color = 'rgb(255, 230, 255)';
    boldenButton.style.fontWeight = '700';
    
    // linkPopUp
    const links = document.querySelectorAll(".linkPopUp");
    for (var i = 0; i < links.length; i++) {
        links[i].setAttribute("target", "_blank");
        links[i].setAttribute("rel", "noopener noreferrer");
    }
});