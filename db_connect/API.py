from flask import Flask, jsonify
from flask_cors import CORS
import psycopg2

app = Flask(__name__)
CORS(app)

@app.route('/')
def get_data():
    
    data=[]

    conn = psycopg2.connect(
        dbname="postgres1421",
        user="luco1421",
        password="Ij0vFgwFt5kPnGIoVBb7XmAVpUhyOI1X",
        host="dpg-co8dtb7109ks73ed1fmg-a.oregon-postgres.render.com",
    )

    cursor = conn.cursor()
    
    cursor.execute("SELECT Mazo.tematica_orden, Mazo.ruta from Mazo")
    datos = cursor.fetchall()
    data.append(datos)

    cursor.execute("SELECT Carta.mazo_id, Carta.carta_id from Carta")
    datos = cursor.fetchall()
    data.append(datos)

    cursor.execute("SELECT carta_imagen.carta_id, imagen.ruta, x, y, factScale, factRotate, ancho, alto from carta_imagen join imagen on imagen.imagen_id = carta_imagen.imagen_id")
    datos = cursor.fetchall()
    data.append(datos)
    
    conn.close()
    
    return jsonify(data)

if __name__ == '__main__':
    app.run()