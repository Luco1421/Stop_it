copiar = () => navigator.clipboard.writeText(document.getElementById('c-nv').innerText);
pegar = () => {navigator.clipboard.readText().then(texto => {document.getElementById('floatingInput3').value = texto;});};
 
$('.collapse').on('shown.bs.collapse', function () {
    var $this = $(this);
    var offsetTop = $this.offset().top;
    window.scrollTo(0, offsetTop);
});


let val = (id,id2,id3,event) => {
    document.getElementById(id).addEventListener(event,
    () => {
        (document.getElementById(id).value.length && document.getElementById(id2).value.length)?
        document.getElementById(id3).removeAttribute('disabled'):
        document.getElementById(id3).setAttribute('disabled','true');
    }
    );
};

document.getElementById('floatingInput').addEventListener('input',
    () => {
        (document.getElementById('floatingInput').value.length)?
        document.getElementById('boton-buscar').removeAttribute('disabled'):
        document.getElementById('boton-buscar').setAttribute('disabled','true');
    }
);

document.getElementById('check-pegar').addEventListener('click',
    () => {
        (document.getElementById('floatingInput').value.length)?
        document.getElementById('boton-entrar').removeAttribute('disabled'):
        document.getElementById('boton-entrar').setAttribute('disabled','true');
    }
);

val('floatingInput','floatingInput2','boton-crear','input');
val('floatingInput2','floatingInput','boton-crear','input');
val('floatingInput','floatingInput3','boton-entrar','input');
val('floatingInput3','floatingInput','boton-entrar','input');

document.querySelector('.wrapper').addEventListener('click',
    () => {
        document.getElementById('start-btn').setAttribute('style','display:flex; margin-top: 2rem;');
    }
);

// window.addEventListener('beforeunload', (event) => {
//     event.preventDefault();
// });