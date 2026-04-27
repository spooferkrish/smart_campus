package com.project.smartcampus.controller;

import com.project.smartcampus.dto.ResourceDTO;
import com.project.smartcampus.enums.ResourceType;
import com.project.smartcampus.services.ResourceService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping({"/resources", "/api/resources"})
public class ResourceController {

    @Autowired
    private ResourceService service;

    // GET ALL
    @GetMapping
    public ResponseEntity<List<ResourceDTO>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    // CREATE
    @PostMapping
    public ResponseEntity<ResourceDTO> create(@Valid @RequestBody ResourceDTO dto) {
        return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED);
    }

    // GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<ResourceDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    // FILTER BY TYPE
    @GetMapping("/type/{type}")
    public ResponseEntity<List<ResourceDTO>> getByType(@PathVariable ResourceType type) {
        return ResponseEntity.ok(service.getByType(type));
    }

    // FILTER BY LOCATION
    @GetMapping("/location/{location}")
    public ResponseEntity<List<ResourceDTO>> getByLocation(@PathVariable String location) {
        return ResponseEntity.ok(service.getByLocation(location));
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<ResourceDTO> update(@PathVariable Long id, @Valid @RequestBody ResourceDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
