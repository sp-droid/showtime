document.addEventListener("DOMContentLoaded", function() {
    // Load topbar
    const HTMLtopbar = document.getElementById('HTMLtopbar');

    HTMLtopbar.innerHTML = `
    <div class="row" id="linksTopbar">
        <div class="col-10 d-flex" style="align-items: center; background-color: rgb(17, 75, 95); color: white; height: 100%;">
            &emsp;<a href="about.html" style="text-decoration: none; color: white;" title="Who am I?">Arbelo Cabrera, Pablo</a>
            &emsp;<a class="linkPopUp" href="https://www.youtube.com/@pactomars"><i class="fa-brands fa-youtube fa-lg" title="My YouTube channel" style="color: rgb(255, 129, 129)"></i></a>
            &emsp;<a class="linkPopUp" href="https://discord.gg/S2FQRHu9JX"><i class="fa-brands fa-discord fa-lg" title="The discord server for development of the game I'm sporadically working on" style="color: rgb(83, 95, 238)"></i></a>
            &emsp;<a class="linkPopUp" href="https://www.linkedin.com/in/pablo-arbelo-cabrera-051a951a2"><i class="fa-brands fa-linkedin-in fa-lg" title="My LinkedIn" style="color: rgb(90, 176, 247)"></i></a>
            &emsp;<a class="linkPopUp" href="https://github.com/sp-droid"><i class="fa-brands fa-github fa-lg" title="My GitHub profile, check it out!" style="color: rgb(230, 237, 243)"></i></a>
            <span class="longScreen">&emsp;This website is under construction</span>
        </div>
        <div class="col d-flex" style="align-items: center; justify-content: center; background-color: rgb(253, 232, 170); color: rgb(64,74,61); height: 100%;">
            <a class="linkPopUp longScreen" title="For work or other topics" href="https://docs.google.com/forms/d/1pK5hPSywf1resOSLIUOESFpqQn6cnRa2YjkRF7d77D8" style="font-weight: 500;">Contact link</a>
            <a class="linkPopUp shortScreen" title="For work or other topics" href="https://docs.google.com/forms/d/1pK5hPSywf1resOSLIUOESFpqQn6cnRa2YjkRF7d77D8" style="font-weight: 500;">Contact</a>
        </div>
    </div>
    <div class="row" id="navTopbar" style="background: linear-gradient(to right, rgb(254, 250, 230), rgb(237, 221, 251))">
        <div class="col d-flex align-items-center justify-content-center" style="line-height: 20px; height: 100%">
            <a id="indexMenuButton" href="index.html" title="Homepage where recent or current projects/entries/news are showcased" style="text-decoration: none; color: rgb(48, 48, 48);">Home</a>&emsp;
            <a id="projectsMenuButton" href="projects.html" title="Projects of different kinds are highlighted, sometimes as a video, as a JS browser-app or as an entire webpage" style="text-decoration: none; color: rgb(48, 48, 48);">Projects</a>&emsp;
            <a href="#" title="I like cooking and it's nice to finally put my recipes together in a proper form" style="text-decoration: none; color: rgba(48, 48, 48, 0.1);">Recipes</a>&emsp;
            <a href="#" title="Devlogs and personal notes" style="text-decoration: none; color: rgba(48, 48, 48, 0.1);">Blog</a>&emsp;
            <a id="aboutMenuButton" href="about.html" title="Brief page about myself for anyone interested" style="text-decoration: none; color: rgb(48, 48, 48);">About me</a>&emsp;
        </div>
    </div>`; 

    // Bolden required button
    const boldenButtonName = document.getElementById('HTMLdata').getAttribute('boldedTopbarButton');
    const boldenButton = document.getElementById(boldenButtonName);
    boldenButton.style.fontWeight = 'bolder';
    boldenButton.style.textDecoration = 'underline';
    boldenButton.style.textUnderlineOffset = '5px';
    boldenButton.style.textDecorationThickness = '1px';
});