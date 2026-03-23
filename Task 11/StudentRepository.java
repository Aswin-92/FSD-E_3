package com.example.demo.repository;

import com.example.demo.entity.Student;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.domain.*;
import java.util.*;

public interface StudentRepository extends JpaRepository<Student, Long> {

    // 1. Find by department
    List<Student> findByDepartment(String department);

    // 2. Find students with age > given value
    List<Student> findByAgeGreaterThan(int age);

    // 3. Find by department AND age
    List<Student> findByDepartmentAndAgeGreaterThan(String dept, int age);

    // 4. Sorting (by age)
    List<Student> findByDepartment(String dept, Sort sort);

    // 5. Pagination
    Page<Student> findByDepartment(String dept, Pageable pageable);

    // 6. Custom JPQL Query
    @Query("SELECT s FROM Student s WHERE s.age > :age")
    List<Student> getStudentsAboveAge(int age);
}