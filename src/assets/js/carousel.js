let overlay = document.querySelector('.overlay');
let carousel = document.querySelector('.carousel');
let slides = document.querySelectorAll('.carousel .slide');
let images = document.querySelectorAll('.carousel .slide img');
let rightArrow = document.querySelector('.rigth-arrow');
let leftArrow = document.querySelector('.left-arrow');
let counter = 0;


function loadSlides (){

    carousel.style.height = '90vh';
    let heightCarousel = carousel.offsetHeight;

    for(i=0; i < images.length; i++){
        if(images[i].offsetHeight < heightCarousel){
            heightCarousel = images[i].offsetHeight;
        }
    }
    carousel.style.height = heightCarousel + 'px';

    for (i=0; i < slides.length; i++) {
        console.log("Antes", slides[i]);
        slides[i].style.left = carousel.offsetWidth * -i + 'px';
        console.log("despues", slides[i]);
    }
}

function openModal() {
    overlay.style.display = 'block';
    carousel.style.display = 'block';
    loadSlides();
}

function closeModal() {
    overlay.style.display = 'none';
    carousel.style.display = 'none';
}


function nextSlide() {
    updateArrowState(1);
    for (i=0; i < slides.length; i++) {
        slides[i].style.left = slides[i].offsetLeft + carousel.offsetWidth + 'px';
    }
}

function prevSlide() {
    updateArrowState(-1);
    for (i=0; i < slides.length; i++) {
        slides[i].style.left = slides[i].offsetLeft - carousel.offsetWidth + 'px';
    }
}

function updateArrowState(e){
    counter += e;
    if(counter !==0){
        leftArrow.style.display = 'flex';
    }else {
        leftArrow.style.display = 'none';
    }
    if(counter === slides.length -1){
        rightArrow.style.display = 'none'
    }else{
        rightArrow.style.display = 'flex'
    }
    rightArrow.style.pointerEvents = 'none';
    leftArrow.style.pointerEvents = 'none';
    setTimeout(()=>{
        rightArrow.style.pointerEvents = 'auto';
        leftArrow.style.pointerEvents = 'auto';
    }, 900)
}