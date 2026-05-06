package com.example.ticketbooking.controller;

import com.example.ticketbooking.model.Event;
import com.example.ticketbooking.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private EventRepository eventRepository;

    @GetMapping
    public List<Event> getAllEvents() {
        List<Event> events = eventRepository.findAll();
        if (events.isEmpty()) {
            // Seed some data if empty
            Event e1 = new Event("Tech Fest 2026", "Computer Science", LocalDateTime.now().plusDays(10), "Main Auditorium", 15.0, 100);
            Event e2 = new Event("AI Workshop", "Information Technology", LocalDateTime.now().plusDays(5), "Lab 3", 5.0, 50);
            Event e3 = new Event("Robotics Seminar", "Electronics", LocalDateTime.now().plusDays(20), "Conference Hall A", 10.0, 200);
            eventRepository.saveAll(List.of(e1, e2, e3));
            events = eventRepository.findAll();
        }
        return events;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        return eventRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Event> createEvent(@Valid @RequestBody Event event) {
        Event savedEvent = eventRepository.save(event);
        return new ResponseEntity<>(savedEvent, HttpStatus.CREATED);
    }
}
