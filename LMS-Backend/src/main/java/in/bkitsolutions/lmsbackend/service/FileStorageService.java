package in.bkitsolutions.lmsbackend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.upload.base-url:http://localhost:8080/uploads}")
    private String baseUrl;

    // Initialize upload directory
    public void init() {
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize upload directory", e);
        }
    }

    // Store file and return URL
    public String store(MultipartFile file, String subfolder) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot store empty file");
        }

        // Create subfolder if needed
        Path subfolderPath = Paths.get(uploadDir, subfolder);
        if (!Files.exists(subfolderPath)) {
            Files.createDirectories(subfolderPath);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".") 
            ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
            : "";
        String filename = UUID.randomUUID().toString() + extension;

        // Store file
        Path destinationFile = subfolderPath.resolve(filename);
        Files.copy(file.getInputStream(), destinationFile, StandardCopyOption.REPLACE_EXISTING);

        // Return public URL
        return baseUrl + "/" + subfolder + "/" + filename;
    }

    // Delete file by URL
    public void delete(String fileUrl) {
        try {
            if (fileUrl != null && fileUrl.startsWith(baseUrl)) {
                String relativePath = fileUrl.substring(baseUrl.length() + 1);
                Path filePath = Paths.get(uploadDir, relativePath);
                Files.deleteIfExists(filePath);
            }
        } catch (IOException e) {
            // Log but don't throw - file deletion is not critical
            System.err.println("Failed to delete file: " + fileUrl);
        }
    }

    // For future S3 implementation
    public String storeToS3(MultipartFile file, String subfolder) {
        // TODO: Implement S3 upload when moving to production
        // For now, use local storage
        try {
            return store(file, subfolder);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }
}
