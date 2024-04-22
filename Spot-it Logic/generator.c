//#include <bits/stdc++.h> :( 
#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <string.h>
#include <math.h>
#include <fcntl.h>
#include <unistd.h>

#define max(a, b) ((a > b) ? (a) : (b))
#define min(a, b) ((a < b) ? (a) : (b))
#define PI 3.14159265358979323846264338327950288

typedef struct Pair {
    double first;
    double second;
} Pair;

typedef struct Imagen {
   char ruta[100];
   int id;
   int height;
   int width; 
} Imagen;

typedef struct Figura{ // en la carta :)
    int imagen;
    Pair** puntos;
    double factScale;
	double factRotate;
} Figura;

typedef struct Carta {
    Figura* fig;
    struct Carta *next;
}Carta;

//----------------------------------------------------------------------------------

Pair* ejes[6];

Pair* punto(double x1, double y1) {
	Pair* temp = (Pair*)malloc(sizeof(Pair));
	temp->first = x1;
	temp->second = y1;
	return temp;
}
double producto_punto(Pair *punt, Pair* eje) { // para intersecc
    return (punt->first * eje->first + punt->second * eje->second);
}

double maxP(double prod_pts[4]){// para intersecc
    return max(max(prod_pts[0], prod_pts[1]),max(prod_pts[2], prod_pts[3]));
}

double minP(double prod_pts[4]){// para intersecc
    return min(min(prod_pts[0], prod_pts[1]),min(prod_pts[2], prod_pts[3]));
}

double interseccion(Pair *r1, Pair* r2) {// para intersecc
    return max(0, min(r1->second, r2->second) - max(r1->first, r2->first));
}

void normalizacion(Figura* img, int eje, int res) {// para intersecc
    double resTemp[4];
    for(int i=0; i<4; i++) resTemp[i] = producto_punto(img->puntos[i],ejes[eje]);
    ejes[res]->first = minP(resTemp);
    ejes[res]->second = maxP(resTemp);
}

short rotatingCallipers(Figura* f1, Figura* f2) {
    for(int i=0; i < 2; i++){
        ejes[i]->first=-1*(f1->puntos[i]->second-f1->puntos[i+1]->second);
        ejes[i]->second = (f1->puntos[i]->first - f1->puntos[i+1]->first);
        ejes[i+2]->first=-1*(f2->puntos[i]->second-f2->puntos[i+1]->second);
        ejes[i+2]->second = (f2->puntos[i]->first - f2->puntos[i+1]->first);
    }
    for(int i=0; i<4; i++) {
        normalizacion(f1,i,4);
        normalizacion(f2,i,5);
        if(interseccion(ejes[4],ejes[5])==0) return 0;
    }
    return 1;
}

//---------------------------------------------------------------------

Figura* ConsFig(int img){
    Figura *nueva = (Figura*)malloc(sizeof(Figura));
    nueva->imagen = img;
    nueva->factRotate = 0;
    nueva->factScale = 1;
    nueva->puntos = (Pair**)(malloc(sizeof(Pair*)*4));
    for(int i=0; i<4; i++) nueva->puntos[i]=(Pair*)malloc(sizeof(Pair));
    return nueva;
}


void pushFig(Figura* _fig, Carta **first) {
    Carta *_next = (Carta *)malloc(sizeof(Carta));
    _next->fig = _fig;
    _next->next = *first;
    *first = _next;
}

const int diametro=541;
const double radio=270.5;
const double cuadRadio=radio*radio;

int ind[2][9]={{0,1,6,8,18},{0,1,3,7,15,31,36,54,63}};
Carta* mazo[73];
Imagen foto[3][73];
int tipoActual=0;
int cantCartas;
int aum = 4;
int carta;

char infoMazo[100]="C:/Users/byluc/Desktop/Stop_it/data_base/mazo.csv";
char infoCarta[100]="C:/Users/byluc/Desktop/Stop_it/data_base/carta.csv";
char infoCarta_Imagen[100]="C:/Users/byluc/Desktop/Stop_it/data_base/carta_imagen.csv";

int getWidth(int tipo, int imagen){
    return (foto[tipo][imagen].width/9.5);
}

int getHeight(int tipo, int imagen) {
    return (foto[tipo][imagen].height/9.5);
}

char* getRuta(int tipo, int imagen){
    return foto[tipo][imagen].ruta;
}

void imagenFinal(Figura* img){ 
	double x=img->puntos[0]->first, y=img->puntos[0]->second; 
	img->puntos[1]->first = x;
    img->puntos[1]->second=(y+getHeight(tipoActual, img->imagen)*img->factScale)+aum;
	img->puntos[2]->first =(x+getWidth(tipoActual, img->imagen)*img->factScale)+aum ;
    img->puntos[2]->second=(y+getHeight(tipoActual, img->imagen)*img->factScale)+aum;
	img->puntos[3]->first=(x+getWidth(tipoActual, img->imagen)*img->factScale)+aum;
    img->puntos[3]->second=y;
}


//------------------------------------------------------------------------
   
void crearArchivos(){
    int archivo;
    archivo = open(infoMazo, O_WRONLY | O_CREAT | O_TRUNC, 0644);
    if (archivo == -1) {
        printf("No se pudo crear el archivo.\n");
    }
    close(archivo);
    archivo = open(infoCarta, O_WRONLY | O_CREAT | O_TRUNC, 0644);
    if (archivo == -1) {
        printf("No se pudo crear el archivo.\n");
    }
    close(archivo);
    archivo = open(infoCarta_Imagen, O_WRONLY | O_CREAT | O_TRUNC, 0644);
    if (archivo == -1) {
        printf("No se pudo crear el archivo.\n");
    }
    close(archivo);
}

void imprimirMazo(){
    FILE* archivo;
    archivo = fopen(infoMazo,"w");
    char temas[3][10] = {"avatar","got","brands"};
    char backIm[3][100]={"avatar/backAvatar.png", "got/backGot.png", "brands/backBrands.png"};
    for(int i = 1; i<=3;i++){
        for(int j = 3; j < 9;j+=(1+(j==5))){   
            fprintf(archivo,"%d%d,%d,'%s','%s'\n",i,j,j,temas[i-1],backIm[i-1]);
        }
    }
    fclose(archivo);
}

FILE* arCarta;
FILE* arCarta_Imagen;
void abrirArchivos(){
    arCarta = fopen(infoCarta,"w");
    arCarta_Imagen = fopen(infoCarta_Imagen,"w");
}

void cerrarArchivos(){
    fclose(arCarta);
    fclose(arCarta_Imagen);
}

void imprimirInfoC(int orden){
    for(int i = 0; i < cantCartas; i++){
        fprintf(arCarta,"%d%d%d,%d%d\n",tipoActual+1,orden,i+1,tipoActual+1,orden);
    }
}

void imprimirFigCar(int orden, int num, Figura* fig){
    fprintf(arCarta_Imagen, "%d%d%d,%d%d,%f,%f,%f,%f\n", 
    tipoActual+1, orden, num+1, tipoActual+1, foto[tipoActual][fig->imagen].id+1, fig->factScale,
    fig->factRotate, fig->puntos[0]->first, fig->puntos[0]->second);
}

//--------------------------------------------------------------------

void swapImagen(int tipo, int p, int k){
    Imagen aux=foto[tipo][p];
    foto[tipo][p]=foto[tipo][k];
    foto[tipo][k]=aux;
}

void permutar(int cant){
    int pos;
    for(int i=0; i<cant; i++){
        pos=rand()%(73-i)+i;
        swapImagen(0, i, pos);
        swapImagen(1, i, pos);
        swapImagen(2, i, pos);
    }
}

void metodoPrimo(int orden){
    int n=orden, carta=n*(n+1)+1;
    int mat[n][n];
    int extra[n+1]; 
    for(int i=0; i<carta; i++) mazo[i]=NULL;
    int aux=0, res;
    for(int i=0; i<n; i++){
        for(int j=0; j<n; j++) mat[i][j]=aux, aux++;
    }
    for(int i=0; i<=n; i++){
        extra[i]=aux;
        pushFig(ConsFig(aux), &mazo[0]);
        aux++;
    }  
    carta=1;
    for(res=0; res<n-1; res++){
        int j;
        for(int i=0; i<n; i++){
            j=i;
            for(int p=0; p<n; p++) pushFig(ConsFig(mat[p][j]), &mazo[carta]), j=(j+res+1)%n;
            pushFig(ConsFig(extra[res]), &mazo[carta]);
            carta++;
        }
    }
    for(int i=0; i<n; i++){
        for(int j=0; j<n; j++) pushFig(ConsFig(mat[j][i]), &mazo[carta]);
        pushFig(ConsFig(extra[res]), &mazo[carta]); 
        carta++;
        for(int j=0; j<n; j++) pushFig(ConsFig(mat[i][j]), &mazo[carta]);
        pushFig(ConsFig(extra[res+1]), &mazo[carta]); 
        carta++;
    }
}

void metodoNoPrimo(int n){
    int c=n*(n+1)+1;
    for(int i = 0; i < c;i++) mazo[i]=NULL;
    for(int i=0; i <c; i++){
        for(int j = 0; j<=n; j++) pushFig(ConsFig(i), &mazo[(ind[n==8][j]+i)%c]);
    }
    return;
}
//---------------------------------------------------------------------

void generarPuntos(Figura* img){
    int limRight=diametro-getWidth(tipoActual, img->imagen)-50+aum;
    double x = rand()%limRight+50;
    double y = rand()%diametro;
    while(cuadRadio <= ((y-radio)*(y-radio)+(x-radio)*(x-radio))) y = rand()%diametro;
    img->puntos[0]->first = x;
    img->puntos[0]->second = y;
}

void scale(Figura* img, double factScale) {
    double raiz = sqrt(factScale);
    img->factScale=raiz;
	imagenFinal(img);
}

void rotate(Figura* img, double factRotate) {
    double sinTheta = sin(factRotate * (PI / 180.0));
    double cosTheta = cos(factRotate * (PI / 180.0));
    for (int i = 1; i < 4; i++) {
        double x = img->puntos[i]->first - img->puntos[0]->first;
        double y = img->puntos[i]->second - img->puntos[0]->second;
        img->puntos[i]->first = x * cosTheta - y * sinTheta + img->puntos[0]->first;
        img->puntos[i]->second = y * cosTheta + x * sinTheta + img->puntos[0]->second;
    }
}

short verificarPuntos(Figura* img, Carta* carta) {
    Figura* pas;
    for(pas=carta->fig; img != pas; pas=carta->fig){ 
        carta=carta->next;   
        if(rotatingCallipers(img,pas)) return 0;
    }
    return 1;
}

short esValido(Figura* img) {
    for (int i = 1; i < 4; i++){
        if(cuadRadio <= ((img->puntos[i]->first-radio)*(img->puntos[i]->first-radio)+
        (img->puntos[i]->second-radio)*(img->puntos[i]->second-radio))) return 0;
    }
    return 1;
}

short probarRotar(Figura * fig){
    for(int i=5; i<=360; i+=5){
        rotate(fig,i);
        if(esValido(fig) && verificarPuntos(fig, mazo[carta])){
            fig->factRotate=i;
            return 1;
        }
        imagenFinal(fig);
    }
    return 0;
}

short bb(double inf, double sup, double e, Figura* fig){
    double med;
    while((inf+e) < sup){
        med = (inf+sup)/2;
        scale(fig, med);
        if(probarRotar(fig)) inf=med;
        else sup=med;
    }
    if(inf==1) return 0; 
    scale(fig, inf);
    rotate(fig, fig->factRotate);
    return 1;
}


void construir(){
    for(int i=8; i>2; i-=(1+(i==7))){
        cantCartas=i*(i+1)+1;
        permutar(cantCartas);
        if(i%2) metodoPrimo(i);
        else metodoNoPrimo(i);
        for(tipoActual=0; tipoActual<3; tipoActual++){       
            for(carta=0; carta<cantCartas; carta++){
                Carta* actual=mazo[carta];
                for(int fig=0; fig<=i; fig++){
                    int k = 1;
                    while(k){
                        actual->fig->factRotate=0;
                        actual->fig->factScale=1;
                        generarPuntos(actual->fig);
                        imagenFinal(actual->fig);
                        k=0;
                        int sup;
                        if(i>4) sup=11; else sup=13;
                        if(fig<2) sup-=3;
                        if(bb(1, sup, 0.25, actual->fig) == 0) k=1;
                    }
                    imprimirFigCar(i, carta, actual->fig);
                    actual=actual->next;    
                }
            }
            imprimirInfoC(i);
        }
    }
}

//----------------------------------------------------------------

int main() {
    srand(time(NULL));
    FILE* archivo;
    char linea[100];
    archivo = fopen("C:/Users/byluc/Desktop/Stop_it/data_base/infoImagenes.txt","r");
    int i = 0;
    while(fgets(linea, sizeof(linea), archivo) != NULL){
        int j, p;
        for(j = 0; linea[j]!=' '; j++) foto[i/73][i%73].ruta[j] = linea[j];
        char w[5]={0}; p=0;
        for(j+=1; linea[j]!=' '; j++, p++) w[p]=linea[j];  
        foto[i/73][i%73].width=atoi(w); 
        char h[5]={0}; p=0;
        for(j+=1; linea[j]!='\n'; j++, p++) h[p]=linea[j];
        foto[i/73][i%73].height=atoi(h);
        foto[i/73][i%73].id=i%73;
        i++;
    }
    fclose(archivo);
    for(int i=0; i<6; i++) ejes[i]=(Pair*)malloc(sizeof(Pair));
    crearArchivos();
    abrirArchivos();
    imprimirMazo();
    construir();
    cerrarArchivos();
    return 0;
}
