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
        layoutText.style.display = "flex";
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
    const gridProjects = document.getElementById("gridProjects");
    const projects = document.getElementById("gridProjects").children;

    fetch("../content/projects.json")
        .then(response => {
            if (!response.ok) { throw new Error('Network response was not ok'); }
            return response.json();
        })
        .then(data => {
            for (let i = 0; i < data.length; i++) {
                const projectElement = document.createElement("a");
                projectElement.classList.add("gridElement");
                projectElement.setAttribute("target", "_blank");
                projectElement.setAttribute("rel", "noopener noreferrer");
                projectElement.setAttribute("href", data[i]["link"]);
                projectElement.style.backgroundImage = `url('../img/projects/preview/${data[i]["bg"]}.jpg')`;
                
                const innerDiv = document.createElement("div");
                // Header
                const header = document.createElement("h3");
                header.innerHTML = data[i]["header"];
                innerDiv.appendChild(header);
                // Description
                const desc = document.createElement("p");
                desc.innerHTML = "<br>"+data[i]["desc"];
                innerDiv.appendChild(desc);
                // Date
                const date = document.createElement("h5");
                date.innerHTML = formatDate(data[i]["date"]);
                date.setAttribute("title","The assigned date could be related to the latest major change to the project or an official date of termination");
                innerDiv.appendChild(date);
                // Project type icon
                const projectType = document.createElement("div");
                const projectTypeImage = document.createElement("img");
                projectTypeImage.src = `../img/icons/${data[i]["type"]}.png`;
                projectTypeImage.setAttribute("title", `Project type: ${data[i]["type"]}`);
                projectType.appendChild(projectTypeImage);
                innerDiv.appendChild(projectType);
                // Tools used
                const tools = document.createElement("div");
                for (const toolName of data[i]["tools"]) {
                    const toolImage = document.createElement("img");
                    toolImage.src = `../img/icons/${toolName}.svg`;
                    toolImage.setAttribute("title", `Tool employed: ${toolName}`);
                    tools.appendChild(toolImage);
                }
                innerDiv.appendChild(tools);
                projectElement.appendChild(innerDiv);
                
                // On hover GIF
                if (data[i]["gif"] === true) {
                    projectElement.addEventListener('mouseenter', function() {
                        projectElement.style.backgroundImage = `url('../img/projects/preview/${data[i]["bg"]}.avif')`;
                    });
                    projectElement.addEventListener('mouseleave', function() {
                        projectElement.style.backgroundImage = `url('../img/projects/preview/${data[i]["bg"]}.jpg')`;
                    });
                };

                // Importance feature
                if (data[i]["importance"] === 1) {
                    projectElement.style.border = "1px solid";
                    projectElement.setAttribute("title","This project is important, taking days/weeks to complete.");
                } else if (data[i]["importance"] === 2) {
                    projectElement.style.border = "2px solid gold";
                    projectElement.setAttribute("title","This project is very important, taking months to complete.");
                } else if (data[i]["importance"] === 3) {
                    projectElement.style.border = "3px solid darkred";
                    projectElement.setAttribute("title","This is a major venture, taking years to complete.");
                }
                gridProjects.appendChild(projectElement);
            }
        })
        .catch(error => { console.error('There was a problem fetching the JSON data:', error); });

    // ################################
    // ############# Date #############
    // ################################
    function formatDate(inputDate) {
        const parts = inputDate.split('/'); // Split the date string into parts
        const day = parseInt(parts[0], 10); // Extract the day
        const month = parseInt(parts[1], 10); // Extract the month
        const year = parseInt(parts[2], 10); // Extract the year
    
        // Create a new Date object
        const date = new Date(year, month - 1, day);
    
        // Define month names array
        const monthNames = [
            'Jan', 'Feb', 'Mar', 'Apr',
            'May', 'Jun', 'Jul', 'Aug',
            'Sep', 'Oct', 'Nov', 'Dec'
        ];
    
        // Get month name and append 'th', 'st', 'nd', 'rd' suffix for day
        const monthName = monthNames[date.getMonth()];
        const suffix = (day === 11 || day === 12 || day === 13) ? 'th' :
                       (day % 10 === 1) ? 'st' :
                       (day % 10 === 2) ? 'nd' :
                       (day % 10 === 3) ? 'rd' : 'th';
    
        // Construct formatted date string
        const formattedDate = `${monthName} ${day}${suffix}, ${year}`;
    
        return formattedDate;
    }
});