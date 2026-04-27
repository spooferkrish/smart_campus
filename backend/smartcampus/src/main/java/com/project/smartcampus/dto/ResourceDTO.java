package com.project.smartcampus.dto;

import com.project.smartcampus.enums.ResourceCategory;
import com.project.smartcampus.enums.ResourceStatus;
import com.project.smartcampus.enums.ResourceType;
import lombok.Data;

import java.time.LocalTime;

@Data
public class ResourceDTO {

    private Long id;
    private String name;
    private ResourceType type;
    private ResourceCategory category;
    private Integer capacity;
    private String location;
    private LocalTime availabilityStart;
    private LocalTime availabilityEnd;
    private String description;
    private ResourceStatus status;
}