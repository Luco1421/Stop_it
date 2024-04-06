import matplotlib.pyplot as plt
import numpy as np

def circulo(radio, centerX, centerY):
    return plt.Circle((centerX, centerY), radio, fill=False)

def rotX(cor, factor, punto):
    sinF=np.sin(factor*(np.pi/180))
    cosF=np.cos(factor*(np.pi/180))
    return (cor[0]-punto[0])*cosF-(cor[1]-punto[1])*sinF+punto[0]

def rotY(cor, factor, punto):
    sinF=np.sin(factor*(np.pi/180))
    cosF=np.cos(factor*(np.pi/180))
    return (cor[0]-punto[0])*sinF+(cor[1]-punto[1])*cosF+punto[1]

ax=plt.gca()

# Enviar el radio y el centro del circulo
ax.add_patch(circulo(270.5, 270.5, 270.5))
c=['blue', 'red', 'black', 'green', 'yellow', 'cyan', 'magenta']
plt.axis('scaled')

def mostrarPuntos():
    #Cantidad de puntos a leer
    n=int(input())
    k=0
    while n:
        ejex=[]
        ejey=[]
        for i in range(4):
            #Coordenada X Y
            a, b=map(str, input().split())
            ejex.append(float(a))
            ejey.append(float(b))
        n-=4
        plt.plot([ejex[0], ejex[1]], [ejey[0], ejey[1]], color=c[k%7])
        plt.plot([ejex[1], ejex[2]], [ejey[1], ejey[2]], color=c[k%7])
        plt.plot([ejex[2], ejex[3]], [ejey[2], ejey[3]], color=c[k%7]) 
        plt.plot([ejex[0], ejex[3]], [ejey[0], ejey[3]], color=c[k%7])
        k+=1

def mostrar():
    #Cantidad de Figuras que tiene la carta
    n=int(input())
    while n:
        # w=width, h=height, factor=la raiz del factor para escalar
        # grado=grados a rotar y punto x, y
        h, w, x, y, factor, grado=map(float, input().split(","))
        ancho=(w/10)*factor
        alto=(h/10)*factor
        ejex=[x, rotX([x, y+alto], grado,[x, y]), rotX([x+ancho, y+alto], grado,[x, y]), rotX([x+ancho, y], grado,[x, y])]
        ejey=[y, rotY([x, y+alto], grado,[x, y]), rotY([x+ancho, y+alto], grado,[x, y]), rotY([x+ancho, y], grado,[x, y])]
        plt.plot([ejex[0], ejex[1]], [ejey[0], ejey[1]])
        plt.plot([ejex[1], ejex[2]], [ejey[1], ejey[2]])
        plt.plot([ejex[2], ejex[3]], [ejey[2], ejey[3]]) 
        plt.plot([ejex[0], ejex[3]], [ejey[0], ejey[3]])
        n-=1

mostrarPuntos()
plt.show()
