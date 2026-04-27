//SandaniChamoda-it3030-paf-2026-smart-campus-group57\backend\smartcampus\src\main\java\com\project\smartcampus\services\QRCodeService.java
package com.project.smartcampus.services;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.qrcode.QRCodeWriter;
import com.project.smartcampus.entity.Booking;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@Service
public class QRCodeService {

    @Value("${app.frontend.url}")
    private String frontendUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();
    
     public String generateQRCode(Booking booking) {

        try {
            String data = buildQrPayload(booking);

            QRCodeWriter writer = new QRCodeWriter();

            BitMatrix matrix =
                writer.encode(
                    data,
                    BarcodeFormat.QR_CODE,
                    200,
                    200
                );

            Path outputDir =
                Paths.get(
                    "src",
                    "main",
                    "resources",
                    "static",
                    "qr"
                );

            Files.createDirectories(outputDir);

            Path path =
                outputDir.resolve(
                    "qr_" + booking.getId() + ".png"
                );

            MatrixToImageWriter.writeToPath(
                matrix,
                "PNG",
                path
            );

            return "qr/qr_" + booking.getId() + ".png";

        } catch (Exception e) {

            throw new RuntimeException(
                "QR generation failed"
            );

        }

    }

    private String buildQrPayload(Booking booking) {
        // URL-based QR with encoded booking data for offline display.
        try {
            Map<String, Object> bookingData = new HashMap<>();
            bookingData.put("id", booking.getId());
            bookingData.put("resourceName", booking.getResourceName());
            bookingData.put("purpose", booking.getPurpose());
            bookingData.put("bookedBy", booking.getBookedBy());
            bookingData.put("attendees", booking.getAttendees());
            bookingData.put("startTime", booking.getStartTime());
            bookingData.put("endTime", booking.getEndTime());
            bookingData.put("status", statusSafe(booking));

            String jsonData = objectMapper.writeValueAsString(bookingData);
            String encodedData = java.net.URLEncoder.encode(jsonData, "UTF-8");

            return frontendUrl + "/qr-verify/" + valueOrNa(booking.getId()) + "?data=" + encodedData;
        } catch (Exception e) {
            return frontendUrl + "/qr-verify/" + valueOrNa(booking.getId());
        }
    }

    private String statusSafe(Booking booking) {
        if (booking.getStatus() == null) {
            return null;
        }
        return booking.getStatus().name();
    }

    private String valueOrNa(Object value) {
        return value == null ? "N/A" : value.toString();
    }
}
