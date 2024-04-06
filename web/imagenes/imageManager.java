import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;

public class imageManager {
    public static void main(String[] args) throws IOException {

        PrintWriter writerTxt = new PrintWriter(new FileWriter("C:/Users/byluc/Desktop/Stop_it/data_base/infoImagenes.txt"));
        PrintWriter writerCsv = new PrintWriter(new FileWriter("C:/Users/byluc/Desktop/Stop_it/data_base/imagenes.csv"));

        String rutaAvatar = "avatar/(";
        String rutaGoT = "got/(";
        String rutaMarcas = "brands/(";

        writeImageInfo(writerTxt, writerCsv, rutaAvatar, "1");
        writeImageInfo(writerTxt, writerCsv, rutaGoT, "2");
        writeImageInfo(writerTxt, writerCsv, rutaMarcas, "3");

        writerTxt.close();
        writerCsv.close();
    }

    public static void writeImageInfo(PrintWriter writerTxt, PrintWriter writerCsv, String rutaBase, String categoria) throws IOException {
        for (int i = 0; i < 73; i++) {
            String rutaImagen = rutaBase + (i + 1) + ").png";
            File archivoImagen = new File(rutaImagen);

            BufferedImage imagen = ImageIO.read(archivoImagen);
            int ancho = imagen.getWidth();
            int alto = imagen.getHeight();

            writerTxt.println(rutaImagen + " " + ancho + " " + alto);
            writerCsv.println(categoria + (i + 1) + ",'" + rutaImagen + "'," + ancho + "," + alto);
        }
    }
}