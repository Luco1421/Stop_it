let server = firebase.database();
let playerId, salaId, playerRef, mazoId, partidaIniciada = false;
let cantPlayers = 0, listos=0, res = [];

let modoCont = new Array(5);
let temaCont = new Array(3);
let imaCont = new Array(5);
let info = new Map();
let mazos = new Map();
let carta = new Map();
let jug;
let band=false;
let busco = false;
let pagina_actual;
let arrJug = [];
let host;

let ocupados = [false,false,false,false,false,false];
let modos = ['tripleta', 'papa_caliente', 'torre', 'regalo_envenenado', 'pozo'];
let tematicas = ['avatar', 'got', 'brands'];
let cantImag = [4, 5, 6, 8, 9];
let elementosLista = [['assets/icos/blue.png','blue'],['assets/icos/gray.png','gray'],
    ['assets/icos/green.png','green'],['assets/icos/orange.png','orange'],['assets/icos/purple.png','purple'],
    ['assets/icos/red.png','red']];

cambiarMouse(0);

const app ={
    pages: [],
    show: new Event('show'),
    init: function(){
        history.replaceState({}, 'pantalla_principal', '#pantalla_principal');
    },
    pasar: function(currentPage){
        document.querySelector('.activo').classList.remove('activo');
        document.getElementById(currentPage).classList.add('activo');
        ocultar(currentPage);
    }
};

const ingresaJugador=(snapshot)=>{
    const nuevo=snapshot.val();
    if(nuevo<host) host=nuevo;
    arrJug.push(nuevo);
    server.ref(`player/${nuevo}`).once("value")
    .then(function(snapshot) {
        var valor = snapshot.val();
        console.log('Entra jugador', valor);
        cantPlayers++;
        if(cantPlayers == 6){
            server.ref(`estado/${salaId}/disponible`).set('false');
        }
        info.set(nuevo,valor);
        ocupados[valor.num]=true;
        agregarElementoConImagen(valor.num, valor.name);
    })
}

const saleJugador=(snapshot)=>{
    const out=snapshot.val();
    arrJug.splice(arrJug.indexOf(out),1);
    if(out == host){
        host =  arrJug[0];
        arrJug.forEach((i)=>{if(i<host) host=i});
    }
    const jug=info.get(out);
    console.log('sale jugador', out);
    ocupados[jug.num]=false;
    cantPlayers--;
    if(cantPlayers ==  5 && partidaIniciada == false){
        server.ref(`estado/${salaId}/disponible`).set('true');
    } 
    eliminarDivHijo(jug.num);
    info.delete(out);
    if(partidaIniciada==false && listos>0){
        listos=0;
        alert('Alguien se fue');
        rollBack();
    } 
    if(cantPlayers==1 && partidaIniciada==true) rollBack();

}

const listoJugador=(snapshot)=>{
    var nuevo=snapshot.val();
    listos++;
    info.get(nuevo).listo=true;
    if(listos==cantPlayers){
        preparar();
    }
}

fetch('https://stop-it.onrender.com')
    .then(response => response.json())
    .then(data => {
    for(let info in data[0]){
        mazos.set(data[0][info][0], {
            rutaReverso: data[0][info][1].slice(1,-1),
            cartas: []
        });
    }
    for(let i in data[1]){
        mazos.get(data[1][i][0]).cartas.unshift(data[1][i][1]);
        carta.set(data[1][i][1], []);
    }
    for(let i = 0; i < 4368; i++){
        carta.get(data[2][i][0]).push({
            ruta: data[2][i][1].slice(1,-1),
            x: data[2][i][2],
            y: data[2][i][3],
            factScale: data[2][i][4],
            factRotate: data[2][i][5],
            ancho: data[2][i][6],
            alto: data[2][i][7]
        })
    }
    }).catch(error => console.error('Picha, hay un error:', error)
);

let ocultar = () => {
    document.getElementById('nvi').removeAttribute('hidden');
    document.getElementById('nv').removeAttribute('hidden');
    document.getElementById('navbarSupportedContent').removeAttribute('hidden');
    document.getElementById('jugadores').removeAttribute('hidden');
};

let ponerZoom = () => {
    document.body.style.zoom = "50%";
    document.querySelector('nav').style.zoom = '200%';
    document.getElementById('jugadores').style.zoom = '200%';
}

let quitarZoom = () => {
    document.body.style.zoom = "100%";
    document.querySelector('nav').style.zoom = '100%';
    document.getElementById('jugadores').style.zoom = '100%';
}

function eleccion() {
    return new Promise((resolve, reject) => {
        const promises = [];
        arrJug.forEach((llave) => {
            const ref = server.ref(`player/${llave}`).once('value');
            promises.push(ref.then((snapshot) => {
                if (snapshot.exists()) {
                    const jug = snapshot.val();
                    modoCont[jug.modo] += 1;
                    temaCont[jug.tematica] += 1;
                    imaCont[jug.cantImagen] += 1;
                } 
                else {
                    console.log('No se encontraron los datos del jugador');
                }
            }).catch((error) => {
                console.error('Error al obtener información del jugador:', error);
                reject(error);
            }));
        });
        Promise.all(promises)
            .then(() => {
                resolve(); 
            })
            .catch((error) => {
                console.error('Error en alguna de las operaciones:', error);
                reject(error);
            });
    });
}

function preparar(){
    if(host==playerId) server.ref(`estado/${salaId}/disponible`).set('false');
    partidaIniciada = true;
    modoCont.fill(0);
    temaCont.fill(0);
    imaCont.fill(0);
    eleccion().then(()=>{
        res=[0, 0, 0];
        var j;
        for(j=0; j<modoCont.length; j++) if(modoCont[j]>modoCont[res[0]]) res[0]=j;
        for(j=0; j<temaCont.length; j++) if(temaCont[j]>temaCont[res[1]]) res[1]=j;
        for(j=0; j<imaCont.length; j++) if(imaCont[j]>imaCont[res[2]]) res[2]=j;
        mazoId= parseInt((res[1]+1).toString()+(cantImag[res[2]]-1).toString());
        jug.cantImagen=cantImag[res[2]];
        jug.tematica=res[1]+1;
        jug.modo=res[0];
        prepararModo(res[0]);
    });
}

function DIOS(){
    if(cantPlayers<2){
        alert('Se necesitan minimo dos jugadores');
        return;
    }
    app.pasar('carga_pagina');
    server.ref(`listos/${salaId}/${playerId}`).set(playerId);
    server.ref(`listos/${salaId}/${playerId}`).onDisconnect().remove();
    playerRef.update({
        modo: jug.modo,
        tematica: jug.tematica, 
        cantImagen: jug.cantImagen
    });
}

function elegirOrden(num){
    jug.cantImagen=num;
    console.log(num);
}

function elegirTematica(tem){
    jug.tematica=tem;
    console.log(tem);
}

function elegirModo(md){
    jug.modo=md;
    app.pasar('tematica_pagina');
}

function connectUser(numero){
    playerRef = server.ref(`player/${playerId}`);
    host=playerId;
    info.set(playerId, {
        id: playerId,
        num: numero, 
        name: document.getElementById('floatingInput').value,
        salaId: salaId,
        modo: 0,
        tematica: 0,
        cantImagen: 0,
        puntos: 0,
        listo: false
    });
    jug=info.get(playerId);
    playerRef.set(jug);
    playerRef.onDisconnect().remove();
}

async function puedoAgarrar(id){
    try{
        const transRes= await server.ref(`colores/${salaId}/${id}`).transaction((val)=>{
            band=false;
            if(val == false){
                val=true;
                band=true;
            }
            return val;
        });
        if(!transRes.committed){
            throw 'puedoAgarrar no commited'
        }
        console.log('Puedo agarrar: ', band);
        if(band) return setSala(id);
        else return buscarNum();
    }
    catch(error){
        console.log('Error en PuedoAgarrar', error);
    }
}

function buscarNum(){
    const query = server.ref(`colores/${salaId}`).orderByValue().equalTo(false).limitToFirst(1);
    query.once('value', function(snapshot) {
        if(snapshot.exists()){
            snapshot.forEach(function(child) {
                console.log('Color disponible:', child.key);
                puedoAgarrar(child.key);
            });
        } 
        else{
            console.log('No hay colores disponibles en la sala');
            alert((busco)?'Intente de nuevo':'Sala llena');
        }
    }, function(error){
        console.error('Error al buscar colores disponibles:', error);
        return;
    });
}

function meterJugador(sala){
    salaId=sala;
    buscarNum();
}

function setSala(numero){
    connectUser(numero);
    listos=0;
    server.ref(`colores/${salaId}/${numero}`).onDisconnect().set(false);
    server.ref(`sala/${salaId}/players/${playerId}`).set(playerId);
    server.ref(`sala/${salaId}/players/${playerId}`).onDisconnect().remove();
    app.pasar('modos_pagina');
    document.getElementById('c-nv').innerHTML = salaId;
    document.getElementById('h1-u').innerHTML = jug.name;
    document.getElementById('img-u').setAttribute('src', elementosLista[jug.num][0]);
    server.ref(`sala/${salaId}/players`).on('child_added', ingresaJugador);
    server.ref(`sala/${salaId}/players`).on('child_removed', saleJugador);
    //server.ref(`sala/${salaId}/listos/${playerId}`).onDisconnect().remove();
    server.ref(`listos/`+salaId).on('child_added', listoJugador);
}

function rollBack(){
    limp(2);
    limp(3);
    quitarZoom();
    cambiarMouse(0);
    document.querySelector('.wr').classList.remove('show');
    document.getElementById('start-btn').setAttribute('style','display:none');
    document.querySelectorAll('.circulo').forEach((element) => {
        element.innerHTML = '';
        element.setAttribute('hidden','true');
    });
    partidaIniciada = false;
    listos=0;
    if(cantPlayers != 6){
        server.ref(`estado/${salaId}/disponible`).set('true');
    }
    var ar=Array.from(info.keys());
    ar.forEach((llave)=>{
        console.log(llave);
        const j=info.get(llave);
        j.listo=false;
        j.puntos=0;
    });
    if(playerId==host) server.ref('listos/'+salaId).remove()
    app.pasar('modos_pagina');
}

function ingresar(){
    document.getElementById('boton-entrar').setAttribute('disabled','true');
    const inp = document.getElementById('floatingInput3');
    console.log(`Codigo ingresado: ${inp.value}`);
    server.ref(`estado/${inp.value}`).once("value")
    .then(function(snapshot) {
        if(snapshot.exists()){
            const s=snapshot.val();
            console.log('estado: ', s);
            if(s.disponible=='true'){
                //alert('Bien');
                meterJugador(inp.value);
            }
            else{
                alert('Sala llena o en Partida');
                inp.value = '';
                document.getElementById('boton-entrar').removeAttribute('disabled');
            }
        }
        else{
            alert('Codigo incorrecto');
            inp.value = '';
            document.getElementById('boton-entrar').removeAttribute('disabled');
        }
    })
    .catch(function(error) {
        console.error("Error al verificar la sala: ", error);
    });
}

function buscar(){
    const query = server.ref('estado').orderByChild('disponible').equalTo('true').limitToFirst(1);
    query.once('value', function(snapshot){
        if(snapshot.exists()){
            snapshot.forEach(function(child){
                meterJugador(child.key);
            });
        }
        else {
            alert('No hay salas disponibles. Crear una');
            document.querySelector('.cargando').classList.remove('show');
            document.getElementById('boton-buscar').removeAttribute('disabled');
        }
    })
}

function crear(){
    document.getElementById('boton-crear').setAttribute('disabled','true');
    const nombre = document.getElementById('floatingInput2').value;
    const refe = server.ref('sala').push();
    refe.set({
        name:nombre,
        turno : 0,
        ganador: 'null'
    })
    server.ref('colores/'+refe.key).set({
        0: false,
        1: false,
        2: false,
        3: false,
        4: false,
        5: false
    })
    server.ref(`estado/${refe.key}`).set({
        disponible: 'true'
    })
    meterJugador(refe.key);
}

(function () {

    firebase.auth().onAuthStateChanged((user) => {
        console.log(user)
        if (user) {
            playerId=user.uid;
            
        }
        else {   
        }
    })

    firebase.auth().signInAnonymously().catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
        console.log(errorCode, errorMessage);
    });

})();

function agregarElementoConImagen(i,nombre) {
    const contenedorPadre = document.getElementById('padre');
    const nuevoElemento = document.createElement('div');
    nuevoElemento.classList.add('col');
    nuevoElemento.classList.add('Player');
    const imagen = document.createElement('img');
    const texto = document.createElement('h1');
    texto.innerHTML = nombre;
    imagen.src = elementosLista[i][0];
    nuevoElemento.id = elementosLista[i][1];
    nuevoElemento.appendChild(imagen);
    nuevoElemento.appendChild(texto);
    contenedorPadre.appendChild(nuevoElemento);
}

function eliminarDivHijo(i) {
    let contenedorPadre = document.getElementById('padre');
    let divHijo = document.getElementById(elementosLista[i][1]);
    if (divHijo) contenedorPadre.removeChild(divHijo);
}

//-----------------------------------------------------MODOS-JUEGO-------------------------------------------------------- 
let mazoJuego;
let click = [];
let antGanador,turnoLocal;
let pasarTurno;
let contador;
let punos;
let pichudo;
let centro;

const winner = {
    tripleta: function(snapshot){
        const nam = snapshot.val();
        if(nam!='null'){
            const gan=info.get(nam);
            gan.puntos+=1;
            if(nam==playerId) server.ref('sala/'+salaId+'/ganador').set('null');
            if(antGanador!=null){
                document.getElementById(elementosLista[antGanador.num][1]).classList.remove('winner');
            }
            antGanador=gan;
            document.getElementById(elementosLista[gan.num][1]).classList.add('winner');
            pasarTurno();
        }
    },
   
    papaCaliente: async function(snapshot) {
        const nam=snapshot.val();
        if(nam!='null'){
            const j=info.get(nam);
            await mnsGan('Jugada de ', j.name, 1000);
            contador++;
            if(nam == playerId)server.ref(`sala/${salaId}/ganador`).set('null');
            turnoLocal++;
            server.ref(`cartas/${salaId}/mazoJuego`).once('value').then((snapshot)=>{
                const cartasEliminar = snapshot.val();
                let laPone = document.querySelector(`.${cartasEliminar[0]}`);
                let seLaPonen = document.querySelector(`.${cartasEliminar[1]}`);
                let idAux = +laPone.lastElementChild.textContent;
                antGanador = cartasEliminar[1];
                limpiarCarta(laPone.id);
                limpiarCarta(seLaPonen.id);
                limp(2);
                laPone.style.background = `center / contain no-repeat url(imagenes/${mazos.get(mazoId).rutaReverso})`;
                crearCarta(seLaPonen.id,idAux);
                progBtn(2);
                if(contador>=cantPlayers-1){
                    pasarTurno();
                }
            }).catch((error)=>{
                console.log('Error obtener cartas eliminar',error);
            });
        }
    },

    torre: function(snapshot) {
        const nam=snapshot.val();
        if(nam=='null') return;
        const gan=info.get(nam);
        if(nam==playerId) server.ref(`sala/${salaId}/ganador`).set('null');
        gan.puntos+=1;
        if(antGanador!=null){
            document.getElementById(elementosLista[antGanador.num][1]).classList.remove('winner');
        }
        antGanador=gan;
        document.getElementById(elementosLista[gan.num][1]).classList.add('winner');
        pasarTurno();
    },
    
    regaloEnvenenado: function(snapshot) {
        const nam=snapshot.val();
        if(nam=='null') return;
        const gan=info.get(nam);
        if(nam==playerId) server.ref(`sala/${salaId}/ganador`).set('null');
        if(antGanador!=null){
            document.getElementById(elementosLista[antGanador.num][1]).classList.remove('winner');
        }
        antGanador=gan;
        document.getElementById(elementosLista[gan.num][1]).classList.add('winner');
        pasarTurno(); 
    },
    
    pozo: function(snapshot) {
        const nam=snapshot.val();
        if(nam=='null') return;
        const gan=info.get(nam);
        if(nam==playerId) server.ref('sala/'+salaId+'/ganador').set('null');
        if(antGanador!=null){
            document.getElementById(elementosLista[antGanador.num][1]).classList.remove('winner');
        }
        gan.puntos++;
        antGanador=gan;
        document.getElementById(elementosLista[gan.num][1]).classList.add('winner');
        pasarTurno();
    }  
    
};

const turno = {
    tripleta: async function(){
        await mnsGan('Gana: ',antGanador.name,2000);
        limpiarClick();
        if(mazoJuego.length<3){
            await mostrarGanador();
            server.ref('sala/'+salaId+'/ganador').off('value', winner.tripleta);
            document.getElementById(elementosLista[antGanador.num][1]).classList.remove('winner');
            rollBack();
        }
        else{
            turnoLocal++;
            rellenarMesaTripleta();
        }
    },
    
    papaCaliente: async function() {
        const j=info.get(antGanador);
        await mnsGan('Pierde ', j.name, 1000);
        j.puntos-=1;
        contador=0;
        limpiarClick();
        if(mazoJuego.length < arrJug.length){
            await mostrarGanador();
            server.ref('sala/'+salaId+'/ganador').off('value', winner.papaCaliente);
            for(let i=0; i<6; i++){
                cJ = document.getElementById(`pc${i}`);
                if(cJ.classList.length > 1)cJ.classList.remove(cJ.classList[1]);
            }
            rollBack();
        }
        else{
            await cuentaRegresiva();
            repartirCartas('pc');
            limp(2);
            progBtn(2);
        }
    },

    torre: async function() {
        await mnsGan('Gana: ',antGanador.name,2000);
        limpiarClick();
        if(mazoJuego.length<1){
            await mostrarGanador();
            server.ref('sala/'+salaId+'/ganador').off('value', winner.torre);
            document.getElementById(elementosLista[antGanador.num][1]).classList.remove('winner');
            for(let i=0; i<6; i++){
                cJ = document.getElementById(`tr${i}`);
                if(cJ.classList.length > 1) cJ.classList.remove(cJ.classList[1]);
            }
            rollBack();
        }
        else{
            turnoLocal++;
            server.ref(`cartas/${salaId}/mazoJuego`).once('value').then((snapshot)=>{
                const cartasEliminar = snapshot.val();
                let laAgarra = document.querySelector(`.${cartasEliminar[0]}`);
                let t577 = document.getElementById('trCentro');
                let idAux = +t577.lastElementChild.textContent;
                limpiarCarta(laAgarra.id);
                limpiarCarta('trCentro');
                crearCarta(laAgarra.id,idAux);
                crearCarta('trCentro', mazoJuego.pop()); 
                limp(2);
                progBtn(2);
            }).catch((error)=>{
                console.log('Error obtener cartas eliminar',error);
            });
        }
    },

    regaloEnvenenado: async function() {
        var id;
        await server.ref(`cartas/${salaId}/mazoJuego`).once('value').then((snapshot)=>{
            const cartasEliminar = snapshot.val();
            id = cartasEliminar[0];
        }).catch((error)=>{
            console.log('Error obtener cartas eliminar',error);
        });
        const perd=info.get(id);
        perd.puntos-=1;
        await mnsGan('Pierde: ',perd.name,2000);
        limpiarClick();
        if(mazoJuego.length<1){
            await mostrarGanador();
            server.ref('sala/'+salaId+'/ganador').off('value', winner.regaloEnvenenado);
            document.getElementById(elementosLista[antGanador.num][1]).classList.remove('winner');
            for(let i=0; i<6; i++){
                cJ = document.getElementById(`rv${i}`);
                if(cJ.classList.length > 1)cJ.classList.remove(cJ.classList[1]);
            }
            rollBack();
        }
        else{
            turnoLocal++;
            let laAgarra = document.querySelector(`.${id}`);
            let t577 = document.getElementById('rvCentro');
            let idAux = +t577.lastElementChild.textContent;
            limpiarCarta(laAgarra.id);
            limpiarCarta('rvCentro');
            crearCarta(laAgarra.id,idAux);
            crearCarta('rvCentro', mazoJuego.pop()); 
            limp(2);
            progBtn(2);
        }
    },
    
    pozo: async function() {
        await mnsGan('Gana: ',antGanador.name,2000);
        limpiarClick();
        turnoLocal++;
        let id;
        await server.ref(`cartas/${salaId}/mazoJuego`).once('value').then((snapshot)=>{
            id=snapshot.val()[0];
        });
        let laAgarra = document.querySelector(`.${id}`);
        let idAux = +laAgarra.lastElementChild.textContent;
        limpiarCarta('pzCentro');
        limpiarCarta(laAgarra.id);
        if(punos.get(id).length == 0){
            if(pichudo == null) pichudo = id;
            laAgarra.style.background = `center / contain no-repeat url(imagenes/${mazos.get(mazoId).rutaReverso})`;
            contador++;
        }
        else crearCarta(laAgarra.id, punos.get(id).pop());
        crearCarta('pzCentro',idAux);
        limp(2); 
        progBtn(2);
        if(contador >= cantPlayers-1){
            await mnsGan('Ganador: ',info.get(pichudo).name,2000);
            server.ref(`sala/${salaId}/ganador`).off('value', winner.pozo);
            document.getElementById(elementosLista[antGanador.num][1]).classList.remove('winner');
            for(let i=0; i<6; i++){
                cJ = document.getElementById(`pz${i}`);
                if(cJ.classList.length > 1)cJ.classList.remove(cJ.classList[1]);
            }
            rollBack();
        }
    }
};

const prep = {
    tripleta: async function(){
        console.log('Entra Tripleta!');
        jug.puntos=0;
        server.ref(`sala/${salaId}/ganador`).on('value', winner.tripleta);
        for (let p = 0; p < jug.cantImagen + 1; p++) document.getElementById(`tp${p}`).removeAttribute('hidden');
        voltearCarta('tp');
        app.pasar('tripleta_pagina'); 
        ponerZoom();
        await mnsGan('Modo: ','Tripleta',2000);
        await cuentaRegresiva();
        iniciarMesaTripleta();
    },
    papaCaliente: async function(){
        console.log('Papa Caliente!');
        jug.puntos=0;
        server.ref('sala/'+salaId+'/ganador').on('value', winner.papaCaliente);
        arrJug.sort();
        contador=0;
        asignarJugadores('pc');
        voltearCarta('pc');
        app.pasar('papa_caliente_pagina');
        ponerZoom();
        await mnsGan('Modo: ','Papa Caliente',2000);
        await cuentaRegresiva();
        repartirCartas('pc');
    },
    torre: async function() {
        console.log('Entra Torre!');
        jug.puntos=0;
        server.ref('sala/'+salaId+'/ganador').on('value', winner.torre);
        arrJug.sort();
        asignarJugadores('tr');
        voltearCarta('tr');
        app.pasar('torre_pagina');
        document.getElementById('trCentro').removeAttribute('hidden');
        ponerZoom();
        await mnsGan('Modo: ','Torre',2000);
        await cuentaRegresiva();
        crearCarta('trCentro',mazoJuego.pop());
        repartirCartas('tr');
    },
    regaloEnvenenado: async function() {
        console.log('Entra Regalo Envenenado!');
        jug.puntos=0;
        server.ref('sala/'+salaId+'/ganador').on('value', winner.regaloEnvenenado);
        arrJug.sort();
        asignarJugadores('rv');
        voltearCarta('rv');
        app.pasar('regalo_envenenado_pagina');
        document.getElementById('rvCentro').removeAttribute('hidden');
        ponerZoom();
        await mnsGan('Modo: ','Regalo Envenenado',2000);
        await cuentaRegresiva();
        crearCarta('rvCentro',mazoJuego.pop());
        repartirCartas('rv');
    },
    pozo: async function(){
        jug.puntos=0;
        server.ref('sala/'+salaId+'/ganador').on('value', winner.pozo);
        arrJug.sort();
        contador=0;
        pichudo=null;
        asignarJugadores('pz');
        voltearCarta('pz');
        app.pasar('pozo_pagina');
        document.getElementById('pzCentro').removeAttribute('hidden');
        ponerZoom();
        await mnsGan('Modo: ','Pozo',2000);
        await cuentaRegresiva();
        hacerPunos();
    }
};

async function prepararModo(mod){
    if(host == playerId){
        server.ref('cartas/'+salaId+'/mazo').remove();
        server.ref('sala/'+salaId).update({ganador: 'null', turno: 0});
    }
    else await esperar(()=>{console.log('Esperando...')}, 250);
    turnoLocal=0;
    antGanador = null;
    if(mod==0){
        pasarTurno=turno.tripleta;
        iniciarMazo(prep.tripleta);
    }
    else if(mod==1){
        pasarTurno=turno.papaCaliente;
        iniciarMazo(prep.papaCaliente);
    }
    else if(mod==2){
        pasarTurno = turno.torre;
        centro = 'trCentro';
        iniciarMazo(prep.torre);
    }
    else if(mod==3){
        pasarTurno = turno.regaloEnvenenado;
        iniciarMazo(prep.regaloEnvenenado);
    }
    else{
        pasarTurno=turno.pozo;
        centro = 'pzCentro';
        iniciarMazo(prep.pozo);
    }
}

function getRandom(min, max){return Math.floor(Math.random()*(max-min))+min;}

function permutar(todasCartas){
    let arCartas = todasCartas;
    for(var i=0; i<arCartas.length; i++){
        const a=getRandom(i, arCartas.length);
        const aux=arCartas[i];
        arCartas[i]=arCartas[a];
        arCartas[a]=aux;
    }
    return arCartas;
}

function iniciarMazo(fun){
    if(host == playerId){
        console.log('Me toco permutar!');
        mazoJuego=permutar(mazos.get(mazoId).cartas);
        server.ref('cartas/'+salaId+'/mazo').set(mazoJuego);
    }
    obtenerMazoLocal(fun);
}

function obtenerMazoLocal(fun){
    server.ref(`cartas/${salaId}/mazo`).once('value').then((snapshot)=> {
        if(snapshot.exists()){
            mazoJuego = snapshot.val();
            console.log('mazo obtenido', mazoJuego);
            return fun();
        }
        setTimeout(obtenerMazoLocal(), 500);
    }).catch((error)=>{
        console.log('Error al obtener el mazo', error);       
    });
}

async function intento(cartasEliminar){
    try{
        const transResult= await server.ref(`sala/${salaId}/turno`).transaction((turn)=>{
            console.log('intentando intento');
            console.log('Mi turno: ', turnoLocal, 'El turno: ', turn);
            band=false;
            if(turn==turnoLocal){
                turn+=1;
                band = true;
            }
            return turn;
        });
        if(!transResult.committed){
            throw 'Intento no commited';
        }
        if(band==true){
            console.log('Fui el primer intento!');
           server.ref(`cartas/${salaId}/mazoJuego`).set(cartasEliminar);
           server.ref(`sala/${salaId}`+'/ganador').set(playerId);
        }
        return console.log('Intento bien!'); //return print
    }
    catch(error){
        console.log('Error intento ', error);
    }
}

function verificarIguales(saux,mod) {
    if(saux.src == click[click.length-1].src) {
        if (saux.id == click[click.length-1].id) {
                saux.style.borderColor = '';
                click.pop();
                return;
        }
        if (mod===3 && click.length === 1) {
            click.push(saux);
            return;
        }
        
        if(saux.id != click[0].id) {
            click.push(saux);
            var val1 = document.getElementById(click[0].id).classList[1];
            var val2 = document.getElementById(click[1].id).classList[1];
            let cartasEliminar = [];
            if((jug.modo == 2 || jug.modo == 4) && ((val1 != playerId && val2 != playerId) || (click[0].id != centro && click[1].id != centro))){
                alert('no presione mi carta o no presione una carta del centro');
                return limpiarClick();
            }
            if((jug.modo == 1) && (val1 != playerId && val2 != playerId)){
                alert('no presione mi carta');
                return limpiarClick();
            }
            if((jug.modo == 3) && ((click[0].id != 'rvCentro' && click[1].id != 'rvCentro') || (val1 == playerId || val2 == playerId))){
                alert('no presione la carta de un rival o  no presione una carta del centro');
                return limpiarClick();
            }
            console.log('Val1: ', val1, ' Val2: ', val2);
            switch (jug.modo){
                case 0:
                    for(let i = 0; i < mod; i++) cartasEliminar.push(click[i].id);
                    break;
                case 1:
                    if(playerId == val1){ 
                        cartasEliminar.push(val1);
                        cartasEliminar.push(val2);
                    }
                    else{
                        cartasEliminar.push(val2);
                        cartasEliminar.push(val1);
                    }
                    break;
                case 2:
                    if(playerId == val1){
                        cartasEliminar.push(val1);
                    }
                    else{
                        cartasEliminar.push(val2);
                    }
                    break;
                case 3:
                    if(val2 == null){
                        cartasEliminar.push(val1);
                    }
                    else{
                        cartasEliminar.push(val2);
                    }
                    break;
                case 4:
                    console.log('Val1:',val1,' Val2: ',val2);
                    if(playerId == val1){
                        cartasEliminar.push(val1);
                    }
                    else{
                        cartasEliminar.push(val2);
                    }
                    break;
                default:
                    console.log('error en el switch');
            }    
            console.log(cartasEliminar);
            limpiarClick();
            intento(cartasEliminar);
        }
    }
    else {
        click.push(saux);
        alert('No son iguales, intentalo de nuevo');
        limpiarClick();
    }
}

function validarFigueres(saux,mod){
    if(click.length === 0) {
        click.push(saux);
        return;
    }
    verificarIguales(saux,mod) 
}

function limpiarClick() {
    click.forEach((e) => e.style.borderColor = '');
    click = [];
}

function limpiarCarta(id) {
    document.getElementById(id).innerHTML = '';
}

function limpiarFondo(mod) {
    let n;
    (mod=='tp')?n=(jug.cantImagen+1):n=arrJug.length;
    for(let i=0; i<n; i++){
        let t67 = document.getElementById(`${mod+i}`);
        t67.style.background = '';
    }
}

function voltearCarta(mod) {
    let n;
    (mod=='tp')?n=(jug.cantImagen+1):n=arrJug.length;
    for(let i=0; i<n; i++) {
        let t67 = document.getElementById(`${mod+i}`);
        t67.style.background = `center / contain no-repeat url(imagenes/${mazos.get(mazoId).rutaReverso})`;
    }
}

let insertarImagen = (id1,ruta,d1,d2,x,y,fs,fr) => {
    let carta =  document.getElementById(id1);
    let contenedor = document.createElement('div');
    contenedor.style.position = 'absolute';
    contenedor.style.transform = `translate(${x}px, ${y}px)`;

    carta.appendChild(contenedor);

    let imagen = document.createElement('img');
    imagen.src = ruta;
    imagen.style.width = `${~~(d1/9.5)}px`;
    imagen.style.height = `${~~(d2/9.5)}px`;
    imagen.style.transform = `scale(${fs})  rotate(${fr}deg)`;
    imagen.style.transformOrigin = '0 0';
    imagen.classList.add('btn');
    imagen.classList.add('cp');
    imagen.id = id1;
    
    contenedor.appendChild(imagen);
};

let crearCarta = (cId,id) => {
    cc = carta.get(id);
    for(let i in cc)
        insertarImagen(cId,`imagenes/${cc[i].ruta}`, cc[i].ancho, cc[i].alto, cc[i].x, cc[i].y, cc[i].factScale, cc[i].factRotate,id);
    let cont = document.getElementById(cId)
    let cid = document.createElement('a');
    cid.textContent=id;
    cid.setAttribute('hidden','true');
    cont.appendChild(cid);
};

function asignarJugadores(modo) {
    for(let i in arrJug){
        console.log(modo+i);
        const j = info.get(arrJug[i]);
        console.log(j);
        cJ = document.getElementById(`${modo+i}`);
        cJ.removeAttribute('hidden');
        cJ.style.border = `8px solid ${elementosLista[j.num][1]}`;
        cJ.classList.add(`${j.id}`);
    }
}

async function mostrarGanador(){
    let win = arrJug[0], aux = null;
    arrJug.forEach((keys)=>{
        console.log(info.get(win).puntos,' vs ', info.get(keys).puntos);
        if(keys != arrJug[0] && info.get(win).puntos == info.get(keys).puntos){
            console.log('IGual');
            aux = keys;
        }
        if(info.get(win).puntos < info.get(keys).puntos) {
            console.log('Menor');
            win = keys;
            aux = null;
        }
    });
    if(aux == null) await mnsGan('Ganador: ',info.get(win).name,2000);
    else await mnsGan('Ganador: ','Empate',2000);
}

function esperar(funcion,ms){
    return new Promise((resolve) => {
        setTimeout(()=>{
            funcion();
            resolve();
        }, ms);
    });
}

let progBtn = (mod) => {
    document.querySelectorAll('.btn').forEach(i => {
        i.addEventListener("click", (mod==3)?handleClickT:handleClickM);
    });
    cambiarMouse(jug.tematica);
};

let limp = (mod) => {
    document.querySelectorAll('.btn').forEach(i=>{
        i.removeEventListener('click',(mod==3)?handleClickT:handleClickM);
        i.style.borderColor = '';
    });
    click = [];
}

async function mnsGan(mns,name,s) {
    document.getElementById('ganador').innerHTML += mns + "\n" + name;
    document.getElementById('pntGan').removeAttribute('hidden');
    let q = () => {
        document.getElementById('ganador').innerHTML = '';
        document.getElementById('pntGan').setAttribute('hidden','true');
    };
    await esperar(q,s);
}

let handleClickT = (event) => {
    event.target.style.borderColor = 'greenyellow';
    validarFigueres(event.target,3);
};

let handleClickM = (event) => {
    event.target.style.borderColor = 'greenyellow';
    validarFigueres(event.target,2);
};

function cambiarMouse(modo) {
    document.querySelector('body').className = '';
    let allPnt = document.querySelectorAll('.cp');
    if(modo==0) {
        document.querySelector('body').classList.add('cursor-Default');
        if(allPnt) allPnt.forEach((e) => e.classList.add('cb'));
        return;
    }
    if(modo==1) {
        document.querySelector('body').classList.add('cursor-Avatar');
        allPnt.forEach((e) => {
            e.classList.remove('cb');
            e.style.webkitAnimation = '750ms linear infinite normal cursor-animation-Avatar';
            e.style.mozAnimation = '750ms linear infinite normal cursor-animation-Avatar';
            e.style.oAnimation = '750ms linear infinite normal cursor-animation-Avatar';
            e.style.animation = '750ms linear infinite normal cursor-animation-Avatar';
        });
        return;
    }
    if (modo==2) {
        document.querySelector('body').classList.add('cursor-GoT');
        allPnt.forEach((e) => {
            e.classList.remove('cb');
            e.style.webkitAnimation = '800ms linear infinite alternate cursor-animation-GoT'
            e.style.mozAnimation = '800ms linear infinite alternate cursor-animation-GoT';
            e.style.oAnimation = '800ms linear infinite alternate cursor-animation-GoT';
            e.style.animation = '800ms linear infinite alternate cursor-animation-GoT';
        });
        return;
    }
    else {
        document.querySelector('body').classList.add('cursor-Brands');
        allPnt.forEach((e) => {
            e.classList.remove('cb');
            e.style.webkitAnimation = '600ms linear infinite alternate cursor-animation-Brands';
            e.style.mozAnimation = '600ms linear infinite alternate cursor-animation-Brans';
            e.style.oAnimation = '600ms linear infinite alternate cursor-animation-Brands';
            e.style.animation = '600ms linear infinite alternate cursor-animation-Brands';
        });
        return;
    }
}

async function cuentaRegresiva() {
    document.getElementById('sonido').play();
    for (let i=3; i; i--) await mnsGan(` ${i}`,' ',1000);
}

function repartirCartas(mod){
    limpiarFondo(mod);
    for(var i = 0; i < arrJug.length; i++){
        limpiarCarta(`${mod+i}`);
        crearCarta(`${mod+i}`,mazoJuego.pop());
    }
    limp(2);
    progBtn(2);
}

//----------------------------------------------------Tripleta-------------------------------------------------------------
function iniciarMesaTripleta(){
    limpiarFondo('tp');
    console.log('ArregloIniciar', mazoJuego);
    for(var i = 0; i < jug.cantImagen+1; i++) {
        console.log('Tenemos i ' + i + ' Carta: '+mazoJuego[mazoJuego.length-1]);
        crearCarta(`tp${i}`, mazoJuego.pop());
    }
    progBtn(3);
}

function rellenarMesaTripleta(){
    server.ref(`cartas/${salaId}/mazoJuego`).once('value').then((snapshot)=>{
        const cartasEliminar=snapshot.val();
        for(var i = 0; i < 3; i++){
            limpiarCarta(cartasEliminar[i]);
            crearCarta(cartasEliminar[i],mazoJuego.pop());
        }
        limp(3);
        progBtn(3);
    }).catch((error)=>{
        console.log('Error al rellenar mesa',error);
    });
}
//--------------------------------------------------Papa Caliente-----------------------------------------------------------
//-------------------------------------------------------Torre---------------------------------------------------------------
//-----------------------------------------------Regalo Envenenado-----------------------------------------------------------
//------------------------------------------------------Pozo-----------------------------------------------------------------
function hacerPunos(){
    limpiarFondo('pz');
    punos=new Map();
    let tam=~~((mazoJuego.length-1)/cantPlayers);
    console.log('tamano',tam);
    crearCarta('pzCentro',mazoJuego.pop());
    for(let i = 0; i < arrJug.length; i++){
        let pp=[];
        crearCarta(`pz${i}`, mazoJuego.pop());
        for(let j = 0; j < tam-1; j++) pp.push(mazoJuego.pop());
        punos.set(arrJug[i], pp);
        console.log('pp:',pp);
    }
    console.log('punos:',punos);
    progBtn(2);
}