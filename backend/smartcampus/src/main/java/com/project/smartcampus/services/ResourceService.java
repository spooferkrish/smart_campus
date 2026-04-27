package com.project.smartcampus.services;

import com.project.smartcampus.dto.ResourceDTO;
import com.project.smartcampus.entity.Resource;
import com.project.smartcampus.enums.ResourceCategory;
import com.project.smartcampus.enums.ResourceType;
import com.project.smartcampus.exception.ResourceNotFoundException;
import com.project.smartcampus.mapper.ResourceMapper;
import com.project.smartcampus.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResourceService {

    @Autowired
    private ResourceRepository repo;

    public List<ResourceDTO> getAll() {
        return repo.findAll().stream()
            .map(ResourceMapper::toDTO)
            .map(this::normalizeDto)
            .toList();
    }

    public List<ResourceDTO> getByType(ResourceType type) {
        List<ResourceType> types = type == ResourceType.FACILITY
            ? List.of(ResourceType.FACILITY, ResourceType.LAB, ResourceType.ROOM)
            : List.of(type);

        return repo.findByTypeIn(types).stream()
            .map(ResourceMapper::toDTO)
            .map(this::normalizeDto)
            .toList();
}

    public List<ResourceDTO> getByLocation(String location) {
    return repo.findByLocation(location).stream()
            .map(ResourceMapper::toDTO)
            .map(this::normalizeDto)
            .toList();
}

    public ResourceDTO create(ResourceDTO dto) {
    ResourceDTO normalized = normalizeDto(dto);
    Resource r = ResourceMapper.toEntity(normalized);
    return ResourceMapper.toDTO(repo.save(r));
}

    public ResourceDTO getById(Long id) {
    Resource r = repo.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id " + id));
    return normalizeDto(ResourceMapper.toDTO(r));
}

    public ResourceDTO update(Long id, ResourceDTO dto) {
    Resource existing = repo.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id " + id));

    ResourceDTO normalized = normalizeDto(dto);

    existing.setName(normalized.getName());
    existing.setType(normalized.getType());
    existing.setCategory(normalized.getCategory());
    existing.setCapacity(normalized.getCapacity());
    existing.setLocation(normalized.getLocation());
    existing.setAvailabilityStart(normalized.getAvailabilityStart());
    existing.setAvailabilityEnd(normalized.getAvailabilityEnd());
    existing.setDescription(normalized.getDescription());
    existing.setStatus(normalized.getStatus());

    return ResourceMapper.toDTO(repo.save(existing));
}

    public void delete(Long id) {
        repo.deleteById(id);
    }

    private ResourceDTO normalizeDto(ResourceDTO dto) {
        if (dto == null) {
            return null;
        }

        ResourceType type = dto.getType();
        if (type == ResourceType.LAB || type == ResourceType.ROOM) {
            dto.setType(ResourceType.FACILITY);
        }

        if (dto.getCategory() == null) {
            if (dto.getType() == ResourceType.EQUIPMENT) {
                dto.setCategory(ResourceCategory.PROJECTOR);
            } else {
                dto.setCategory(ResourceCategory.LECTURE_HALL);
            }
        }

        return dto;
    }

}