const firebaseConfig = {
    apiKey: "AIzaSyCHcXSaQdj3g3uM0Nq8l5j_BfmfH6sgbvo",
    authDomain: "spot-it-4a5cf.firebaseapp.com",
    databaseURL: "https://spot-it-4a5cf-default-rtdb.firebaseio.com",
    projectId: "spot-it-4a5cf",
    storageBucket: "spot-it-4a5cf.appspot.com",
    messagingSenderId: "558119096036",
    appId: "1:558119096036:web:e6caba5e945040100826f1"
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);

/*
Modelo del servidor
/player
    /id
        id:
        name:
        sala_id:
        puntos:
        cartas:[num_carta]

/sala
    /id
        id:
        name:
        modo_juego:
        tematica:
        orden:
        players:[player_id]

/estado
    /sala_id
        disponible: true/false

*/