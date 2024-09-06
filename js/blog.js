document.addEventListener("DOMContentLoaded", function() {
    
    const HTMLindex = document.getElementById("HTMLindex");
    const HTMLpost = document.getElementById("HTMLpost");
    let home = true;

    // ################################
    // ###### Back button behav. ######
    // ################################
    window.addEventListener('popstate', function(event) {
        if (home === false) {
            HTMLpost.style.display = "none";
            HTMLindex.style.display = "block";
            home = true;
        } else {
            HTMLindex.style.display = "none";
            HTMLpost.style.display = "block";
            home = false;
        }
    });

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
        <h1 style="font-weight: bold; color: white;">Blog</h2>
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

            // <div class="blogEntry"><div class="blogLink">Lorem ipsum - Lorem ipsum, dolor sit</div><div>29 Mar 24</div></div>

            const indexEntry = document.createElement("div");
            indexEntry.classList.add("blogEntry");
            
            const entryText = document.createElement("div");
            entryText.classList.add("blogLink");
            entryText.textContent = data[i]["title"];

            entryText.addEventListener("click", function() {
                fetch(`../content/blog/${data[i]["file"]}`)
                    .then(response => {
                        if (!response.ok) { throw new Error('Network response was not ok'); }
                        return response.text();
                    })
                    .then(text => {
                        text = text.replace("](assets/", "](../content/blog/assets/");
                        const md = window.markdownit();
                        HTMLpost.innerHTML = `${formatDatePost(data[i]["date"])}` + md.render(text);

                        HTMLindex.style.display = "none";
                        HTMLpost.style.display = "block";
                        home = false;
                        history.pushState({ key: 'value' }, 'Title', `blog.html`);
                    })
                    .catch(error => { console.error('There was a problem fetching the markdown file:', error); });
            });
            
            const entryDate = document.createElement("div");
            entryDate.textContent = date;

            indexEntry.appendChild(entryText);
            indexEntry.appendChild(entryDate);
            HTMLindex.appendChild(indexEntry);
        }
    }

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

});