package com.example.ticketbooking.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "User name is required")
    @Column(name = "user_name")
    private String userName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Department is required")
    private String department;

    @NotNull(message = "Number of tickets is required")
    @Min(value = 1, message = "At least 1 ticket must be booked")
    @Column(name = "tickets_booked")
    private Integer ticketsBooked;

    @NotNull(message = "Total amount is required")
    @Column(name = "total_amount")
    private Double totalAmount;

    @Column(name = "upi_id")
    private String upiId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    // Constructors
    public Booking() {}

    public Booking(String userName, String email, String department, Integer ticketsBooked, Double totalAmount, String upiId, Event event) {
        this.userName = userName;
        this.email = email;
        this.department = department;
        this.ticketsBooked = ticketsBooked;
        this.totalAmount = totalAmount;
        this.upiId = upiId;
        this.event = event;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Integer getTicketsBooked() { return ticketsBooked; }
    public void setTicketsBooked(Integer ticketsBooked) { this.ticketsBooked = ticketsBooked; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public String getUpiId() { return upiId; }
    public void setUpiId(String upiId) { this.upiId = upiId; }

    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }
}
