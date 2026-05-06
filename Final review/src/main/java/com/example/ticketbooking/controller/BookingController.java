package com.example.ticketbooking.controller;

import com.example.ticketbooking.model.Booking;
import com.example.ticketbooking.model.Event;
import com.example.ticketbooking.repository.BookingRepository;
import com.example.ticketbooking.repository.EventRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private EventRepository eventRepository;

    @PostMapping
    @Transactional
    public ResponseEntity<Booking> createBooking(@Valid @RequestBody Booking bookingRequest) {
        Event event = eventRepository.findById(bookingRequest.getEvent().getId())
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (event.getAvailableTickets() < bookingRequest.getTicketsBooked()) {
            throw new RuntimeException("Not enough tickets available");
        }

        // Deduct tickets
        event.setAvailableTickets(event.getAvailableTickets() - bookingRequest.getTicketsBooked());
        eventRepository.save(event);

        // Calculate total amount
        double totalAmount = event.getPrice() * bookingRequest.getTicketsBooked();
        bookingRequest.setTotalAmount(totalAmount);
        bookingRequest.setEvent(event);

        Booking savedBooking = bookingRepository.save(bookingRequest);
        return new ResponseEntity<>(savedBooking, HttpStatus.CREATED);
    }

    // ✅ NEW: Get all bookings (for Admin Dashboard)
    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {
        return bookingRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/history")
    public List<Booking> getBookingHistory(@RequestParam String email) {
        return bookingRepository.findByEmailOrderByEventDateTimeDesc(email);
    }
}
