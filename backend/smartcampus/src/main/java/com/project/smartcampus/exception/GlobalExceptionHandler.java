//backend\smartcampus\src\main\java\com\project\smartcampus\exception\GlobalExceptionHandler.java
package com.project.smartcampus.exception;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BookingConflictException.class)
    public ResponseEntity<Map<String, Object>> handleBookingConflict(
            BookingConflictException ex
    ) {

        Map<String, Object> response = new HashMap<>();

        response.put("timestamp", LocalDateTime.now());
        response.put("status", 400);
        response.put("error", "Bad Request");
        response.put("message", ex.getMessage());

        return new ResponseEntity<>(
                response,
                HttpStatus.BAD_REQUEST
        );
    }

    @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException ex) {
                Map<String, Object> response = new HashMap<>();
                response.put("timestamp", LocalDateTime.now());
                response.put("status", 404);
                response.put("error", "Not Found");
                response.put("message", ex.getMessage());

                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

        @ExceptionHandler(UnauthorizedException.class)
        public ResponseEntity<Map<String, Object>> handleUnauthorized(UnauthorizedException ex) {
                Map<String, Object> response = new HashMap<>();
                response.put("timestamp", LocalDateTime.now());
                response.put("status", 401);
                response.put("error", "Unauthorized");
                response.put("message", ex.getMessage());

                return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }

        @ExceptionHandler({AuthorizationDeniedException.class, AccessDeniedException.class})
        public ResponseEntity<Map<String, Object>> handleAccessDenied(Exception ex) {
                Map<String, Object> response = new HashMap<>();
                response.put("timestamp", LocalDateTime.now());
                response.put("status", 403);
                response.put("error", "Forbidden");
                response.put("message", "Access Denied");

                return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
        }



    //sandani
     @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(
            RuntimeException ex
    ) {
        Map<String, Object> response = new HashMap<>();

        response.put("timestamp", LocalDateTime.now());
        response.put("status", 400);
        response.put("error", "Bad Request");
        response.put("message", ex.getMessage());

        return new ResponseEntity<>(
                response,
                HttpStatus.BAD_REQUEST
        );
    }

    //sandani
    @ExceptionHandler(TicketNotFoundException.class)
public ResponseEntity<Map<String, Object>> handleTicketNotFound(
        TicketNotFoundException ex
) {
    Map<String, Object> response = new HashMap<>();

    response.put("timestamp", LocalDateTime.now());
    response.put("status", 404);
    response.put("error", "Not Found");
    response.put("message", ex.getMessage());

    return new ResponseEntity<>(
            response,
            HttpStatus.NOT_FOUND
    );
}

//sandani
@ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<Map<String, Object>> handleValidationException(
        MethodArgumentNotValidException ex
) {
    Map<String, Object> response = new HashMap<>();

    response.put("timestamp", LocalDateTime.now());
    response.put("status", 400);
    response.put("error", "Validation Error");

    String errorMessage = ex.getBindingResult().getFieldErrors().stream()
            .findFirst()
            .map(fieldError -> fieldError.getDefaultMessage())
            .orElseGet(() -> ex.getBindingResult().getGlobalErrors().stream()
                    .findFirst()
                    .map(globalError -> globalError.getDefaultMessage())
                    .orElse("Validation failed"));

    response.put("message", errorMessage);

    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
}
}

