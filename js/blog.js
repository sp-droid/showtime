document.addEventListener("DOMContentLoaded", function() {
    
    const HTMLindex = document.getElementById("HTMLindex");

    // ################################
    // ########## Blog index ##########
    // ################################
    fetch("../content/blog.json")
        .then(response => {
            if (!response.ok) { throw new Error('Network response was not ok'); }
            return response.json();
        })
        .then(data => {
            makeIndex(data);
        })
        .catch(error => { console.error('There was a problem fetching the JSON data:', error); });

    // ################################
    // ######### Remake index #########
    // ################################
    function makeIndex(data) {
        let [, prevYear] = formatDateIndex(data[0]["date"]);
            
        HTMLindex.innerHTML = `
        <br><br><br>
        <h1 style="font-weight: bold; color: white;">Blog</h1>
        <br><h3 style="color: white;">${prevYear}</h3><br>
        `
        for (let i = 0; i < data.length; i++) {

            const [date, year] = formatDateIndex(data[i]["date"]);
            
            if (year != prevYear) {
                prevYear = year;
                HTMLindex.appendChild(document.createElement("br"));
                const dateTitle = document.createElement("h3");
                dateTitle.style.color = "white";
                dateTitle.textContent = year;
                HTMLindex.appendChild(dateTitle)
                HTMLindex.appendChild(document.createElement("br"));
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
            HTMLindex.appendChild(indexEntry);
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