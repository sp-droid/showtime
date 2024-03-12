document.addEventListener("DOMContentLoaded", function() {
    // ################################
    // ######## Layout swapping #######
    // ################################
    const layoutList = document.getElementById("layoutList");
    const layoutText = document.getElementById("layoutText");
    const buttonToLayoutText = document.getElementById("buttonToLayoutText");
    const buttonToLayoutList = document.getElementById("buttonToLayoutList");

    buttonToLayoutText.addEventListener("click", function() {
        layoutList.style.display = "none";
        layoutText.style.display = "block";
    });
    buttonToLayoutList.addEventListener("click", function() {
        layoutText.style.display = "none";
        layoutList.style.display = "flex";
    });

    // ################################
    // ########## Typewriter ##########
    // ################################
    const typewriterProjects = document.getElementById("typewriterProjects");
    const typewriterPhrases = ["Projects from my university studies.", "Programs of my own.", "Work projects (not under NDA).", "Animations, timelapses..."];
    const typewriterDelay = 4000;
    let typewriterCurrentPhrase = 1;

    setTimeout(function() {
        changeTypeWriterPhrase();
        setInterval(changeTypeWriterPhrase, typewriterDelay*2);
    }, typewriterDelay);

    function changeTypeWriterPhrase() {
        typewriterProjects.textContent = typewriterPhrases[typewriterCurrentPhrase];

        typewriterCurrentPhrase += 1;
        if (typewriterCurrentPhrase === typewriterPhrases.length) { typewriterCurrentPhrase = 0; }
    };
    
    // ################################
    // ############# Grid #############
    // ################################
    const projects = document.getElementById("gridProjects").children;

    for (let i = 0; i < projects.length; i++) {
        const img = new Image();
        img.src = `../img/projects/preview/${projects[i].getAttribute("name")}.jpg`;
        img.onload = function() { projects[i].style.backgroundImage = `url('${img.src}')`; };
        img.onerror = function() { projects[i].style.backgroundImage = "url('../img/default.jpg')"; };
        
        projects[i].addEventListener('mouseenter', function() {
            const img = new Image();
            img.src = `../img/projects/preview/${projects[i].getAttribute("name")}.gif`;
            img.onload = function() { projects[i].style.backgroundImage = `url('${img.src}')`; };
            img.onerror = function() { projects[i].style.backgroundImage = "url('../img/default.gif')"; };
        });
        projects[i].addEventListener('mouseleave', function() {
            const img = new Image();
            img.src = `../img/projects/preview/${projects[i].getAttribute("name")}.jpg`;
            img.onload = function() { projects[i].style.backgroundImage = `url('${img.src}')`; };
            img.onerror = function() { projects[i].style.backgroundImage = "url('../img/default.jpg')"; };
        });
    }
});