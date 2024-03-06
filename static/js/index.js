document.addEventListener("DOMContentLoaded", function() {
    // ################################
    // ########## References ##########
    // ################################

    const carrouselContainer = document.getElementById('carrouselContainer');
    const containers = carrouselContainer.children;
    let globalPrevSlide = 0;
    let globalNextSlide = 1;
    const delayNextSlide = 8000;
    let timerNextSlide;
    const slideButtons = document.querySelectorAll('i.btn.fa-solid.fa-circle.fa-2x');

    // ################################
    // ######### Initial setup ########
    // ################################

    // Add click event listeners to the icon buttons
    for (var i = 0; i < slideButtons.length; i++) {
        slideButtons[i].addEventListener('click', function(event) {
            const nextSlide = parseInt(event.target.getAttribute('slide-value'))
            staticChangeSlide(globalPrevSlide, nextSlide)
        });
        slideButtons[i].addEventListener('mouseenter', function() {
            clearTimeout(timerNextSlide);
        });
        slideButtons[i].addEventListener('mouseleave', function() {
            timerNextSlide = setTimeout(() => {
                changeSlide(globalPrevSlide, globalNextSlide);
            }, delayNextSlide);
        });
    };

    // Start slide changes
    timerNextSlide = setTimeout(() => {
        changeSlide(globalPrevSlide, globalNextSlide);
    }, delayNextSlide);

    // Stop slide changes when hovered, continue when exiting
    for (let i = 0; i < containers.length; i++) {
        containers[i].addEventListener('mouseenter', function() {
            containers[i].style.cursor = 'grab';
            containers[i].style.opacity = '0.95';
        });
        containers[i].addEventListener('mouseleave', function() {
            containers[i].style.cursor = 'default';
            containers[i].style.opacity = '0.2'
        });
    };

    // ################################
    // ########## Functions ###########
    // ################################

    function staticChangeSlide(numberPrevSlide, numberNextSlide) {
        carrouselContainer.style.backgroundImage = `url('../static/img/bg/home${numberNextSlide+1}.jpg')`;
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
        carrouselContainer.style.backgroundImage = `url('../static/img/bg/home${numberNextSlide+1}.jpg')`;
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