document.addEventListener("DOMContentLoaded", async function() {
    // ################################
    // ########## References ##########
    // ################################
    const mobile = window.matchMedia("(hover: none)").matches;

    const carrouselContainer = document.getElementById('carrouselContainer');
    const containers = [...carrouselContainer.children].slice(1, -1);
    let globalPrevSlide = 0;
    let globalNextSlide = 1;
    const delayNextSlide = 9000;
    let timerNextSlide;
    const slideButtons = document.querySelectorAll('i.btn.fa-solid.fa-circle.fa-2x');

    // ################################
    // ######### Initial setup ########
    // ################################

    // Replace temporary image
    carrouselContainer.style.backgroundImage = `url('../img/bg/home1.jpg')`;

    // Add click event listeners to the icon buttons
    for (var i = 0; i < slideButtons.length; i++) {
        slideButtons[i].addEventListener('click', function(event) {
            const nextSlide = parseInt(event.target.getAttribute('slide-value'))
            staticChangeSlide(globalPrevSlide, nextSlide)
        });
    };

    // Start slide changes
    timerNextSlide = setTimeout(() => {
        changeSlide(globalPrevSlide, globalNextSlide);
    }, delayNextSlide);

    // Stop slide changes when hovered, continue when exiting
    if (mobile === false) {
        for (let i = 0; i < containers.length; i++) {
            containers[i].addEventListener('mouseenter', function() {
                containers[i].style.cursor = 'grab';
                containers[i].style.opacity = '0.95';
                // clearTimeout(timerNextSlide);
            });
            containers[i].addEventListener('mouseleave', function() {
                containers[i].style.cursor = 'default';
                containers[i].style.opacity = '0.2'
                // timerNextSlide = setTimeout(() => {
                //     changeSlide(globalPrevSlide, globalNextSlide);
                // }, delayNextSlide);
            });
        };
    } else {
        for (let i = 0; i < containers.length; i++) { containers[i].style.opacity = '0.95'; }
    }

    // ################################
    // ########## Functions ###########
    // ################################

    function staticChangeSlide(numberPrevSlide, numberNextSlide) {
        const img = new Image();
        img.src = `../img/bg/home${numberNextSlide+1}.jpg`
        img.onload = function() { carrouselContainer.style.backgroundImage = `url('${img.src}')`; }

        containers[numberPrevSlide].style.display = 'none';
        containers[numberNextSlide].style.display = 'block';

        numberPrevSlide = numberNextSlide;
        if (numberNextSlide === containers.length - 1) {
            numberNextSlide = 0;
        } else {
            numberNextSlide += 1;
        };
        globalPrevSlide = numberPrevSlide;
        globalNextSlide = numberNextSlide;
    };

    function changeSlide(numberPrevSlide, numberNextSlide) {
        const img = new Image();
        img.src = `../img/bg/home${numberNextSlide+1}.jpg`
        img.onload = function() { carrouselContainer.style.backgroundImage = `url('${img.src}')`; }

        containers[numberPrevSlide].style.display = 'none';
        containers[numberNextSlide].style.display = 'block';

        numberPrevSlide = numberNextSlide;
        if (numberNextSlide === containers.length - 1) {
            numberNextSlide = 0;
        } else {
            numberNextSlide += 1;
        };
        globalPrevSlide = numberPrevSlide;
        globalNextSlide = numberNextSlide;

        timerNextSlide = setTimeout(() => {
            changeSlide(numberPrevSlide, numberNextSlide);
        }, delayNextSlide);
    };

});