//backend\smartcampus\src\main\java\com\project\smartcampus\exception\BookingConflictException.java
package com.project.smartcampus.exception;

public class BookingConflictException extends RuntimeException {

    public BookingConflictException(String message) {
        super(message);
    }
}