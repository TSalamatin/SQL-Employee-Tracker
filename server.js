const inquirer = require('inquirer');
const fs = require('fs');
const express = require('express');
const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const db = mysql.createConnection(
  {
    host: 'localhost',
    // MySQL username,
    user: 'root',
    // MySQL password
    password: '',
    database: 'employees_db'
  },
  console.log(`Connected to the employees_db database.`)
);

// Default response for any other request (Not Found)
app.use((req, res) => {
  res.status(404).end();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});




const initPrompt = () => {
  //Prompt the User
  inquirer.prompt(
    {
      //Starting view options
      type: 'list',
      message: 'Please Select an Option',
      choices: [
        'View All Departments',
        'View All Roles',
        'View All Employees',
        'Add a Department',
        'Add a Role',
        'Add An Employee',
        'Update an Employee Role'],
      name: 'opener',
    })
    .then((answers) => {
      //Decide which function to call
      if (answers === 'View All Departments') {
        viewDepartments()
      }

      if (answers === 'View All Roles') {
        viewRoles()
      }

      if (answers === 'View All Employees') {
        viewEmployees()
      }

      if (answers === 'Add a Department') {
        addDepartment()
      }

      if (answers === 'Add a Role') {
        addRole()
      }

      if (answers === 'Add An Employee') {
        addEmployee()
      }

      if (answers === 'Update an Employee Role') {
        updateEmployeeEmployee()
      }
    })
}

//Present all departments
const viewDepartments = () => {
  db.query('SELECT * FROM departments', function (err, results) {
    res.status(200).send(results)
  })

}

//Present all roles
const viewRoles = () => {
  db.query('SELECT * FROM roles', function (err, results) {
    res.status(200).send(results)
  })
}

//Present all employees
const viewEmployees = () => {
  db.query('SELECT * FROM employees', function (err, results) {
    res.status(200).send(results)
  })
}

//Add department
const addDepartment = () => {
  //Prompt for department name
  inquirer.prompt([{
    type: 'input',
    message: 'New Department Title',
    name: 'name',
  }])
  .then((answers) => {
    //Add department
    db.query('INSERT INTO departments (name) VALUES (?)', answers.name, function (err, results) {
      //Display the list of departments
      viewDepartments()
    })
  })
  
}

//Add role
const addRole = () => {
  // Need to pull all the available departments

  //Prompt for title
  inquirer.prompt([
    {
      type: 'input',
      message: 'New Role Title',
      name: 'title',
    },
    {
      type: 'input',
      message: 'New Role Salary',
      name: 'salary',
    },
    {
      type: 'list',
      message: 'New Role Department',
      choices: '',
      name: 'department',
    }
  ])

  db.query('INSERT INTO roles (title,salary,department) VALUES (?,?,?)', [answers.title, answers.salary, answers.department], function (err, results) {
    console.log(results)
    res.status(200).send(results)
  })
}

//Add employee
const addEmployee = () => {
  //Need to pull all the available Roles and Managers
  
  //Prompt for new Employee
  inquirer.prompt([
    {
      type: 'input',
      message: 'Employee First Name',
      name: 'firstname',
    },
    {
      type: 'input',
      message: 'Employee Last Name',
      name: 'lastname',
    },
    {
      type: 'list',
      message: 'Employee Role',
      choices: '',
      name: 'role',
    },
    {
      type: 'list',
      message: 'Employee Mananger',
      choices: '',
      name: 'manager',
    }
  ])

  db.query('INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)', [first_name, last_name, role_id, manager_id], function (err, results) {
    console.log(results)
    res.status(200).send(results)
  })
}

//Update Employee
const updateEmployee = () => {


  db.query('SELECT * FROM employees', function (err, results) {
    res.status(200).send(results)
  })


}
