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
    // ########## Typewriter ##########
    // ################################
    const typewriterProjects = document.getElementById("typewriterProjects");
    const typewriterPhrases = ["Personal projects...", "Interactive web apps, timelapses, summaries...", "Work projects..."];
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
    let projectData;
    const buttonFilterImportance = document.getElementById("buttonFilterImportance");
    // REMEMBER TO ADD MAJOR IN THE FIRST SPOT WHEN I FINALLY (!) DO SOMETHING MAJOR 
    let uniqueImportances = ["High","Medium","Low"];
    let filterImportance = 0;
    const buttonFilterTool = document.getElementById("buttonFilterTool");
    let uniqueTools;
    let filterTools = 0;
    const gridProjects = document.getElementById("gridProjects");

    fetch("../content/projects.json")
        .then(response => {
            if (!response.ok) { throw new Error('Network response was not ok'); }
            return response.json();
        })
        .then(data => {
            populateGrid(data);
            projectData = data;
            uniqueTools = [...new Set(projectData.flatMap(item => item.tools))].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
        })
        .catch(error => { console.error('There was a problem fetching the JSON data:', error); });

    buttonFilterImportance.onclick = function() {
        let data;
        let name;
        if (filterImportance === uniqueImportances.length) {
            data = projectData;
            filterImportance = 0;
            name = "All";
        } else {
            name = uniqueImportances[filterImportance];
            data = projectData.filter(item => item.importance === name);
            filterImportance++;
        }
        populateGrid(data);
        buttonFilterImportance.innerHTML = "<i class='fa fa-fire'></i>&ensp;Prio: "+name;
        buttonFilterTool.innerHTML = "<i class='fa fa-code'></i>&ensp;Tool: All";
        filterTools = uniqueTools.length;
    };
    buttonFilterTool.onclick = function() {
        let data;
        let name;
        if (filterTools === uniqueTools.length) {
            data = projectData;
            filterTools = 0;
            name = "All";
        } else {
            name = uniqueTools[filterTools];
            data = projectData.filter(item => item.tools.includes(name));
            filterTools++;
        }
        populateGrid(data);
        buttonFilterTool.innerHTML = "<i class='fa fa-code'></i>&ensp;Tool: "+name;
        buttonFilterImportance.innerHTML = "<i class='fa fa-fire'></i>&ensp;Prio: All";
        filterImportance = uniqueImportances.length;
    };

    function populateGrid(data) {
        gridProjects.innerHTML = "";
        for (let i = 0; i < data.length; i++) {
            const projectElement = document.createElement("a");
            projectElement.classList.add("gridElement");
            projectElement.setAttribute("target", "_blank");
            projectElement.setAttribute("rel", "noopener noreferrer");
            
            if (data[i]["link"] != "#") { projectElement.setAttribute("href", data[i]["link"]) }
            projectElement.style.backgroundImage = `url('../assets/img/projects/${data[i]["bg"]}.jpg')`;
            
            const innerDiv = document.createElement("div");
            // Header
            const header = document.createElement("h3");
            header.innerHTML = data[i]["header"];
            innerDiv.appendChild(header);
            // Description
            const desc = document.createElement("p");
            desc.classList.add("pRich")
            desc.innerHTML = "<br>"+data[i]["desc"];
            innerDiv.appendChild(desc);
            // Date
            const date = document.createElement("h5");
            date.innerHTML = formatDate(data[i]["date"]);
            date.setAttribute("title","The assigned date could be related to the latest major change or the date of completion");
            innerDiv.appendChild(date);
            // Project type icon
            const projectType = document.createElement("div");
            const projectTypeImage = document.createElement("img");
            projectTypeImage.src = `../assets/img/icons/${data[i]["type"]}.png`;
            projectTypeImage.setAttribute("title", `Project type: ${data[i]["type"]}`);
            projectType.appendChild(projectTypeImage);
            innerDiv.appendChild(projectType);
            // Tools used
            const tools = document.createElement("div");
            for (const toolName of data[i]["tools"]) {
                const toolImage = document.createElement("img");
                toolImage.src = `../assets/img/icons/${toolName}.svg`;
                toolImage.setAttribute("title", `Tool employed: ${toolName}`);
                tools.appendChild(toolImage);
            }
            innerDiv.appendChild(tools);
            projectElement.appendChild(innerDiv);
            
            // On hover GIF
            if (data[i]["gif"] === true) {
                projectElement.addEventListener('mouseenter', function() {
                    projectElement.style.backgroundImage = `url('../assets/img/projects/${data[i]["bg"]}.avif')`;
                });
                projectElement.addEventListener('mouseleave', function() {
                    projectElement.style.backgroundImage = `url('../assets/img/projects/${data[i]["bg"]}.jpg')`;
                });
            };

            // Importance feature
            if (data[i]["importance"] === "Medium") {
                projectElement.style.border = "1px solid";
                projectElement.setAttribute("title","Medium relative importance");
            } else if (data[i]["importance"] === "High") {
                projectElement.style.border = "2px solid gold";
                projectElement.setAttribute("title","High relative importance");
            } else if (data[i]["importance"] === "Major") {
                projectElement.style.border = "3px solid darkred";
                projectElement.setAttribute("title","Major importance");
            }
            gridProjects.appendChild(projectElement);
        }
    }
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