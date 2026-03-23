package com.example.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import com.example.model.Employee;

@Controller
public class EmployeeController {

    @RequestMapping("/employee")
    public String showEmployee(Model model) {

        Employee emp = new Employee(101, "Indrajith", "IT");

        model.addAttribute("emp", emp);

        return "employee";
    }
}