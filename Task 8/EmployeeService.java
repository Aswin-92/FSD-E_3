package com.example;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;
@Component
public class EmployeeService {
	private List<Employee> employeeList = new ArrayList<>();

    public void addEmployee(Employee emp) {
        employeeList.add(emp);
    }

    public void displayEmployees() {
        for (Employee e : employeeList) {
            System.out.println(e);
        }
    }

}
