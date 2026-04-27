package com.project.smartcampus.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request payload for notification preference updates.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateNotificationSettingsRequest {

    @NotNull(message = "notificationsEnabled is required")
    private Boolean notificationsEnabled;
}
