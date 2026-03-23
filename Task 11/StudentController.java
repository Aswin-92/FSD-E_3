package com.example.demo.controller;

import com.example.demo.entity.Student;
import com.example.demo.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/students")
public class StudentController {

    @Autowired
    private StudentService service;

    // 1. Add student
    @PostMapping
    public Student addStudent(@RequestBody Student s) {
        return service.save(s);
    }

    // 2. Get by department
    @GetMapping("/department/{dept}")
    public List<Student> getByDepartment(@PathVariable String dept) {
        return service.getByDepartment(dept);
    }

    // 3. Get by age
    @GetMapping("/age/{age}")
    public List<Student> getByAge(@PathVariable int age) {
        return service.getByAge(age);
    }

    // 4. Sorting
    @GetMapping("/sorted/{dept}")
    public List<Student> getSorted(@PathVariable String dept) {
        return service.getSorted(dept);
    }

    // 5. Pagination
    @GetMapping("/page/{dept}")
    public Page<Student> getPaginated(
            @PathVariable String dept,
            @RequestParam int page,
            @RequestParam int size) {
        return service.getPaginated(dept, page, size);
    }
}