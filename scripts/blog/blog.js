// ################################
// ########### Imports ############
// ################################
import fs from "fs";
import markdownit from "markdown-it";
import markdownitFootnote from "markdown-it-footnote";
import markdownitTaskLists from "markdown-it-task-lists";
import { full as markdownitEmoji } from "markdown-it-emoji";
import markdownitKatex from "@ruanyf/markdown-it-katex";
import { align as markdownitAlign } from "@mdit/plugin-align";
import hljs from "highlight.js";

// ################################
// ######### Global vars ##########
// ################################
let blogJSON;
let template;

// ################################
// ######## Retrieve json #########
// ################################
fs.readFile("../../content/blog.json", "utf8", (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    blogJSON = JSON.parse(data);
    retrieveTemplate();
});

// ################################
// ###### Retrieve template #######
// ################################
function retrieveTemplate() {
    fs.readFile("../../assets/templates/blog/post.html", "utf8", (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        template = data;

        for (let i = 0; i < blogJSON.length; i++) {
            const [date, year] = formatDateIndex(blogJSON[i]["date"]);
            savePost(blogJSON[i], date);
        }
    });
}

function savePost(data, date) {
    fs.readFile(`../../content/blog/${data["file"]}.md`, "utf8", (err, text) => {
        if (err) {
            console.error(err);
            return;
        }
        text = `###### ${formatDatePost(data["date"])}\n`+
            `# ${data["title"]}\n`+
            `##### Reading time: ${calculateReadingTime(text)} mins\n\n---\n`+
            text.replace("](assets/", "](../../content/blog/assets/");

        const md = markdownit({
            highlight: function (str, lang) {
                if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(str, { language: lang }).value;
                } catch (__) {}
                }
            
                return ''; // use external default escaping
            }
            })
            .use(markdownitFootnote)
            .use(markdownitTaskLists)
            .use(markdownitEmoji)
            .use(markdownitKatex)
            .use(markdownitAlign);
        text = md.render(text);
        text = template.replace("{{content}}", text);
        text = text.replace("{{title}}", data["title"]);

        fs.writeFile(`../../pages/blog/${data["file"]}.html`, text, 'utf8', (err) => {
            if (err) {
                console.error('Error writing to file:', err);
                return;
            }
        });        
    });
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