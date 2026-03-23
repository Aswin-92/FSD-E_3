package com.example.demo.service;

import com.example.demo.entity.Product;
import com.example.demo.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ProductService {

    @Autowired
    private ProductRepository repo;

    // CREATE
    public Product save(Product p) {
        return repo.save(p);
    }

    // READ ALL
    public List<Product> getAll() {
        return repo.findAll();
    }

    // READ ONE
    public Product getById(Long id) {
        return repo.findById(id).orElse(null);
    }

    // UPDATE
    public Product update(Long id, Product p) {
        Product existing = repo.findById(id).orElse(null);

        if (existing != null) {
            existing.setName(p.getName());
            existing.setPrice(p.getPrice());
            existing.setCategory(p.getCategory());
            return repo.save(existing);
        }

        return null;
    }

    // DELETE
    public String delete(Long id) {
        repo.deleteById(id);
        return "Deleted successfully";
    }
}