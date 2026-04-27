-- Add booked_by to bookings table
ALTER TABLE bookings
  ADD COLUMN booked_by VARCHAR(255) NULL AFTER purpose;
