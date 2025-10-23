package doc.app;

import doc.core.DocumentProcessor;
import java.util.ServiceLoader;

public class MainApp {
    public static void main(String[] args) {
        ServiceLoader<DocumentProcessor> loader = ServiceLoader.load(DocumentProcessor.class);
        for (DocumentProcessor processor : loader) {
            System.out.println("Format tersedia: " + processor.getFormatName());
        }
    }
}
