const inquirer = require('inquirer');
const express = require('express');
const mysql = require('mysql2');

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
        exit()
      }
    })
}



//Present all departments
const viewDepartments = async () => {
  db.promise().query('SELECT * FROM departments',  function (err, results) {   
  }).then(() => {
    exit()
  })
    
  
}

//Present all roles
const viewRoles = () => {
  db.query('SELECT * FROM roles', function (err, results) {
    endPrompt()
  })
}


//Present all employees
const viewEmployees = () => {
  db.query('SELECT * FROM employees', function (err, results) {

    endPrompt()
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

  // Pull all the available departments
  db.query('SELECT * FROM departments', function (err, results) {

    //Put the apartments into an Array for Inquirer
    let dbChoices = results.map(a => a.name)

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
        choices: dbChoices,
        name: 'department',
      }
    ])
      .then((answers) => {

        //Then take that list of departments and find the department Id with the matching selection
        let chosenDB = results.find(a => a.name == answers.department)

        //Insert the role
        db.query('INSERT INTO roles (title,salary,department_id) VALUES (?,?,?)', [answers.title, answers.salary, chosenDB.id], function (err, results) {

          //Then View the roles to confirm it was inserted
          viewRoles()
        });
      });

  }
  )
}


//Add employee
const addEmployee = () => {

  //Pull all the available Roles 
  db.query('SELECT * FROM roles', function (err, roles) {

    //Pull all the available roles and put them into an Array to be inserted into Inquirer
    let roleChoices = roles.map(a => a.title)

    //Pull all the available Employees
    db.query('SELECT * FROM employees', function (err, employees) {

      //Pull all the available employees and put them into an Array to be inserted into Inquirer
      let employeeChoices = employees.map(a => a.last_name)

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
          choices: roleChoices,
          name: 'role',
        },
        {
          type: 'list',
          message: 'Employee Mananger',
          choices: employeeChoices,
          name: 'manager',
        }
      ]).then((answers) => {

        //Take the chosen role and manager, find the correct IDs, and insert them into the query
        let chosenManager = employees.find(a => a.last_name == answers.manager)
        let chosenRole = roles.find(a => a.title == answers.role)

        //Write the to the database
        db.query('INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)', [answers.firstname, answers.lastname, chosenRole.id, chosenManager.id], function (err, results) {
          //Display the updated list
          viewEmployees()
        })
      })
    })
  })
}

//Update Employee
const updateEmployee = () => {

  //Pull all the available Roles 
  db.query('SELECT * FROM roles', function (err, roles) {

    //Pull all the available roles and put them into an Array to be inserted into Inquirer
    let roleChoices = roles.map(a => a.title)

    //Pull all the available Employees
    db.query('SELECT * FROM employees', function (err, employees) {

      //Pull all the available employees and put them into an Array to be inserted into Inquirer
      let employeeChoices = employees.map(a => a.last_name)

      //Prompt for new Employee
      inquirer.prompt([
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

      ]).then((answers) => {
        //Find the roll by the Title to find the ID
        let chosenRole = roles.find(a => a.title == answers.role)

        //Write the query
        db.query('UPDATE employees SET role_id = ? WHERE last_name = ?', [chosenRole.id, answers.employee], function (err, results) {

          //Display the updated list
          viewEmployees()
        })
      })
    })
  })
}

const exit = () => {
  process.exit()
}

const endPrompt = () => {

  inquirer.prompt({
    //Starting view options
    type: 'confirm',
    message: 'Return to menu?',
    name: 'endPrompt',
  }).then((answer) => {
    console.log(answer.endPrompt)
    if (answer.endPrompt == true) {
      initPrompt()
    } else {
      exit()
    }
  })
}