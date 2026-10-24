package com.southcolours.catalog.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.southcolours.security.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@RestController
@RequestMapping("/api/v1")
@Slf4j
@Tag(name = "Media Uploads", description = "Endpoints for uploading and serving images")
public class MediaUploadController {

    private final Path uploadDir = Paths.get("uploads").toAbsolutePath().normalize();
    private final Cloudinary cloudinary;

    public MediaUploadController(
            @Value("${app.cloudinary.cloud-name:phzoirr6}") String cloudName,
            @Value("${app.cloudinary.api-key:472424285177527}") String apiKey,
            @Value("${app.cloudinary.api-secret:iWJ2bVqOi9t-5SFfRc-sNBfuSQ0}") String apiSecret
    ) {
        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            log.error("Failed to create upload directory", e);
        }

        if (cloudName != null && !cloudName.isBlank() && apiKey != null && !apiKey.isBlank()) {
            this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName,
                    "api_key", apiKey,
                    "api_secret", apiSecret,
                    "secure", true
            ));
            log.info("Initialized Cloudinary uploader with cloud_name: {}", cloudName);
        } else {
            this.cloudinary = null;
            log.warn("Cloudinary credentials not provided; falling back to local file storage");
        }
    }

    @PostMapping(value = {"/admin/uploads", "/uploads"}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload product/catalog images")
    public ResponseEntity<ApiResponse<List<String>>> uploadFiles(
            @RequestParam(value = "files", required = false) MultipartFile[] files,
            @RequestParam(value = "file", required = false) MultipartFile singleFile
    ) {
        List<MultipartFile> allFiles = new ArrayList<>();
        if (files != null) {
            allFiles.addAll(Arrays.asList(files));
        }
        if (singleFile != null) {
            allFiles.add(singleFile);
        }

        List<String> fileUrls = new ArrayList<>();

        for (MultipartFile file : allFiles) {
            if (file.isEmpty()) continue;

            // 1. If Cloudinary is configured, upload directly to Cloudinary permanent cloud storage
            if (this.cloudinary != null) {
                try {
                    Map<?, ?> uploadResult = cloudinary.uploader().upload(
                            file.getBytes(),
                            ObjectUtils.asMap(
                                    "folder", "southcolours/products",
                                    "resource_type", "auto"
                            )
                    );
                    String secureUrl = (String) uploadResult.get("secure_url");
                    if (secureUrl != null) {
                        fileUrls.add(secureUrl);
                        log.info("Successfully uploaded image to Cloudinary: {}", secureUrl);
                        continue;
                    }
                } catch (Exception e) {
                    log.error("Cloudinary upload failed, falling back to local file storage: {}", e.getMessage(), e);
                }
            }

            // 2. Fallback to local storage if Cloudinary is unavailable or fails
            String originalName = file.getOriginalFilename();
            String extension = "";
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf("."));
            } else {
                extension = ".jpg";
            }

            String filename = UUID.randomUUID().toString() + extension;
            Path targetLocation = uploadDir.resolve(filename);

            try {
                Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
                String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                        .path("/api/v1/media/")
                        .path(filename)
                        .toUriString();
                fileUrls.add(fileDownloadUri);
            } catch (IOException e) {
                log.error("Could not store file " + filename, e);
                return ResponseEntity.internalServerError()
                        .body(ApiResponse.error("Failed to store uploaded file: " + originalName));
            }
        }

        return ResponseEntity.ok(ApiResponse.success(fileUrls, "Files uploaded successfully"));
    }

    @GetMapping("/media/{filename:.+}")
    @Operation(summary = "View / download uploaded media file")
    public ResponseEntity<Resource> getFile(@PathVariable String filename) {
        try {
            Path filePath = uploadDir.resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
