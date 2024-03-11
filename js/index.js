document.addEventListener("DOMContentLoaded", function() {
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

    // ################################
    // ######### Initial setup ########
    // ################################

    // Replace temporary image
    carrouselContainer.style.backgroundImage = `url('../img/bg/home1.jpg')`;

    for (let i = 0; i < containers.length; i++) {
        console.log(i)
        let htmlCode = `<br><div style="width: 100%;">`;
        for (let j = 0; j < containers.length; j++) {
            htmlCode += `<i class="btn fa-stack" style="font-size: 20px;" slide-value="${j}"><i class="fa fa-circle fa-stack-2x"></i><strong class="fa-stack-1x text-primary">${j}</strong></i>`;
        }
        htmlCode += `</div><br>`;
        containers[i].innerHTML = htmlCode + containers[i].innerHTML
    }

    const slideButtons = document.querySelectorAll('i.btn.fa-stack');
    // Add click event listeners to the icon buttons
    for (let i = 0; i < slideButtons.length; i++) {
        slideButtons[i].addEventListener('click', function() {
            clearTimeout(timerNextSlide);
            const nextSlide = parseInt(slideButtons[i].getAttribute('slide-value'));
            changeSlide(globalPrevSlide, nextSlide);
        });
    };

    // Start slide changes
    timerNextSlide = setTimeout(function() {
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