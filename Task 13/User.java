package com.example.usermanagement.model;

import jakarta.validation.constraints.*;

public class User {
    
    private Long id;
    private String name;
    private String email;
    private Integer age;
    private String phone;
    private String address;
    
    // Constructors
    public User() {}
    
    public User(Long id, String name, String email, Integer age, String phone, String address) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.age = age;
        this.phone = phone;
        this.address = address;
    }
    
    // Getters
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public Integer getAge() { return age; }
    public String getPhone() { return phone; }
    public String getAddress() { return address; }
    
    // Setters
    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setAge(Integer age) { this.age = age; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setAddress(String address) { this.address = address; }
}