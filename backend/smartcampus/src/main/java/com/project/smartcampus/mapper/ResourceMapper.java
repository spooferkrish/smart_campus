package com.project.smartcampus.mapper;

import com.project.smartcampus.dto.ResourceDTO;
import com.project.smartcampus.entity.Resource;

public class ResourceMapper {

    public static ResourceDTO toDTO(Resource r) {
        ResourceDTO dto = new ResourceDTO();
        dto.setId(r.getId());
        dto.setName(r.getName());
        dto.setType(r.getType());
        dto.setCategory(r.getCategory());
        dto.setCapacity(r.getCapacity());
        dto.setLocation(r.getLocation());
        dto.setAvailabilityStart(r.getAvailabilityStart());
        dto.setAvailabilityEnd(r.getAvailabilityEnd());
        dto.setDescription(r.getDescription());
        dto.setStatus(r.getStatus());
        return dto;
    }

    public static Resource toEntity(ResourceDTO dto) {
        Resource r = new Resource();
        r.setId(dto.getId());
        r.setName(dto.getName());
        r.setType(dto.getType());
        r.setCategory(dto.getCategory());
        r.setCapacity(dto.getCapacity());
        r.setLocation(dto.getLocation());
        r.setAvailabilityStart(dto.getAvailabilityStart());
        r.setAvailabilityEnd(dto.getAvailabilityEnd());
        r.setDescription(dto.getDescription());
        r.setStatus(dto.getStatus());
        return r;
    }
}