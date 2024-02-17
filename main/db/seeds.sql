-- Populate the department table
INSERT INTO department (department_name) VALUES
('Engineering'),
('Human Resources'),
('Finance'),
('Marketing'),
('Sales'),
('Customer Support'),
('Research and Development'),
('Product Management'),
('Information Technology'),
('Operations');

-- Populate the role table
-- Note: The department_id should correspond to the ids of the departments you inserted above.
-- Adjust the department_id values as necessary based on the actual ids in your department table.
INSERT INTO role (title, salary, department_id) VALUES
('Software Engineer', 70000, 1),
('Human Resources Manager', 65000, 2),
('Accountant', 55000, 3),
('Marketing Coordinator', 50000, 4),
('Sales Representative', 60000, 5),
('Customer Support Specialist', 45000, 6),
('Research Analyst', 70000, 7),
('Product Manager', 75000, 8),
('IT Support Specialist', 50000, 9),
('Operations Manager', 80000, 10);

-- Populate the employee table
-- Note: The role_id should correspond to the ids of the roles you inserted above.
-- The manager_id is optional and can be set to NULL if the employee does not have a manager.
-- Adjust the role_id and manager_id values as necessary based on the actual ids in your role and employee tables.
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
('John', 'Doe', 1, NULL),
('Jane', 'Smith', 2, 1),
('Emily', 'Jones', 3, 1),
('Michael', 'Brown', 4, 2),
('Jessica', 'Davis', 5, 2),
('William', 'Garcia', 6, 3),
('Elizabeth', 'Miller', 7, 3),
('David', 'Wilson', 8, 4),
('Sarah', 'Moore', 9, 4),
('James', 'Taylor', 10, 5);

