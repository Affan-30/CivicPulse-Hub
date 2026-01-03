package com.example.civicpulse.dto;

public class OfficerDto {
    public OfficerDto(Long id, String name, String department) {
        this.id = id;
        this.name = name;
        this.department = department;
    }

    public Long getId() {
        return id;

    }

    public void setId(Long id) {
        this.id = id;
    }

    private Long id;
    private String email;
    private String password;
    private String name;
    private String department;
    private Long phone;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public OfficerDto(String name, String department, String email, String password, Long phone) {
        this.name = name;
        this.department = department;
        this.email = email;
        this.password = password;
        this.phone = phone;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Long getPhone() {
        return phone;
    }

    public void setPhone(Long phone) {
        this.phone = phone;
    }
}
