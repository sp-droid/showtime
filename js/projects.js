document.addEventListener("DOMContentLoaded", function() {
    // ################################
    // ######## WebGPU compat. ########
    // ################################
    const hideAlertChrome = document.getElementById("hideAlertChrome");
    setTimeout(function() {
        hideAlertChrome.style.opacity = 0;
        setTimeout(function() {
            hideAlertChrome.style.display = "none";
        }, 2000);
    }, 4000);

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
        // Background
        const img = new Image();
        img.src = `../img/projects/preview/${projects[i].getAttribute("name")}.jpg`;
        img.onload = function() { projects[i].style.backgroundImage = `url('${img.src}')`; };

        // SVG icon for P5js, WebGPU...
        projects[i].firstElementChild.children[2].setAttribute("title", `Finish date: ${projects[i].firstElementChild.children[2].textContent}`);
        projects[i].firstElementChild.children[3].firstElementChild.src = `../img/icons/${projects[i].getAttribute("project")}.svg`;
        projects[i].firstElementChild.children[3].setAttribute("title", `Project category: ${projects[i].getAttribute("project")}`);
        
        // On-hover GIF
        if (projects[i].getAttribute("gif") === "yes") {
            projects[i].addEventListener('mouseenter', function() {
                const img = new Image();
                img.src = `../img/projects/preview/${projects[i].getAttribute("name")}.gif`;
                img.onload = function() { projects[i].style.backgroundImage = `url('${img.src}')`; };
            });
            projects[i].addEventListener('mouseleave', function() {
                const img = new Image();
                img.src = `../img/projects/preview/${projects[i].getAttribute("name")}.jpg`;
                img.onload = function() { projects[i].style.backgroundImage = `url('${img.src}')`; };
            });
        };
    }
});