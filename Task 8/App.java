package com.example;

import org.springframework.beans.factory.BeanFactory;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class App {

    public static void main(String[] args) {

        BeanFactory factory =
                new ClassPathXmlApplicationContext("applicationContext.xml");

        EmployeeService service = factory.getBean(EmployeeService.class);

        service.addEmployee(new Employee(1, "Arun", 50000));
        service.addEmployee(new Employee(2, "Priya", 45000));

        service.displayEmployees();
    }
}