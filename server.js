const inquirer = require('inquirer');
const express = require('express');
const mysql = require('mysql2/promise');
const cTable = require('console.table')

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


// Connect to database
const db = mysql.createPool(
  {
    host: 'localhost',
    // MySQL username,
    user: 'root',
    // MySQL password
    password: '4741',
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
  initPrompt()
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
        'Update an Employee Role',
        'Close Menu'
      ],
      name: 'opener',
    })
    .then((answers) => {
      //Decide which function to call
      if (answers.opener == 'View All Departments') {
        viewDepartments()
      }

      if (answers.opener == 'View All Roles') {
        viewRoles()
      }

      if (answers.opener == 'View All Employees') {
        viewEmployees()
      }

      if (answers.opener == 'Add a Department') {
        addDepartment()
      }

      if (answers.opener == 'Add a Role') {
        addRole()
      }

      if (answers.opener == 'Add An Employee') {
        addEmployee()
      }

      if (answers.opener == 'Update an Employee Role') {
        updateEmployee()
      }
      if (answers.opener == 'Close Menu') {
        process.exit()


      }
    })
}



//Present all departments
const viewDepartments = async () => {
  const database = await db.query('SELECT * FROM departments')
  const data = database[0]
  console.table(data)


  initPrompt()
}

//Present all roles
const viewRoles = async () => {
  const database = await db.query('select roles.id, roles.title, roles.salary, departments.department from roles, departments where roles.department_id = departments.id;')
  const data = database[0]
  
  console.table(data)


  initPrompt()
}


//Present all employees
const viewEmployees = async () => {
  const database = await db.query('SELECT e.id, e.first_name, e.last_name, CONCAT(m.first_name, " ", m.last_name) AS manager_name, roles.title, roles.salary, departments.department  FROM employees e  INNER JOIN roles ON e.role_id = roles.id  INNER JOIN departments ON roles.department_id = departments.id LEFT JOIN employees m ON e.manager_id=m.id;')

  let data = database[0]

//Now, when you get the manager_id, take the first name and last name of the manager



console.table(data)
  initPrompt()
}

//Add department
const addDepartment = () => {

  //Prompt for department name
  inquirer.prompt([{
    type: 'input',
    message: 'New Department Title',
    name: 'department',
  }])
    .then((answers) => {

      //Add department
      db.query('INSERT INTO departments (department) VALUES (?)', answers.department)
        .then(() => {
          //Display the list of departments
          viewDepartments()
        })
    })

}

//Add role
const addRole = async () => {

  // Pull all the available departments
  const results = await db.query('SELECT * FROM departments')
  const choices = results[0]
  console.table(choices)
  const dbChoices = choices.map(department => department.department)

  //Prompt for title
  const answers = await inquirer.prompt([
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
      choices: dbChoices,
      name: 'department',
    }
  ])

  
  //Then take that list of departments and find the department Id with the matching selection
  let chosenDB = await choices.find(choices => choices.department == answers.department)
  
  //Insert the role
  await db.query('INSERT INTO roles (title,salary,department_id) VALUES (?,?,?)', [answers.title, answers.salary, chosenDB.id])
  //Then View the roles to confirm it was inserted
  viewRoles()

};

//Add employee
const addEmployee = async () => {

  // Pull all the available Roles and Employees
  let [roleData, employeeData] = await Promise.all([
    db.query('SELECT * FROM roles'),
    db.query('SELECT * FROM employees'),
  ]);
  //Slice off the metadata
  let roles = roleData[0]
  let employees = employeeData[0]

  // Map role and employee choices
  const roleChoices = roles.map(a => a.title);
  const employeeChoices = employees.map(a => a.last_name);

  // Prompt for new Employee
  const answers = await inquirer.prompt([
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
      choices: roleChoices,
      name: 'role',
    },
    {
      type: 'list',
      message: 'Employee Mananger',
      choices: employeeChoices,
      name: 'manager',
    }
  ])

  // Find the chosen role and manager and get their IDs
  const chosenManager = employees.find(a => a.last_name === answers.manager);
  const chosenRole = roles.find(a => a.title === answers.role);
  
  // Insert the new employee into the database
  await db.query('INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)', [answers.firstname, answers.lastname, chosenRole.id, chosenManager.id])
  .then(()=>{
    // Display the updated list of employees
  viewEmployees();
  })
  
}

// Update Employee
const updateEmployee = async () => {
  // Pull all the available Roles
  const roleData = await db.query('SELECT * FROM roles')
  //Slice Metadata
  const roles = roleData[0]
  // Map role choices
  const roleChoices = roles.map(a => a.title);

  // Pull all the available Employees
  const employeeData = await db.query('SELECT * FROM employees')
  //Slice Metadata
  const employees = employeeData[0]
  // Map employee choices
  const employeeChoices = employees.map(a => a.last_name);

  // Prompt for new Employee
  answers = await inquirer.prompt([
    {
      type: 'list',
      message: 'Select an Employee',
      choices: employeeChoices,
      name: 'employee',
    },
    {
      type: 'list',
      message: 'Update their Role',
      choices: roleChoices,
      name: 'role',
    },
  ])
  // Find the role by the Title to find the ID
  let chosenRole = roles.find(roles => roles.title == answers.role);

  // Write the query
  await db.query('UPDATE employees SET role_id = ? WHERE last_name = ?', [chosenRole.id, answers.employee])

  // Display the updated list
  viewEmployees();


};


