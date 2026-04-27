package com.project.smartcampus.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Generic API response for message-only payloads.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiMessageResponse {

    private String message;
}
