# it3030-paf-2026-smart-campus-group57
Smart Campus Operations Hub – PAF Assignment 2026 (Group 57)

---

## Project Main Functions & Features

### 1. Resource Management - Dakshika M G N (IT23813984)
- **ResourceList**: Displays all campus resources, their availability, and allows filtering/searching. Fetches resources from the backend and shows real-time booking status.
- **AdminResourcePage**: Allows admins to manage resources, view all bookings, and filter resources by type, category, capacity, and location.

### 2. Booking System - Chamya N D (IT23848184)
- **CreateBooking**: Lets users create new bookings for resources, with validation for time and resource selection.
- **BookingList**: Shows a list of all bookings, their status, and details for each booking.
- **BookingAdmin**: Admin dashboard for reviewing, approving, or rejecting booking requests, and visualizing booking analytics.
- **QR Code for Approved Bookings**: Generates a unique QR code for each approved booking, which can be scanned for verification and access control.
- **Booking Verification**: Allows staff to scan and verify booking QR codes at resource entry points, ensuring only approved users access the facilities.
- **Booking Status Updates**: Real-time updates and notifications for booking approvals, rejections, and check-ins.

### 3. Ticketing/Issue Management - Chamoda M S (IT23832480)
- **CreateTicket**: Users can report issues (maintenance, equipment, etc.) with file uploads and priority selection.
- **AdminTickets/TechnicianTickets**: Admins and technicians can view, assign, and update the status of tickets.
- **TicketDetails**: Shows detailed information about a specific ticket, including images and status updates.

### 4. Authentication & User Management - Christopher K K (IT23827530)
- **authService**: Handles login, signup, password reset, and user role management via API.
- **UserManagement**: Admin interface for managing user accounts and roles.

### 5. Notifications - Christopher K K (IT23827530)
- **NotificationBell/NotificationDropdown**: UI components for showing real-time notifications to users about bookings, tickets, and system updates.

### 6. General UI & Navigation
- **Header/Footer**: Navigation components with role-based links and quick access to main features.
- **Home**: Landing page highlighting platform features, benefits, and quick actions.

---

