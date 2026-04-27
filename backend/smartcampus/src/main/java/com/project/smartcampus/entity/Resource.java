package com.project.smartcampus.entity;

import com.project.smartcampus.enums.ResourceCategory;
import com.project.smartcampus.enums.ResourceStatus;
import com.project.smartcampus.enums.ResourceType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

@Entity
@Table(name = "resources")
@Data
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name cannot be empty")
    private String name;

    @NotNull
    @Enumerated(EnumType.STRING)
    private ResourceType type;

    @NotNull
    @Enumerated(EnumType.STRING)
    private ResourceCategory category;

    @Min(value = 0, message = "Capacity must be 0 or more")
    private Integer capacity;

    @NotBlank(message = "Location cannot be empty")
    private String location;

    private LocalTime availabilityStart;

    private LocalTime availabilityEnd;

    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    private ResourceStatus status;
}