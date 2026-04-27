package com.project.smartcampus.services;

import com.project.smartcampus.dto.AssignTechnicianRequest;
import com.project.smartcampus.dto.CreateTicketRequest;
import com.project.smartcampus.dto.TicketAssignmentHistoryResponse;
import com.project.smartcampus.dto.TicketResponse;
import com.project.smartcampus.dto.UpdateTicketStatusRequest;
import com.project.smartcampus.dto.UpdateCommentRequest;
import com.project.smartcampus.dto.UpdateTicketRequest;
import com.project.smartcampus.entity.Ticket;
import com.project.smartcampus.entity.TicketAssignmentHistory;
import com.project.smartcampus.entity.User;
import com.project.smartcampus.enums.Role;
import com.project.smartcampus.enums.TicketStatus;
import com.project.smartcampus.exception.ResourceNotFoundException;
import com.project.smartcampus.exception.UnauthorizedException;
import com.project.smartcampus.repository.TicketRepository;
import org.springframework.stereotype.Service;
import com.project.smartcampus.exception.TicketNotFoundException;
import com.project.smartcampus.dto.CreateCommentRequest;
import com.project.smartcampus.dto.TicketCommentResponse;
import com.project.smartcampus.entity.TicketComment;
import com.project.smartcampus.repository.TicketCommentRepository;
import com.project.smartcampus.repository.TicketAssignmentHistoryRepository;
import com.project.smartcampus.repository.UserRepository;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.Authentication;

import java.io.IOException;
import java.nio.file.*;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TicketService {

    private static final int MAX_FILES = 3;
    private static final long MAX_SIZE = 5 * 1024 * 1024;
    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/jpg", "image/png", "image/webp"
    );
        private static final long FIRST_RESPONSE_SLA_MINUTES = 120;
        private static final long RESOLUTION_SLA_MINUTES = 24 * 60;
    private static final Path UPLOAD_DIR = Paths.get("uploads", "tickets");

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository ticketCommentRepository;
    private final TicketAssignmentHistoryRepository ticketAssignmentHistoryRepository;
    private final UserRepository userRepository;

    public TicketService(TicketRepository ticketRepository,
                         TicketCommentRepository ticketCommentRepository,
                         TicketAssignmentHistoryRepository ticketAssignmentHistoryRepository,
                         UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.ticketCommentRepository = ticketCommentRepository;
        this.ticketAssignmentHistoryRepository = ticketAssignmentHistoryRepository;
        this.userRepository = userRepository;
    }

    public TicketResponse createTicket(CreateTicketRequest request, List<MultipartFile> images) {
        List<String> imagePaths = saveImages(images);

        Ticket ticket = new Ticket();
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setImagePaths(imagePaths);
        ticket.setCategory(request.getCategory());
        ticket.setPriority(request.getPriority());
        ticket.setCreatedBy(request.getCreatedBy());
        ticket.setStatus(TicketStatus.OPEN);

        Ticket savedTicket = ticketRepository.save(ticket);
        Map<Long, User> usersById = getUsersByIds(savedTicket.getCreatedBy(), savedTicket.getAssignedTo());
        return mapToResponse(savedTicket, usersById, Collections.emptyList());
    }

    public List<TicketResponse> getAllTickets() {
        List<Ticket> tickets = ticketRepository.findAll();
        return mapTicketsToResponses(tickets);
    }

    public TicketResponse getTicketById(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found with id: " + id));

        List<TicketComment> comments = ticketCommentRepository.findByTicketIdOrderByCreatedAtAscIdAsc(ticket.getId());
        Set<Long> userIds = new HashSet<>();
        userIds.add(ticket.getCreatedBy());
        userIds.add(ticket.getAssignedTo());
        comments.stream().map(TicketComment::getCommentedBy).forEach(userIds::add);

        Map<Long, User> usersById = userRepository.findAllById(userIds.stream().filter(Objects::nonNull).collect(Collectors.toSet()))
            .stream()
            .collect(Collectors.toMap(User::getId, user -> user));

        return mapToResponse(ticket, usersById, comments);
    }

    public List<TicketResponse> getTicketsByCreatedUser(Long createdBy) {
        List<Ticket> tickets = ticketRepository.findByCreatedBy(createdBy);
        return mapTicketsToResponses(tickets);
    }

    public List<TicketResponse> getTicketsByAssignedTechnician(Long assignedTo) {
        List<Ticket> tickets = ticketRepository.findByAssignedTo(assignedTo);
        return mapTicketsToResponses(tickets);
    }

    public TicketResponse assignTechnician(Long ticketId,
                                           AssignTechnicianRequest request,
                                           Authentication authentication) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        Long assignedBy = extractAuthenticatedUserId(authentication);

        if (request.getAssignedTo() == null) {
            throw new IllegalArgumentException("assignedTo is required.");
        }

        User targetTechnician = userRepository.findById(request.getAssignedTo())
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with id: " + request.getAssignedTo()));

        if (targetTechnician.getRole() != Role.TECHNICIAN) {
            throw new IllegalArgumentException("Target user is not a technician.");
        }

        Long previousTechnicianId = ticket.getAssignedTo();
        String reason = Optional.ofNullable(request.getReason())
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .orElse("No reason provided");

        ticket.setAssignedTo(request.getAssignedTo());
        ticket.setUpdatedAt(LocalDateTime.now());

        Ticket updatedTicket = ticketRepository.save(ticket);

        TicketAssignmentHistory history = new TicketAssignmentHistory();
        history.setTicketId(ticketId);
        history.setAssignedBy(assignedBy);
        history.setFromTechnicianId(previousTechnicianId);
        history.setToTechnicianId(request.getAssignedTo());
        history.setReason(reason);
        ticketAssignmentHistoryRepository.save(history);

        Map<Long, User> usersById = getUsersByIds(updatedTicket.getCreatedBy(), updatedTicket.getAssignedTo(), request.getAssignedTo());
        List<TicketComment> comments = ticketCommentRepository.findByTicketIdOrderByCreatedAtAscIdAsc(updatedTicket.getId());
        return mapToResponse(updatedTicket, usersById, comments);
    }

    public List<TicketAssignmentHistoryResponse> getAssignmentHistory(Long ticketId) {
        if (!ticketRepository.existsById(ticketId)) {
            throw new TicketNotFoundException("Ticket not found with id: " + ticketId);
        }

        List<TicketAssignmentHistory> historyRows = ticketAssignmentHistoryRepository
                .findByTicketIdOrderByAssignedAtDescIdDesc(ticketId);

        Set<Long> userIds = new HashSet<>();
        historyRows.forEach(row -> {
            if (row.getAssignedBy() != null) {
                userIds.add(row.getAssignedBy());
            }
            if (row.getFromTechnicianId() != null) {
                userIds.add(row.getFromTechnicianId());
            }
            if (row.getToTechnicianId() != null) {
                userIds.add(row.getToTechnicianId());
            }
        });

        Map<Long, User> usersById = userRepository.findAllById(userIds)
                .stream()
                .collect(Collectors.toMap(User::getId, user -> user));

        return historyRows.stream()
                .map(row -> mapAssignmentHistoryToResponse(row, usersById))
                .collect(Collectors.toList());
    }

    public TicketResponse updateTicketStatus(Long ticketId, UpdateTicketStatusRequest request) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        ticket.setStatus(request.getStatus());
        ticket.setUpdatedAt(LocalDateTime.now());

        if (request.getStatus() == TicketStatus.RESOLVED) {
            ticket.setResolvedAt(LocalDateTime.now());
        }

        Ticket updatedTicket = ticketRepository.save(ticket);
        Map<Long, User> usersById = getUsersByIds(updatedTicket.getCreatedBy(), updatedTicket.getAssignedTo());
        List<TicketComment> comments = ticketCommentRepository.findByTicketIdOrderByCreatedAtAscIdAsc(updatedTicket.getId());
        return mapToResponse(updatedTicket, usersById, comments);
    }

    public TicketResponse updateTicket(Long ticketId, UpdateTicketRequest request, Authentication authentication) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        Long userId = null;
        boolean isAdmin = false;

        if (authentication != null) {
            try {
                userId = Long.parseLong(authentication.getName());
            } catch (NumberFormatException ignored) {
                userId = null;
            }
            isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
        }

        boolean isOwner = userId != null && Objects.equals(ticket.getCreatedBy(), userId);
        if (!isAdmin && !isOwner) {
            throw new UnauthorizedException("You are not allowed to edit this ticket.");
        }

        if (ticket.getStatus() == TicketStatus.RESOLVED || ticket.getStatus() == TicketStatus.CLOSED) {
            throw new IllegalStateException("Resolved tickets cannot be edited.");
        }

        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setCategory(request.getCategory());
        ticket.setPriority(request.getPriority());
        ticket.setUpdatedAt(LocalDateTime.now());

        Ticket updatedTicket = ticketRepository.save(ticket);
        Map<Long, User> usersById = getUsersByIds(updatedTicket.getCreatedBy(), updatedTicket.getAssignedTo());
        List<TicketComment> comments = ticketCommentRepository.findByTicketIdOrderByCreatedAtAscIdAsc(updatedTicket.getId());
        return mapToResponse(updatedTicket, usersById, comments);
    }

    private TicketResponse mapToResponse(Ticket ticket, Map<Long, User> usersById, List<TicketComment> comments) {
        TicketResponse response = new TicketResponse();
        response.setId(ticket.getId());
        response.setTitle(ticket.getTitle());
        response.setDescription(ticket.getDescription());
        response.setImages(ticket.getImagePaths());
        response.setCategory(ticket.getCategory());
        response.setPriority(ticket.getPriority());
        response.setStatus(ticket.getStatus());
        response.setCreatedBy(ticket.getCreatedBy());
        response.setCreatedByName(resolveUserName(ticket.getCreatedBy(), usersById, "N/A"));
        response.setAssignedTo(ticket.getAssignedTo());
        response.setAssignedToName(resolveUserName(ticket.getAssignedTo(), usersById, "Not assigned yet"));
        response.setCreatedAt(ticket.getCreatedAt());
        response.setUpdatedAt(ticket.getUpdatedAt());
        response.setResolvedAt(ticket.getResolvedAt());

        LocalDateTime firstResponseAt = findFirstStaffResponseAt(comments, usersById);
        response.setFirstResponseAt(firstResponseAt);

        Long firstResponseMinutes = computeDurationMinutes(ticket.getCreatedAt(), firstResponseAt);
        response.setTimeToFirstResponseMinutes(firstResponseMinutes);
        response.setFirstResponseSlaBreached(firstResponseMinutes != null
                ? firstResponseMinutes > FIRST_RESPONSE_SLA_MINUTES
                : null);

        Long resolutionMinutes = computeDurationMinutes(ticket.getCreatedAt(), ticket.getResolvedAt());
        response.setTimeToResolutionMinutes(resolutionMinutes);
        response.setResolutionSlaBreached(resolutionMinutes != null
                ? resolutionMinutes > RESOLUTION_SLA_MINUTES
                : null);

        return response;
    }

    private List<TicketResponse> mapTicketsToResponses(List<Ticket> tickets) {
        if (tickets.isEmpty()) {
            return Collections.emptyList();
        }

        Set<Long> userIds = tickets.stream()
            .flatMap(ticket -> Arrays.stream(new Long[]{ticket.getCreatedBy(), ticket.getAssignedTo()}))
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());

        List<Long> ticketIds = tickets.stream().map(Ticket::getId).collect(Collectors.toList());
        List<TicketComment> comments = ticketCommentRepository.findByTicketIdInOrderByCreatedAtAscIdAsc(ticketIds);
        comments.stream()
                .map(TicketComment::getCommentedBy)
                .filter(Objects::nonNull)
                .forEach(userIds::add);

        Map<Long, User> usersById = userRepository.findAllById(userIds)
            .stream()
            .collect(Collectors.toMap(User::getId, user -> user));

        Map<Long, List<TicketComment>> commentsByTicketId = comments.stream()
                .filter(comment -> comment.getTicket() != null && comment.getTicket().getId() != null)
                .collect(Collectors.groupingBy(comment -> comment.getTicket().getId()));

        return tickets.stream()
            .map(ticket -> mapToResponse(ticket, usersById,
                    commentsByTicketId.getOrDefault(ticket.getId(), Collections.emptyList())))
            .collect(Collectors.toList());
    }

    private Map<Long, User> getUsersByIds(Long... userIds) {
        Set<Long> ids = Arrays.stream(userIds)
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());

        if (ids.isEmpty()) {
            return Collections.emptyMap();
        }

        return userRepository.findAllById(ids)
            .stream()
            .collect(Collectors.toMap(User::getId, user -> user));
    }

    private LocalDateTime findFirstStaffResponseAt(List<TicketComment> comments, Map<Long, User> usersById) {
        return comments.stream()
                .filter(comment -> comment.getCreatedAt() != null)
                .filter(comment -> {
                    User commenter = usersById.get(comment.getCommentedBy());
                    Role role = commenter != null ? commenter.getRole() : null;
                    return role == Role.ADMIN || role == Role.TECHNICIAN;
                })
                .map(TicketComment::getCreatedAt)
                .min(LocalDateTime::compareTo)
                .orElse(null);
    }

    private Long computeDurationMinutes(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            return null;
        }

        long minutes = Duration.between(start, end).toMinutes();
        return Math.max(minutes, 0);
    }

    public TicketCommentResponse addComment(Long ticketId, CreateCommentRequest request, Authentication authentication) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        Long userId = extractAuthenticatedUserId(authentication);

        TicketComment ticketComment = new TicketComment();
        ticketComment.setComment(request.getComment().trim());
        ticketComment.setCommentedBy(userId);
        ticketComment.setTicket(ticket);

        TicketComment savedComment = ticketCommentRepository.save(ticketComment);
        Map<Long, User> usersById = userRepository.findAllById(List.of(userId))
                .stream()
                .collect(Collectors.toMap(User::getId, user -> user));

        return mapCommentToResponse(savedComment, usersById);
    }

    public TicketCommentResponse addReply(Long ticketId,
                                          Long parentCommentId,
                                          CreateCommentRequest request,
                                          Authentication authentication) {
        if (!isAdmin(authentication)) {
            throw new UnauthorizedException("Only admins can reply to comments.");
        }

        Long userId = extractAuthenticatedUserId(authentication);
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        TicketComment parentComment = ticketCommentRepository.findById(parentCommentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + parentCommentId));

        if (!Objects.equals(parentComment.getTicket().getId(), ticketId)) {
            throw new IllegalArgumentException("Parent comment does not belong to this ticket.");
        }

        TicketComment reply = new TicketComment();
        reply.setComment(request.getComment().trim());
        reply.setCommentedBy(userId);
        reply.setTicket(ticket);
        reply.setParentComment(parentComment);

        TicketComment savedReply = ticketCommentRepository.save(reply);
        Map<Long, User> usersById = userRepository.findAllById(List.of(userId))
                .stream()
                .collect(Collectors.toMap(User::getId, user -> user));

        return mapCommentToResponse(savedReply, usersById);
    }

    public TicketCommentResponse updateComment(Long ticketId,
                                               Long commentId,
                                               UpdateCommentRequest request,
                                               Authentication authentication) {
        Long userId = extractAuthenticatedUserId(authentication);

        TicketComment comment = ticketCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        if (!Objects.equals(comment.getTicket().getId(), ticketId)) {
            throw new IllegalArgumentException("Comment does not belong to this ticket.");
        }

        boolean owner = Objects.equals(comment.getCommentedBy(), userId);
        if (!owner) {
            throw new UnauthorizedException("You are not allowed to edit this comment.");
        }

        comment.setComment(request.getComment().trim());
        TicketComment updatedComment = ticketCommentRepository.save(comment);

        List<Long> ids = new ArrayList<>();
        ids.add(updatedComment.getCommentedBy());
        if (updatedComment.getParentComment() != null) {
            ids.add(updatedComment.getParentComment().getCommentedBy());
        }

        Map<Long, User> usersById = userRepository.findAllById(ids)
                .stream()
                .collect(Collectors.toMap(User::getId, user -> user));

        return mapCommentToResponse(updatedComment, usersById);
    }

    public void deleteComment(Long ticketId, Long commentId, Authentication authentication) {
        Long userId = extractAuthenticatedUserId(authentication);

        TicketComment comment = ticketCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        if (!Objects.equals(comment.getTicket().getId(), ticketId)) {
            throw new IllegalArgumentException("Comment does not belong to this ticket.");
        }

        boolean owner = Objects.equals(comment.getCommentedBy(), userId);
        if (!owner) {
            throw new UnauthorizedException("You are not allowed to delete this comment.");
        }

        List<TicketComment> allTicketComments = ticketCommentRepository.findByTicketIdOrderByCreatedAtAscIdAsc(ticketId);
        List<TicketComment> childReplies = allTicketComments.stream()
                .filter(item -> item.getParentComment() != null)
                .filter(item -> Objects.equals(item.getParentComment().getId(), commentId))
                .collect(Collectors.toList());

        if (!childReplies.isEmpty()) {
            ticketCommentRepository.deleteAll(childReplies);
        }

        ticketCommentRepository.delete(comment);
    }

    public List<TicketCommentResponse> getCommentsByTicketId(Long ticketId) {
        List<TicketComment> comments = ticketCommentRepository.findByTicketIdOrderByCreatedAtAscIdAsc(ticketId);
        List<Long> userIds = comments.stream()
                .map(TicketComment::getCommentedBy)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());

        Map<Long, User> usersById = userRepository.findAllById(userIds)
                .stream()
                .collect(Collectors.toMap(User::getId, user -> user));

        return comments.stream()
                .map(comment -> mapCommentToResponse(comment, usersById))
                .collect(Collectors.toList());
    }

    private TicketCommentResponse mapCommentToResponse(TicketComment comment, Map<Long, User> usersById) {
        TicketCommentResponse response = new TicketCommentResponse();
        response.setId(comment.getId());
        response.setComment(comment.getComment());
        response.setCommentedBy(comment.getCommentedBy());

        User commenter = usersById.get(comment.getCommentedBy());
        if (commenter != null) {
            response.setCommentedByName(commenter.getName());
            response.setCommentedByRole(commenter.getRole() != null ? commenter.getRole().name() : "USER");
        } else {
            response.setCommentedByName("User #" + comment.getCommentedBy());
            response.setCommentedByRole("USER");
        }

        response.setParentCommentId(
                comment.getParentComment() != null ? comment.getParentComment().getId() : null
        );
        response.setCreatedAt(comment.getCreatedAt());
        response.setUpdatedAt(comment.getUpdatedAt());

        boolean edited = comment.getUpdatedAt() != null
                && comment.getCreatedAt() != null
                && comment.getUpdatedAt().isAfter(comment.getCreatedAt());
        response.setEdited(edited);

        return response;
    }

    private TicketAssignmentHistoryResponse mapAssignmentHistoryToResponse(TicketAssignmentHistory history,
                                                                           Map<Long, User> usersById) {
        TicketAssignmentHistoryResponse response = new TicketAssignmentHistoryResponse();
        response.setId(history.getId());
        response.setTicketId(history.getTicketId());
        response.setAssignedBy(history.getAssignedBy());
        response.setFromTechnicianId(history.getFromTechnicianId());
        response.setToTechnicianId(history.getToTechnicianId());
        response.setReason(history.getReason());
        response.setAssignedAt(history.getAssignedAt());

        response.setAssignedByName(resolveUserName(history.getAssignedBy(), usersById));
        response.setFromTechnicianName(resolveUserName(history.getFromTechnicianId(), usersById));
        response.setToTechnicianName(resolveUserName(history.getToTechnicianId(), usersById));

        return response;
    }

    private String resolveUserName(Long userId, Map<Long, User> usersById) {
        if (userId == null) {
            return "Unassigned";
        }

        User user = usersById.get(userId);
        if (user == null) {
            return "User #" + userId;
        }

        String name = Optional.ofNullable(user.getName()).map(String::trim).orElse("");
        if (!name.isEmpty()) {
            return name;
        }

        return "User #" + userId;
    }

    private String resolveUserName(Long userId, Map<Long, User> usersById, String nullLabel) {
        if (userId == null) {
            return nullLabel;
        }

        User user = usersById.get(userId);
        if (user == null) {
            return "User #" + userId;
        }

        String name = Optional.ofNullable(user.getName()).map(String::trim).orElse("");
        if (!name.isEmpty()) {
            return name;
        }

        return "User #" + userId;
    }

    private Long extractAuthenticatedUserId(Authentication authentication) {
        if (authentication == null) {
            throw new UnauthorizedException("Authentication is required.");
        }

        try {
            return Long.parseLong(authentication.getName());
        } catch (NumberFormatException ex) {
            throw new UnauthorizedException("Invalid authentication context.");
        }
    }

    private boolean isAdmin(Authentication authentication) {
        if (authentication == null || authentication.getAuthorities() == null) {
            return false;
        }

        return authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }

    private List<String> saveImages(List<MultipartFile> images) {
        if (images == null || images.isEmpty()) {
            return Collections.emptyList();
        }

        if (images.size() > MAX_FILES) {
            throw new IllegalArgumentException("You can upload up to " + MAX_FILES + " images.");
        }

        try {
            Files.createDirectories(UPLOAD_DIR);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory.", e);
        }

        List<String> savedPaths = new ArrayList<>();

        for (MultipartFile file : images) {
            if (file == null || file.isEmpty()) {
                continue;
            }
            if (file.getSize() > MAX_SIZE) {
                throw new IllegalArgumentException("File size exceeds 5MB.");
            }
            String contentType = file.getContentType();
            if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
                throw new IllegalArgumentException("Invalid image type.");
            }

            String originalName = Optional.ofNullable(file.getOriginalFilename()).orElse("");
            String extension = "";
            int dotIndex = originalName.lastIndexOf(".");
            if (dotIndex >= 0) {
                extension = originalName.substring(dotIndex);
            }

            String uniqueName = UUID.randomUUID() + extension;
            Path targetPath = UPLOAD_DIR.resolve(uniqueName);

            try {
                Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException e) {
                throw new RuntimeException("Failed to save image: " + originalName, e);
            }

            savedPaths.add(UPLOAD_DIR.resolve(uniqueName).toString().replace("\\", "/"));
        }

        return savedPaths;
    }
}