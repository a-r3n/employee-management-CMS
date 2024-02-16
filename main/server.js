const inquirer = require('inquirer');
const mysql = require('mysql2/promise');

// Create a connection to the database
const connectToDatabase = async () => {
  return mysql.createConnection({
    host: 'localhost',
    user: 'root', // replace with your database user
    password: 'password', // replace with your database password
    database: 'employees_db'
  });
};

const main = async () => {
  const connection = await connectToDatabase();
  await promptUser(connection);
};

const promptUser = async (connection) => {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        'View all departments',
        'View all roles',
        'View all employees',
        'Add a department',
        'Add a role',
        'Add an employee',
        'Update an employee role',
        'Exit'
      ]
    }
  ]);

  switch (action) {
    case 'View all departments':
      await viewDepartments(connection);
      break;
    case 'View all roles':
      await viewRoles(connection);
      break;
    case 'View all employees':
      await viewEmployees(connection);
      break;
    case 'Add a department':
      await addDepartment(connection);
      break;
    case 'Add a role':
      await addRole(connection);
      break;
    case 'Add an employee':
      await addEmployee(connection);
      break;
    case 'Update an employee role':
      await updateEmployeeRole(connection);
      break;
    default:
      console.log('Goodbye!');
      await connection.end();
      return;
  }

  await promptUser(connection);
};

const viewDepartments = async (connection) => {
  const [rows] = await connection.execute(`SELECT id, department_name AS 'Department' FROM department`);
  console.table(rows);
};

const viewRoles = async (connection) => {
  const [rows] = await connection.execute(`SELECT role.id, role.title AS 'Title', department.department_name AS 'Department', role.salary AS 'Salary'
                                           FROM role
                                           INNER JOIN department ON role.department_id = department.id`);
  console.table(rows);
};

const viewEmployees = async (connection) => {
  const [rows] = await connection.execute(`SELECT employee.id, employee.first_name AS 'First Name', employee.last_name AS 'Last Name', role.title AS 'Title', department.department_name AS 'Department', role.salary AS 'Salary', CONCAT(manager.first_name, ' ', manager.last_name) AS 'Manager'
                                           FROM employee
                                           LEFT JOIN role ON employee.role_id = role.id
                                           LEFT JOIN department ON role.department_id = department.id
                                           LEFT JOIN employee manager ON employee.manager_id = manager.id`);
  console.table(rows);
};

const addDepartment = async (connection) => {
  const { departmentName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'departmentName',
      message: 'What is the name of the department?',
      validate: input => input ? true : 'Please enter a department name.'
    }
  ]);

  await connection.execute(`INSERT INTO department (department_name) VALUES (?)`, [departmentName]);
  console.log(`Department '${departmentName}' added successfully!`);
};

const addRole = async (connection) => {
  const [departments] = await connection.execute(`SELECT id, department_name FROM department`);

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: 'What is the title of the role?',
      validate: input => input ? true : 'Please enter a role title.'
    },
    {
      type: 'input',
      name: 'salary',
      message: 'What is the salary of the role?',
      validate: input => !isNaN(parseFloat(input)) && isFinite(input) ? true : 'Please enter a valid salary.'
    },
    {
      type: 'list',
      name: 'departmentId',
      message: 'Which department does the role belong to?',
      choices: departments.map(department => ({ name: department.department_name, value: department.id }))
    }
  ]);

  await connection.execute(`INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`, [answers.title, answers.salary, answers.departmentId]);
  console.log(`Role '${answers.title}' added successfully!`);
};

const addEmployee = async (connection) => {
  const [roles] = await connection.execute(`SELECT id, title FROM role`);
  const [managers] = await connection.execute(`SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employee WHERE manager_id IS NULL`);

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'firstName',
      message: "What is the employee's first name?",
      validate: input => input ? true : 'Please enter a first name.'
    },
    {
      type: 'input',
      name: 'lastName',
      message: "What is the employee's last name?",
      validate: input => input ? true : 'Please enter a last name.'
    },
    {
      type: 'list',
      name: 'roleId',
      message: "What is the employee's role?",
      choices: roles.map(role => ({ name: role.title, value: role.id }))
    },
    {
      type: 'list',
      name: 'managerId',
      message: "Who is the employee's manager?",
      choices: [{ name: 'None', value: null }].concat(managers.map(manager => ({ name: manager.name, value: manager.id })))
    }
  ]);

  await connection.execute(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`, [answers.firstName, answers.lastName, answers.roleId, answers.managerId]);
  console.log(`Employee '${answers.firstName} ${answers.lastName}' added successfully!`);
};

const updateEmployeeRole = async (connection) => {
  const [employees] = await connection.execute(`SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employee`);
  const [roles] = await connection.execute(`SELECT id, title FROM role`);

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'employeeId',
      message: "Which employee's role do you want to update?",
      choices: employees.map(employee => ({ name: employee.name, value: employee.id }))
    },
    {
      type: 'list',
      name: 'newRoleId',
      message: "What is the employee's new role?",
      choices: roles.map(role => ({ name: role.title, value: role.id }))
    }
  ]);

  await connection.execute(`UPDATE employee SET role_id = ? WHERE id = ?`, [answers.newRoleId, answers.employeeId]);
  console.log(`Employee's role updated successfully!`);
};

main().catch(err => console.error(err));
