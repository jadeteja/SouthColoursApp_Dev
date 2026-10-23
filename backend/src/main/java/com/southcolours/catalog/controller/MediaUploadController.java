package com.southcolours.catalog.controller;

import com.southcolours.security.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
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

    public MediaUploadController() {
        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            log.error("Failed to create upload directory", e);
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
