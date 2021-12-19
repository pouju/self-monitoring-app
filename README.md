# Update 19.12.2021

App is available in [Heroku](https://app-for-self-monitoring.herokuapp.com/)

The project was originally done on Web Software Development course autumn 2020 roughly after a bit over 1 year university studies.
I revisited it to fix problems and get it run again in Heroku.
In addition I added docker-compose support to run project easily locally without elephantSQL.

To run set POSTGRES_* variables in .env file (copy example.env) and set DOCKER variable to value `true` instead of value (`false`).

Below is instructions to run without docker but if you prefer docker just cd to src folder and run `docker-compose up --build`. Note that db data is not mounted any volume so you will lose it after closing container or you can freely edit docker-compose.yml and add volume for it.

Tests are not currently configured for docker compose (db etc...)
To run tests you can refer instructions below.

---

# Documentation

## Content

- Overview
- Heroku address
- How to set up and run the application
- How to set up and run the tests
- Implementation and comments based on "epic checklist"

## Overview

Application made as a course project in the course Web Software development 2020.

The main purpose is to provide users a web application that gives users a change to report their daily behaviors.
Users can make reports on mornings and evenings. Reports are stored to database. Reporting requires that user
has registered to the application.

### Landing page in */*

Landing page of application tells the basic idea of the app and provides a menu and links to access different pages.
It also tells overview of every users' mood today and yesterday and gives a "conclusion"

Landing page can take a while to load as it contains a few images

### Reports in */behavior/reporting*

Reporting is done with forms which guides the user to fill right values.
Morning and evening reporting are done with separate forms

User can report these behaviors:
- Sleep duration (in hours)
- Sleep quality (in range 1-5)
- Time spent on sports and exercise (in hours)
- Time spent studying (in hours)
- Regularity and quality of eating (in range 1-5)
- Both morning and evening moods (in range 1-5)

### Summaries in */behavior/summary*

Application provides  summarization from user's personal reports
- Week summarization from last full week
- Month summarization from last full month

User can select also specific week or month and get summary from that period
 
In addition there is page */behavior/search* where user can check only one day reports

### Registration in */auth/registration*

Registration requires email and password that is at least 4 characters long.

### Login in */auth/login*

Users without authentication can access only landing, login and registration pages. (also API can be accessed)
If user wants to do reporting or see summaries, they should login with account that has been registered.
If user tries to access for example /behavior/reporting without authentication, user is shown 401- unauthorized page
and user is redirected to login page.

User can log out in */auth/logout*.

### APIs

There is two APIs available:
- */api/summary* returns summary (in JSON) generated over all users from last seven days (including today)
- */api/summary/:year/:month/:day* returns summary for the given day (in JSON) generated over all users 

## Heroku address

The application is deployed in Heroku and can be accessed with the link below  
[App For Self Monitoring](https://app-for-self-monitoring.herokuapp.com/) DEPRECATED


## How to set up and run the application

If you want set up application to run local on your own computer follow these instructions.

Install Deno by following [instructions](https://deno.land/manual/getting_started/installation).
deno upgrade --version 1.5.3

Then go to [ElephantSQL](https://www.elephantsql.com/) and login or create user if you don't have yet.
Create a new database instance and select free Tiny Turtle instance. In the new created instance page go to *browser*
page and run CREATE TABLE statements. These statements can be found from folder **doc** and there is a file
**database_schemas.txt** that contains required SQL statements. You can copy paste all and paste those to 
ElephantSQL browser window.

After finishing this go to *Details* page in ElephantSQL where you can find
your database credentials. Now look .env file in **src** folder. This file contains all environment variables
that app needs to run locally. Now you are setting variables under comment (#) "Database credentials for production".
You need to fill these variables below. .env file contains instructions/comments which you should put to those.

- PGHOST=
- PGDATABASE=
- PGPASSWORD=

After these is set check that TEST_ENVIRONMENT- variable in .env file is 'false' and PORT is 5432.

Now you have all set and you can run application. Check, that you are in *src* folder in terminal.
(Meaning not the root directory but src :) ). Then run the command below:

> deno run --allow-read --allow-net --allow-env --unstable app-launch.js

If everything is ok app should start and console prints:  
>USING PRODUCTION CREDENTIALS (ELEPHANT_SQL)  
>USING CONNECTION POOLING FOR PRODUCTION  
>APP STARTED

Now you can access to landing page at *localhost:7777*

**Happy reporting!**

## How to set up and run the tests

Running Deno tests is quite an easy. Just create a new database instance in ElephantSQL like in above is explained.
**BUT** you don't need to create any tables as tests will create all tables automatically and also clear tables
between tests.

Put again database credentials from ElephantSQL to .env file. There are different variables for test database credentials.
**NOW** set the TEST_ENVIRONMENT- variable to value 'true'.

Then you can run test with the command below:  

> deno test --allow-read --allow-net --allow-env --unstable

If everything is set right console logs:

>USING TEST CREDENTIALS  
>USING ONE CLIENT FOR TESTING  
>TESTING STARTED  

All you need is to wait that all test are run. After test are run **REMEMBER** to change the TEST_ENVIRONMENT- 
variable back to 'false' before starting application for production.

**Happy testing!**

## Implementation and comments based on "epic checklist"

Below I have listed all I have done.

### Application structure

    - Application divided into logical folders
        - All is divided accorfing to course material on Structuring Web Application
        - src- folder contains the actual app and source code
        - doc- folder contains database schemas
    - Dependencies exported from deps.js
        - All dependeries are exported from deps.js
        - Config.js imports one dependency itself due to its nature
    - Project launched from app.js, which is in the **src** folder
        - I had a few small problems with git and heroku and thats why app.js is not in root folder
        - Also its clearer to use src and doc folders
    - Configurations in a separate folder (configurations are in config folder)
        - Test configurations separate from production configurations
        - Configurations loaded from environmental variables or e.g. dotenv -files (Done by using dotenv file)

### Users

    - Email and password stored in the database for each user
        - Password not stored in plaintext format
        - Emails must be unique (same email cannot be stored twice in the database)
    - Users can register to the application
    - Registration form is accessible at /auth/registration
        - Registration uses labels to clarify the purpose of the input fields
        - Registration form is validated on the server
            - Email must be a valid email (clarified from before, i.e. email must be validated - no need to e.g. send a mail to the address though)
            - Password must contain at least 4 characters
            - Validation errors shown on page
            - In case of validation errors, email field is populated (password is not)
    - User-specific functionality is structured into logical parts (in my app this is registerLoginController.js)

### Authentication

    - Application uses session-based authentication
    - Login form is accessible at /auth/login
        - Login form asks for email and password
        - Login uses labels to clarify the purpose of the input fields
        - Login form has a link to the registration form
        - If the user types in an invalid email or password, a message "Invalid email or password" is shown on the login page.
            - Form fields are not populated
    - Authentication functionality is structured into logical parts (in my app this is registerLoginController.js).
    - Application has a logout button that allows the user to logout (logging out effectively means clearing the session)
        - Logout functionality is at /auth/logout
            - if /auth/logout is accessed as anonymous user is redirected to landing page

### Middleware

    - The application has middleware that logs all the errors that occurred within the application
    - The application has middleware that logs all requests made to the application
        - Logged information contains current time, request method, requested path, and user id (or anonymous if not authenticated)
    - The application has middleware that controls access to the application
        - Landing page at / is accessible to all
        - Paths starting with /api are accessible to all
        - Paths starting with /auth are accessible to all
        - Other paths require that the user is authenticated
            - Non-authenticated users are redirected to the login form at /auth/login
                - NOTE! I implemented this by showing user a page that show that page requires authentication
                - That page uses client side javascript for redirection (there is also links provided)
    - Application has middleware that controls access to static files
        - Static files are placed under /static
        - NOTE! I made static folder pub (in /static/pub) which is accessible for all and other files in static are private
        - /static/pub contained images but I removed those for submission as was required
            - utility was not still changed
    - Middleware functionality is structured into logical parts (in middlewares folder).

### Reporting

    - Reporting functionality is available under the path /behavior/reporting
    - Reporting cannot be done if the user is not authenticated
    - When accessing /behavior/reporting, user can choose whether morning or evening is being reported
        - User reporting form depends on selection
            - NOTE! Site has a menu in top of the page where is links to report morning and evening
            - Morning and evening forms have own pages
        - Page at /behavior/reporting shows whether morning and/or evening reporting for today has already been done
            - NOTE! In menu this is called 'day status'

    - Morning reporting form contains fields for date, sleep duration, sleep quality, and generic mood
        - Date is populated by default to today, but can be changed
            - Form has a date field for selecting the date
        - Sleep duration is reported in hours (with decimals)
        - Sleep quality and generic mood are reported using a number from 1 to 5, where 1 corresponds to very poor and 5 corresponds to excellent.
            - Form has a slider (e.g. range) for reporting the value
        - Form contains labels that clarify the purpose of the input fields and the accepted values
            - Form fields are validated
            - Sleep duration must be entered, must be a number (can be decimal), and cannot be negative
            - Sleep quality and generic mood must be reported using numbers between 1 and 5 (integers).
            - In case of validation errors, form fields are populated

    - Evening reporting form contains fields for date, time spent on sports and exercise, time spent studying, regularity and quality of eating, and generic mood
        - Date is populated by default to today, but can be changed
            - Form has a date field for selecting the date
    - Time spent on sports and exercise and time spent studying are reported in hours (with decimals)
    - Regularity and quality of eating and generic mood are reported using a number from 1 to 5, where 1 corresponds to very poor and 5 corresponds to excellent.
        - Form has a slider (e.g. range) for reporting the value
    - Form contains labels that clarify the purpose of the input fields and the accepted values
        - Form fields are validated
        - Time spent on sports and exercise and time spent studying are reported in hours must be entered, must be a number (can be decimal), and cannot be negative
        - Regularity and quality of eating and generic mood must be reported using numbers between 1 and 5 (integers).
        - In case of validation errors, form fields are populated
    
    - Reported values are stored into the database
        - The database schema used for reporting works for the task
        - Reporting is user-specific (all reported values are stored under the currently authenticated user)
        - If the same report is already given (e.g. morning report for a specific day), then the older report is removed
    - Reporting functionality structured into logical parts (separate views folder, separate controller for reporting, service(s), ...)

### Summarization

    - Summary functionality is available under the path /behavior/summary
    - Main summary page contains the following statistics, by default shown for the last week and month
        - NOTE! I interpret last week and last month as last full week and last full month
        
        - Weekly average (by default from last week)
            - Average sleep duration
            - Average time spent on sports and exercise
            - Average time spent studying
            - Average sleep quality
            - Average generic mood
            
        - Monthly average (by default from last month)
            - Average sleep duration
            - Average time spent on sports and exercise
            - Average time spent studying
            - Average sleep quality
            - Average generic mood

    - Summary page has a selector for week and month. Using input type="week" and input type="month".
        - When the week is changed, the weekly average will be shown for the given week.
        - When the month is changed, the monthly average will be shown for the given month.
        - If no data for the given week exists, the weekly summary shows text suggesting that no data for the given week exists.
        - If no data for the given month exists, the monthly summary shows text suggesting that no data for the given month exists.
    - Summary data / averages calculated within the database
        - When doing weekly reporting, the weekly averages are calculated in the database
        - When doing monthly reporting, the monthly averages are calculated in the database
    - Summarization page contains statistics only for the current user.

### Landing page (i.e. page at the root path of the application)

    - Landing page briefly describes the purpose of the application
    - Landing page shows a glimpse at the data and indicates a trend
        - Landing page shows users' average mood for today and and yesterday
        - If the average mood yesterday was better than today, tells that things are looking gloomy today
        - If the average mood yesterday was was worse today, tells that things are looking bright today
    - Landing page has links / buttons for login and register functionality
        - NOTE! These links are showed only for aninymous user
        - So these are nor showed for logged in users as they initually don't need those
    - Landing page has links / buttons for reporting functionality
        - NOTE! There is menu/navbar in top panel which contains links

### Testing

    - The application has at least 20 meaningful automated tests. All tests detect if e.g. tested functionality is changed so that it no longer works as expected.

### Security

    - Passwords are not stored in plaintext (hashed)
    - Field types in the database match the actual content (i.e., when storing numbers, use numeric types)
    - Database queries done using parameterized queries (i.e., code cannot be injected to SQL queries)
    - Data retrieved from the database are sanitized (i.e., if showing content from database, using <%= ... %> instead of <%- ...%> unless explicitly stated what for).
    - Users cannot access data of other users.
    - Users cannot post reports to other users' accounts.

### Database

    - Expensive calculations such as calculating averages are done in the database
    - Indices are used when joining tables if the queries are such that they are used often
    - Database uses a connection pool
    - Database credentials are not included in the code

### User interface / views

    - Views are stored in a separate folder
    - User interface uses partials for header content
    - User interface uses partials for footer content
    - Recurring parts are separated into own partials (e.g. partial for validation errors)
    - Pages with forms contain functionality that guides the user
        - Labels are shown next to form fields so that the user knows what to enter to the form fields
        - Form fields are validated and user sees validation errors close to the form fields
        - In the case of validation errors, form fields are populated (with the exception of the login page)
    - User interface uses a style library or self-made stylesheets
        - Bootstrap is used
        - Twitter Bootstrap libraries are used over a content delivery network
    - Different pages of the application follow the same style
    - User sees if the user has logged in (e.g. with a message 'Logged in as my@email.net' shown at the top of the page)
        - in navbar

### APIs

    - The application provides an API endpoint for retrieving summary data generated over all users in a JSON format
    - The API is accessible by all
    - The API allows cross-origin requests
    - Endpoint /api/summary provides a JSON document with sleep duration, time spent on sports and exercise, time spent studying, sleep quality, and generic mood averaged over the last 7 days
    - Endpoint /api/summary/:year/:month/:day provides a JSON document with averages for sleep duration, time spent on sports and exercise, time spent studying, sleep quality, and generic mood for the given day

### Deployment

    - Application is available and working in an online location (e.g. Heroku) at an address provided in the documentation
        - https://app-for-self-monitoring.herokuapp.com/
    - Application can be run locally following the guidelines in documentation
        - given above
        
### Documentation

    - Documentation contains necessary CREATE TABLE statements needed to create the database used by the application
        - in database_schemas.txt in doc folder
    - Documentation contains the address at which the application can currently be accessed
        - https://app-for-self-monitoring.herokuapp.com/
    - Documentation contains guidelines for running the application
        - given above
    - Documentation contains guidelines for running tests
        - given above