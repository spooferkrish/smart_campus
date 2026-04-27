//backend\smartcampus\src\main\java\com\project\smartcampus\services\BookingService.java
package com.project.smartcampus.services;

import com.project.smartcampus.dto.BookingRequest;
import com.project.smartcampus.dto.BookingResponse;
import com.project.smartcampus.entity.Booking;
import com.project.smartcampus.entity.Resource;
import com.project.smartcampus.enums.BookingStatus;
import com.project.smartcampus.enums.ResourceStatus;
import com.project.smartcampus.exception.BookingConflictException;
import com.project.smartcampus.repository.BookingRepository;
import com.project.smartcampus.repository.ResourceRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
//import com.project.smartcampus.exception.BookingConflictException;

import java.util.stream.Collectors;
import java.util.List;
import java.util.EnumSet;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class BookingService {

        @Autowired
        private QRCodeService qrCodeService;

        private final BookingRepository repository;
        private final ResourceRepository resourceRepository;
        private static final EnumSet<BookingStatus> ACTIVE_CONFLICT_STATUSES = EnumSet.of(BookingStatus.PENDING,
                        BookingStatus.APPROVED);

        public BookingService(BookingRepository repository, ResourceRepository resourceRepository) {
                this.repository = repository;
                this.resourceRepository = resourceRepository;
        }

        public BookingResponse createBooking(BookingRequest request) {
                validateResourceIsBookable(request.getResourceName());

                Booking booking = mapToEntity(request);

                if (booking.getStartTime().isBefore(LocalDateTime.now())) {
                        throw new BookingConflictException(
                                        "Start time must be in the future");
                }

                if (booking.getEndTime().isBefore(booking.getStartTime())) {
                        throw new BookingConflictException(
                                        "End time must be after start time");
                }

                List<Booking> conflicts = repository
                                .findByResourceNameAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
                                                booking.getResourceName(),
                                                ACTIVE_CONFLICT_STATUSES,
                                                booking.getEndTime(),
                                                booking.getStartTime());

                if (!conflicts.isEmpty()) {
                        throw new BookingConflictException(
                                        "Booking conflict detected for this time slot");
                }

                booking.setStatus(BookingStatus.PENDING);

                return mapToResponse(repository.save(booking));
        }

        public List<BookingResponse> getAllBookings() {
                return repository.findAll()
                                .stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        public List<BookingResponse> getBookingsFiltered(String resourceName, BookingStatus status) {
                boolean hasResource = resourceName != null && !resourceName.isBlank();
                boolean hasStatus = status != null;

                List<Booking> bookings;

                if (hasResource && hasStatus) {
                        bookings = repository.findByResourceNameContainingIgnoreCaseAndStatus(
                                        resourceName,
                                        status);
                        return bookings.stream().map(this::mapToResponse).collect(Collectors.toList());
                }

                if (hasResource) {
                        bookings = repository.findByResourceNameContainingIgnoreCase(resourceName);
                        return bookings.stream().map(this::mapToResponse).collect(Collectors.toList());
                }

                if (hasStatus) {
                        bookings = repository.findByStatus(status);
                        return bookings.stream().map(this::mapToResponse).collect(Collectors.toList());
                }

                return repository.findAll()
                                .stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        public List<BookingResponse> getUserBookings(String bookedBy, BookingStatus status) {
                boolean hasStatus = status != null;

                if (hasStatus) {
                        return repository.findByBookedByAndStatus(bookedBy, status)
                                        .stream()
                                        .map(this::mapToResponse)
                                        .collect(Collectors.toList());
                }

                return repository.findByBookedBy(bookedBy)
                                .stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        public List<BookingResponse> getUserBookingsFiltered(String bookedBy, String resourceName, BookingStatus status) {
                boolean hasResource = resourceName != null && !resourceName.isBlank();
                boolean hasStatus = status != null;

                if (hasResource && hasStatus) {
                        return repository.findByBookedByAndResourceNameContainingIgnoreCaseAndStatus(
                                        bookedBy,
                                        resourceName,
                                        status)
                                        .stream()
                                        .map(this::mapToResponse)
                                        .collect(Collectors.toList());
                }

                if (hasResource) {
                        return repository.findByBookedByAndResourceNameContainingIgnoreCase(bookedBy, resourceName)
                                        .stream()
                                        .map(this::mapToResponse)
                                        .collect(Collectors.toList());
                }

                if (hasStatus) {
                        return repository.findByBookedByAndStatus(bookedBy, status)
                                        .stream()
                                        .map(this::mapToResponse)
                                        .collect(Collectors.toList());
                }

                return repository.findByBookedBy(bookedBy)
                                .stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        public BookingResponse getBookingById(Long id) {
                Booking booking = repository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Booking not found"));
                return mapToResponse(booking);
        }

        public BookingResponse updateBooking(Long id, BookingRequest request) {
                validateResourceIsBookable(request.getResourceName());

                Booking updatedBooking = mapToEntity(request);

                Booking existing = repository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Booking not found"));

                if (existing.getStatus() != BookingStatus.PENDING) {
                        throw new BookingConflictException(
                                        "Only PENDING bookings can be updated");
                }

                if (updatedBooking.getStartTime().isBefore(LocalDateTime.now())) {
                        throw new BookingConflictException(
                                        "Start time must be in the future");
                }

                if (updatedBooking.getEndTime().isBefore(updatedBooking.getStartTime())) {
                        throw new BookingConflictException(
                                        "End time must be after start time");
                }

                List<Booking> conflicts = repository
                                .findByResourceNameAndStatusInAndStartTimeLessThanAndEndTimeGreaterThanAndIdNot(
                                                updatedBooking.getResourceName(),
                                                ACTIVE_CONFLICT_STATUSES,
                                                updatedBooking.getEndTime(),
                                                updatedBooking.getStartTime(),
                                                id);

                if (!conflicts.isEmpty()) {
                        throw new BookingConflictException(
                                        "Booking conflict detected for this time slot");
                }

                existing.setResourceName(updatedBooking.getResourceName());
                existing.setStartTime(updatedBooking.getStartTime());
                existing.setEndTime(updatedBooking.getEndTime());
                existing.setPurpose(updatedBooking.getPurpose());
                existing.setAttendees(updatedBooking.getAttendees());

                return mapToResponse(repository.save(existing));
        }

        public BookingResponse approveBooking(Long id) {

                Booking booking = repository.findById(id)
                                .orElseThrow();

                if (booking.getStatus() != BookingStatus.PENDING) {
                        throw new BookingConflictException(
                                        "Only PENDING bookings can be approved");
                }

                // Change status
                booking.setStatus(BookingStatus.APPROVED);

                // Clear rejection reason
                booking.setRejectionReason(null);

                // Generate QR code
                String qrPath = qrCodeService.generateQRCode(booking);

                // Save QR path
                booking.setQrCode(qrPath);

                return mapToResponse(repository.save(booking));
        }

        public BookingResponse rejectBooking(Long id, String reason) {

                Booking booking = repository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Booking not found"));

                if (booking.getStatus() != BookingStatus.PENDING) {
                        throw new BookingConflictException(
                                        "Only PENDING bookings can be rejected");
                }

                booking.setStatus(BookingStatus.REJECTED);

                booking.setRejectionReason(reason);

                return mapToResponse(repository.save(booking));
        }

        public BookingResponse cancelBooking(Long id) {

                Booking booking = repository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Booking not found"));

                if (booking.getStatus() != BookingStatus.APPROVED) {
                        throw new BookingConflictException(
                                        "Only APPROVED bookings can be cancelled");
                }

                booking.setStatus(BookingStatus.CANCELLED);

                return mapToResponse(repository.save(booking));
        }

        public BookingResponse regenerateQr(Long id) {

                Booking booking = repository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Booking not found"));

                if (booking.getStatus() != BookingStatus.APPROVED) {
                        throw new BookingConflictException(
                                        "Only APPROVED bookings can regenerate QR");
                }

                String qrPath = qrCodeService.generateQRCode(booking);
                booking.setQrCode(qrPath);

                return mapToResponse(repository.save(booking));
        }

        public void deleteBooking(Long id) {

                Booking booking = repository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Booking not found"));

                if (booking.getStatus() != BookingStatus.PENDING) {
                        throw new BookingConflictException(
                                        "Only PENDING bookings can be deleted");
                }

                repository.delete(booking);
        }

        public List<BookingResponse> searchByResource(String resourceName) {
                return repository.findByResourceNameContainingIgnoreCase(resourceName)
                                .stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        public List<BookingResponse> searchByDateRange(
                        LocalDateTime start,
                        LocalDateTime end) {
                return repository.findByStartTimeBetween(start, end)
                                .stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        public List<BookingResponse> searchByResourceAndDate(
                        String resourceName,
                        LocalDateTime start,
                        LocalDateTime end) {
                return repository.findByResourceNameAndStartTimeBetween(
                                resourceName,
                                start,
                                end)
                                .stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        public boolean checkAvailability(
                        String resourceName,
                        LocalDateTime start,
                        LocalDateTime end) {

                validateResourceIsBookable(resourceName);

                // Rule 1 — Start must be today or future
                if (start.toLocalDate().isBefore(LocalDate.now())) {
                        throw new BookingConflictException(
                                        "Start time must be today or in the future");
                }

                // Rule 2 — End must be after start
                if (end.isBefore(start)) {
                        throw new BookingConflictException(
                                        "End time must be after start time");
                }

                List<Booking> conflicts = repository
                                .findByResourceNameAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
                                                resourceName,
                                                ACTIVE_CONFLICT_STATUSES,
                                                end,
                                                start);

                return conflicts.isEmpty();
        }

        public BookingResponse checkIn(Long id) {

                Booking booking = repository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Booking not found"));

                // Debug print
                System.out.println("Booking ID: " + id);
                System.out.println("Current Status: " + booking.getStatus());

                // Check status safely
                if (!BookingStatus.APPROVED.equals(booking.getStatus())) {

                        throw new RuntimeException(
                                        "Booking must be APPROVED to check in. Current status: "
                                                        + booking.getStatus());
                }

                booking.setStatus(
                                BookingStatus.CHECKED_IN);

                booking.setCheckedInTime(
                                LocalDateTime.now());

                return mapToResponse(repository.save(booking));
        }

        private void validateResourceIsBookable(String resourceName) {
                Resource resource = resourceRepository
                                .findFirstByNameIgnoreCase(resourceName)
                                .orElseThrow(() -> new BookingConflictException("Selected resource was not found"));

                if (resource.getStatus() != ResourceStatus.ACTIVE) {
                        throw new BookingConflictException("This resource is out of service and cannot be booked");
                }
        }

        private Booking mapToEntity(BookingRequest request) {
                Booking booking = new Booking();
                booking.setResourceName(request.getResourceName());
                booking.setPurpose(request.getPurpose());
                booking.setBookedBy(request.getBookedBy());
                booking.setAttendees(request.getAttendees());
                booking.setStartTime(request.getStartTime());
                booking.setEndTime(request.getEndTime());
                return booking;
        }

        private BookingResponse mapToResponse(Booking booking) {
                BookingResponse response = new BookingResponse();
                response.setId(booking.getId());
                response.setResourceName(booking.getResourceName());
                response.setPurpose(booking.getPurpose());
                response.setBookedBy(booking.getBookedBy());
                response.setAttendees(booking.getAttendees());
                response.setStartTime(booking.getStartTime());
                response.setEndTime(booking.getEndTime());
                response.setRejectionReason(booking.getRejectionReason());
                response.setStatus(booking.getStatus());
                response.setQrCode(booking.getQrCode());
                response.setCheckedInTime(booking.getCheckedInTime());
                return response;
        }

}
