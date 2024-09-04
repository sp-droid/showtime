document.addEventListener("DOMContentLoaded", function() {
    // Load topbar
    const HTMLtopbar = document.getElementById('HTMLtopbar');

    // Root folder
    const rootFolder = document.getElementById('HTMLdata').getAttribute('rootFolder');

    // Section
    const section = document.getElementById('HTMLdata').getAttribute('section');

    // Topbar
    topbarContent = `
    <div class="row" style="display: flex;" id="linksTopbar">
        <div style="flex: 6; display: flex; align-items: center; background-color: rgb(14, 60, 76); color: white; height: 100%;">
            &emsp;<a href="${rootFolder}templates/about.html" style="text-decoration: none; color: white;" title="Who am I?">Arbelo Cabrera, Pablo</a>
            &emsp;<a class="linkPopUp" href="https://www.youtube.com/@pactomars"><i class="fa-brands fa-youtube fa-lg" title="YouTube channel" style="color: rgb(255, 129, 129)"></i></a>
            &emsp;<a class="linkPopUp" href="https://www.flickr.com/photos/200282744@N03/albums" title="flickr albums"><img height="45em" src="${rootFolder}img/icons/flickr.svg" alt="flickr official logo."></a>
            &emsp;<a class="linkPopUp" href="https://www.linkedin.com/in/pablo-arbelo-cabrera-051a951a2"><i class="fa-brands fa-linkedin-in fa-lg" title="LinkedIn profile" style="color: rgb(90, 176, 247)"></i></a>
            &emsp;<a class="linkPopUp" href="https://github.com/sp-droid"><i class="fa-brands fa-github fa-lg" title="GitHub profile" style="color: rgb(230, 237, 243)"></i></a>
            <span class="longScreen" style="font-family: brushScriptMTfont;">&emsp;This website is <u>work in progress</u></span>
        </div>
        <div style="flex: 1; display: flex; align-items: center; justify-content: center; background-color: rgb(76, 57, 2); height: 100%;">
            <a class="linkPopUp longScreen" title="For work or other topics" href="https://docs.google.com/forms/d/1pK5hPSywf1resOSLIUOESFpqQn6cnRa2YjkRF7d77D8" style="font-weight: 500; color: rgb(222, 237, 240)">Contact link</a>
            <a class="linkPopUp shortScreen" title="For work or other topics" href="https://docs.google.com/forms/d/1pK5hPSywf1resOSLIUOESFpqQn6cnRa2YjkRF7d77D8" style="font-weight: 500; color: rgb(222, 237, 240)">Contact</a>
        </div>
    </div>
    <div class="row" id="navTopbar" style="background: linear-gradient(to right, rgb(48, 40, 2), rgb(35, 38, 39))">
        <div class="col d-flex align-items-center justify-content-center" style="line-height: 20px; height: 100%">
            <!-- <a id="indexMenuButton" href="${rootFolder}templates/index.html" title="Homepage where recent or current projects/entries/news are showcased" style="text-decoration: none; color: rgb(202, 197, 190);">Home</a>&emsp; -->
            <a id="projectsMenuButton" href="${rootFolder}templates/projects.html" title="Projects of different kinds are highlighted, sometimes as a video, as a JS browser-app or as an entire webpage" style="text-decoration: none; color: rgb(202, 197, 190);">Projects</a>&emsp;
            <a id="recipesMenuButton" href="${rootFolder}templates/recipes.html" title="Some of my recipes since I like cooking quite a bit" style="text-decoration: none; color: rgb(202, 197, 190);">Recipes</a>&emsp;
            <a id="blogMenuButton" href="${rootFolder}templates/blog.html" title="Devlogs and personal notes" style="text-decoration: none; color: rgba(202, 197, 190);">Blog</a>&emsp;
            <a id="aboutMenuButton" href="${rootFolder}templates/about.html" title="Brief page about myself for anyone interested" style="text-decoration: none; color: rgb(202, 197, 190);">About me</a>&emsp;
        </div>
    </div>`;
    HTMLtopbar.innerHTML = topbarContent;

    // Bolden required button
    const boldenButtonName = `${section}MenuButton`;
    const boldenButton = document.getElementById(boldenButtonName);
    boldenButton.style.fontWeight = 'bolder';
    
});