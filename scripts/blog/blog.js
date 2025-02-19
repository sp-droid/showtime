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
            savePost(blogJSON[i]);
        }
    });
}

function savePost(data) {
    fs.readFile(`../../content/blog/${data["file"]}.md`, "utf8", (err, text) => {
        if (err) {
            console.error(err);
            return;
        }
        text = text.split(/\r?\n/);
        let toc = false; let ignoreLines = false; let tocDict = {};
        let lastH1 = ""; let lastH2 = ""; let ref = 1;
        for (let i=0; i<text.length; i++) {
            const line = text[i];
            if (toc === false) {
                if (line.trim() === "[toc]") {
                    toc = true;
                }
            } else {
                // Ignore lines in code blocks
                if (ignoreLines === true && line.slice(0, 3) === "```") {
                    ignoreLines = false;
                    continue;
                }
                if (line.slice(0, 3) === "```") { 
                    ignoreLines = true;
                    continue;
                }
                if (ignoreLines === true) { continue; }
                
                if (line.slice(0, 2) === "# ") {
                    lastH1 = line.slice(2);
                    tocDict[lastH1] = {};
                    text[i-1] += `<div id="section${ref}"></div>\n`
                    ref++;
                }
                if (line.slice(0, 3) === "## ") {
                    if (lastH1 === "") { lastH1 = " "; tocDict[lastH1] = {}; }
                    lastH2 = line.slice(3);
                    tocDict[lastH1][lastH2] = [];
                    text[i-1] += `<div id="section${ref}"></div>\n`
                    ref++;
                }
                if (line.slice(0, 4) === "### ") {
                    if (lastH2 === "") { lastH2 = " "; tocDict[lastH1][lastH2] = []; }
                    tocDict[lastH1][lastH2].push(line.slice(4));
                    text[i-1] += `<div id="section${ref}"></div>\n`
                    ref++;
                }
            }
        }
        text = text.join("\n");
        text = '<div id="section0"></div>\n\n'+
            `###### ${formatDatePost(data["date"])}\n`+
            `# ${data["title"]}\n`+
            `##### Reading time: ${calculateReadingTime(text)} mins\n\n---\n`+
            text.replaceAll("assets/", "../../content/blog/assets/");

        const md = markdownit({
            html: true,
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
        text += `<hr><div class="blogTags"><button class="blogTagSelected" title='Check more posts of the "${data["tag"]}" category on my blog!'>${data["tag"]}</button></div><br>`
        text = template.replace("{{content}}", text);
        text = text.replace("{{title}}", data["title"]);

        // Multiple row/col table cells
        text = text.replaceAll(">#rowspan=2 ", " rowspan=2>").replaceAll(">#rowspan=3 ", " rowspan=3>").replaceAll(">#rowspan=4 ", " rowspan=4>").replaceAll(">#rowspan=5 ", " rowspan=5>");
        text = text.replaceAll(">#colspan=2 ", " colspan=2>").replaceAll(">#colspan=3 ", " colspan=3>").replaceAll(">#colspan=4 ", " colspan=4>").replaceAll(">#colspan=5 ", " colspan=5>");
        text = text.replaceAll(/<td[^>]*>#remove<\/td>/g, "");

        if (toc === true) {
            ref = 1;
            let tocText = "<div class='TOCpost'><h4>&emsp;&nbsp;Contents</h4><ul><li><a href='#section0'>(Top)</a></li>";
            for (let H1 in tocDict) {
                if (Object.keys(tocDict[H1]).length > 0) {
                    if (H1 === " ") {
                        tocText += `<ul>`
                    } else {
                        tocText += `<li onclick="toggleDetails(event)"><details><summary><a href='#section${ref}'>${H1}</a></summary><ul>`
                        ref++;
                    }
                    for (let H2 in tocDict[H1]) {
                        if (tocDict[H1][H2].length > 0) {
                            tocText += `<li onclick="toggleDetails(event)"><details><summary><a href='#section${ref}'>${H2}</a></summary><ul>`
                            ref++;
                            for (let H3 of tocDict[H1][H2]) {
                                tocText += `<li><a href='#section${ref}'>${H3}</a></li>`;
                                ref++;
                            }
                            tocText += "</ul></details></li>"
                        } else {
                            tocText += `<li><a href='#section${ref}'>${H2}</a></li>`;
                            ref++;
                        }
                    }
                    
                    if (H1 === " ") {
                        tocText += "</ul>"
                    } else {
                        tocText += "</ul></details></li>"
                    }
                } else {
                    tocText += `<li><a href='#section${ref}'>${H1}</a></li>`;
                    ref++;
                }
            }
            tocText += "\n</ul></div>"
            text = text.replaceAll("[toc]",tocText);
        } else {
            text = text.replace("[toc]","");
        }
        
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