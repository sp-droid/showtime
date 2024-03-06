document.addEventListener("DOMContentLoaded", function() {
    const HTMLtopbar = document.getElementById('HTMLtopbar');

    HTMLtopbar.innerHTML = `
    <div style="font-family: tabloidScuzzball, sans-serif;">
        <div class="row" style="height: 3.1vh; font-size: 1.6vh;">
            <div class="col-10 d-flex align-items-center" style="background-color: rgb(17, 75, 95); color: white; height: 100%;">
                &ensp;<a href="index.html" style="text-decoration: none; color: white;">Arbelo Cabrera, Pablo</a>
                &emsp;<a class="linkPopUp" href="https://www.youtube.com/@pactomars"><i class="fa-brands fa-youtube fa-lg" style="color: rgb(255, 129, 129)"></i></a>
                &emsp;<a class="linkPopUp" href="https://www.instagram.com/pablo.arbelocabrera"><i class="fa-brands fa-instagram fa-lg" style="color: rgb(253, 130, 202)"></i></a>
                &emsp;<a class="linkPopUp" href="https://www.linkedin.com/in/pablo-arbelo-cabrera-051a951a2"><i class="fa-brands fa-linkedin-in fa-lg" style="color: rgb(90, 176, 247)"></i></a>
                &emsp;<a class="linkPopUp" href="https://github.com/sp-droid"><i class="fa-brands fa-github fa-lg" style="color: rgb(230, 237, 243)"></i></a>
                &emsp;&emsp;This website is under construction
            </div>
            <div class="col d-flex align-items-center justify-content-center" style="background-color: rgb(253, 232, 170); color: rgb(64,74,61); height: 100%;">
                <a target="_blank" rel="noopener noreferrer" href="https://docs.google.com/forms/d/1pK5hPSywf1resOSLIUOESFpqQn6cnRa2YjkRF7d77D8" style="text-decoration: none; font-weight: 500;">Contact link</a>
            </div>
        </div>
        <div class="row" style="height: 6vh; font-size: 2.3vh; background-color: rgb(242, 238, 230); font-weight: normal;">
            <div class="col d-flex align-items-center justify-content-center" style="line-height: 20px; height: 100%">
                <a id="indexMenuButton" href="index.html" style="text-decoration: none; color: rgb(48, 48, 48);">HOME</a>&emsp;
                <a id="test1MenuButton" href="projects.html" style="text-decoration: none; color: rgb(48, 48, 48);">PROJECTS</a>&emsp;
                <!-- <a id="test2MenuButton" href="#" style="text-decoration: none; color: rgb(48, 48, 48);">RECIPES</a>&emsp; -->
                <a id="testxMenuButton" href="testx.html" style="text-decoration: none;">Video 1</a>&emsp;
                <a id="testyMenuButton" href="testy.html" style="text-decoration: none;">Video 2</a>&emsp;
            </div>
        </div>
    </div>`;
});