package com.example.invoiceservice.model;

import java.util.Date;

public class Invoice {
    private Long id;
    private Long customerId;
    private String invoiceNumber;
    private Double amount;
    private String description;
    private String status; // PENDING, PAID, OVERDUE
    private Date issueDate;
    private Date dueDate;
    private Date paidDate;
    
    public Invoice() {
    }
    
    public Invoice(Long id, Long customerId, String invoiceNumber, Double amount, 
                   String description, String status, Date issueDate, Date dueDate, Date paidDate) {
        this.id = id;
        this.customerId = customerId;
        this.invoiceNumber = invoiceNumber;
        this.amount = amount;
        this.description = description;
        this.status = status;
        this.issueDate = issueDate;
        this.dueDate = dueDate;
        this.paidDate = paidDate;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getCustomerId() {
        return customerId;
    }
    
    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }
    
    public String getInvoiceNumber() {
        return invoiceNumber;
    }
    
    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }
    
    public Double getAmount() {
        return amount;
    }
    
    public void setAmount(Double amount) {
        this.amount = amount;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public Date getIssueDate() {
        return issueDate;
    }
    
    public void setIssueDate(Date issueDate) {
        this.issueDate = issueDate;
    }
    
    public Date getDueDate() {
        return dueDate;
    }
    
    public void setDueDate(Date dueDate) {
        this.dueDate = dueDate;
    }
    
    public Date getPaidDate() {
        return paidDate;
    }
    
    public void setPaidDate(Date paidDate) {
        this.paidDate = paidDate;
    }
}