document.addEventListener("DOMContentLoaded", function() {
    
    const HTMLbase = document.getElementById("HTMLindex").children[0];
    const HTMLlist = document.getElementById("HTMLindex").children[1];

    let blogJSON;
    let uniqueTags;
    let filtered = [];

    let wip = false;
    if (window.location.hash === "#wip") {
        wip = true;
    }

    // ################################
    // ########## Blog index ##########
    // ################################
    fetch("../content/blog.json")
        .then(response => {
            if (!response.ok) { throw new Error('Network response was not ok'); }
            return response.json();
        })
        .then(data => {
            if (wip) {
                blogJSON = data.filter(entry => entry.tag === "WIP");
            } else {
                blogJSON = data.filter(entry => entry.tag !== "WIP")
            }
            makeBase(blogJSON);
        })
        .catch(error => { console.error('There was a problem fetching the JSON data:', error); });

    // ################################
    // ######### Remake index #########
    // ################################
    
    function getIndicesOfMatchingTags(dict, includeList) {
        if (includeList.length === 0) {
            return dict.map((_, index) => index);
        }
        return dict
            .map((entry, index) => includeList.includes(entry.tag) ? index : null)
            .filter(index => index !== null);  // Filter out null values
    }

    function makeBase(data) {
        HTMLbase.innerHTML = '<br><br><br><h1 style="font-weight: bold; color: white;">Blog</h1><br>'
        
        uniqueTags = [...new Set(data.map(entry => entry.tag))]
        filtered = getIndicesOfMatchingTags(data, [])

        const tags = document.createElement("div");
        tags.classList.add("blogTags");        
        for (let i = 0; i < uniqueTags.length; i++) {
            const tag = document.createElement("button")
            tag.textContent = uniqueTags[i];

            tag.onclick = function() {
                if (tag.classList.contains("blogTagSelected")) {
                    tag.classList.remove("blogTagSelected")
                    filtered = getIndicesOfMatchingTags(data, []);
                } else {
                    for (let j = 0; j < uniqueTags.length; j++) {
                        tags.children[j].classList.remove('blogTagSelected');
                    }
                    tag.classList.add("blogTagSelected");
                    filtered = getIndicesOfMatchingTags(data, [tag.textContent]);
                }
                fillList(data);
                console.log(filtered)
            }
            tags.appendChild(tag);
        }
        HTMLbase.appendChild(tags);
        HTMLbase.appendChild(document.createElement("br"));
        fillList(data);
    }

    function fillList(data) {
        let [, prevYear] = formatDateIndex(data[filtered[0]]["date"]);
            
        HTMLlist.innerHTML = `<h3 style="color: white;">${prevYear}</h3><br>`;
        for (let index in filtered) {
            let i = filtered[index];
            const [date, year] = formatDateIndex(data[i]["date"]);
            
            if (year != prevYear) {
                prevYear = year;
                HTMLlist.appendChild(document.createElement("br"));
                const dateTitle = document.createElement("h3");
                dateTitle.style.color = "white";
                dateTitle.textContent = year;
                HTMLlist.appendChild(dateTitle)
                HTMLlist.appendChild(document.createElement("br"));
            }

            const indexEntry = document.createElement("div");
            indexEntry.classList.add("blogEntry");
            
            const entryText = document.createElement("div");
            entryText.classList.add("blogLink");
            entryText.textContent = data[i]["title"];

            entryText.addEventListener("click", function() {
                window.location.href = `blog/${data[i]["file"]}.html`;
            });
            
            const entryDate = document.createElement("div");
            entryDate.textContent = date;

            indexEntry.appendChild(entryText);
            indexEntry.appendChild(entryDate);
            HTMLlist.appendChild(indexEntry);
        }
    }

});

// ################################
// ############# Date #############
// ################################
function formatDateIndex(inputDate) {
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

    // Construct formatted date string
    const formattedDate = `${day} ${monthName} ${year-2000}`;

    return [formattedDate, year];
}

function formatDatePost(inputDate) {
    const parts = inputDate.split('/'); // Split the date string into parts
    const day = parseInt(parts[0], 10); // Extract the day
    const month = parseInt(parts[1], 10); // Extract the month
    const year = parseInt(parts[2], 10); // Extract the year

    // Create a new Date object
    const date = new Date(year, month - 1, day);

    // Define month names array
    const monthNames = [
        'January', 'February', 'March', 'April',
        'May', 'June', 'July', 'August',
        'September', 'October', 'November', 'December'
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

// ################################
// ########### Read time ##########
// ################################
function calculateReadingTime(text) {
    // Define average reading speed (words per minute)
    const wordsPerMinute = 225;
    
    // Remove any extra spaces and count the number of words
    const wordCount = text.trim().split(/\s+/).length;
    
    // Calculate the reading time in minutes
    const timeInMinutes = Math.ceil(wordCount / wordsPerMinute);
    
    return timeInMinutes;
}