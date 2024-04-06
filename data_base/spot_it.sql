/*------Borrar tablas ignorando fk------*/

SET session_replication_role = replica;

DROP TABLE IF EXISTS Carta_Imagen;
DROP TABLE IF EXISTS Carta;
DROP TABLE IF EXISTS Imagen;
DROP TABLE IF EXISTS Mazo;

SET session_replication_role = DEFAULT;

/*--------------------------------------*/

create table Mazo(
	tematica_orden int primary key,
	orden int,
	tematica varchar(100),
	ruta varchar(100)
);

create table Imagen(
  	imagen_id int primary key,
    ruta varchar(100),
    ancho int,
    alto int
);

create table Carta(
  	carta_id int primary key,
    mazo_id int,
    foreign key (mazo_id) references Mazo
);

create table Carta_Imagen(
  	carta_id int,
    imagen_id int,  
    factScale real,
    factRotate real,
    x real,
    y real,
    foreign key (carta_id) references Carta,
    foreign key (imagen_id) references Imagen
);

/*-------Meter info a las tablas----------*/

\COPY Imagen(imagen_id, ruta, ancho, alto) FROM 'imagenes.csv' DELIMITER ',' CSV;
\COPY Mazo(tematica_orden, orden, tematica, ruta) FROM 'mazo.csv' DELIMITER ',' CSV;
\COPY Carta(carta_id, mazo_id) FROM 'carta.csv' DELIMITER ',' CSV;
\COPY Carta_Imagen(carta_id, imagen_id, factScale, factRotate, x, y) FROM 'carta_imagen.csv' DELIMITER ',' CSV;

/*---------------------------------------*/