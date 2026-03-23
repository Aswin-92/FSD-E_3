package com.example.demo.service;

import com.example.demo.entity.Student;
import com.example.demo.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class StudentService {

    @Autowired
    private StudentRepository repo;

    // Save student (for POST)
    public Student save(Student s) {
        return repo.save(s);
    }

    // Get by department
    public List<Student> getByDepartment(String dept) {
        return repo.findByDepartment(dept);
    }

    // Get by age
    public List<Student> getByAge(int age) {
        return repo.findByAgeGreaterThan(age);
    }

    // Sorting
    public List<Student> getSorted(String dept) {
        return repo.findByDepartment(dept, Sort.by("age").descending());
    }

    // Pagination
    public Page<Student> getPaginated(String dept, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return repo.findByDepartment(dept, pageable);
    }
}