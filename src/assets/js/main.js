$(document).ready(function() {
    // Se obtiene la posicion del scroll por medio de el id del contenedor
    $(window).on('scroll', function() {
        let posicion = $('#pr').offset();
        if($(window).scrollTop()>= posicion.top)
        {
            $('header').removeClass('transparente');
        } else{
            $('header').addClass('transparente');
        }
    })

    // Se abre o cierra el menu de hamburguesa (menu lateral)
    $('#burger').click(function(){
        $('#burger').toggleClass('abierto');
        $('.menu').toggleClass('abierto');
    })

    // Transicion para boton hero down
    $('a').on('click', function() {
        if(this.hash !==''){
            let hash = this.hash;
            $('html, body').animate({
                scrollTop: $(hash).offset().top
            }, 800)
        }
    })

})