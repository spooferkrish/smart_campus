package com.project.smartcampus.repository;

import com.project.smartcampus.entity.Booking;
import com.project.smartcampus.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.time.LocalDateTime;
import java.util.Collection;

public interface BookingRepository extends JpaRepository<Booking, Long> {
        // Overlapping booking checks
        List<Booking> findByResourceNameAndStartTimeLessThanAndEndTimeGreaterThan(
                        String resourceName,
                        LocalDateTime endTime,
                        LocalDateTime startTime);
        // Exclude current booking for updates
        List<Booking> findByResourceNameAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
                        String resourceName,
                        Collection<BookingStatus> statuses,
                        LocalDateTime endTime,
                        LocalDateTime startTime);
        
        List<Booking> findByResourceNameAndStatusInAndStartTimeLessThanAndEndTimeGreaterThanAndIdNot(
                        String resourceName,
                        Collection<BookingStatus> statuses,
                        LocalDateTime endTime,
                        LocalDateTime startTime,
                        Long id);
        // Filtering queries
        List<Booking> findByResourceNameContainingIgnoreCase(String resourceName);

        List<Booking> findByStatus(BookingStatus status);

        List<Booking> findByResourceNameContainingIgnoreCaseAndStatus(
                        String resourceName,
                        BookingStatus status);

        List<Booking> findByStartTimeBetween(
                        LocalDateTime start,
                        LocalDateTime end);

        List<Booking> findByResourceNameAndStartTimeBetween(
                        String resourceName,
                        LocalDateTime start,
                        LocalDateTime end);
        
        // User-specific queries
        List<Booking> findByBookedBy(String bookedBy);
        
        List<Booking> findByBookedByAndStatus(String bookedBy, BookingStatus status);

        List<Booking> findByBookedByAndResourceNameContainingIgnoreCase(String bookedBy, String resourceName);

        List<Booking> findByBookedByAndResourceNameContainingIgnoreCaseAndStatus(String bookedBy, String resourceName,
                        BookingStatus status);
}
