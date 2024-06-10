# Giftogram Take Home 
- Author: Yousuf Elkhoga
- Time elapsed: Sat June 8 2:36 PM ->  3:46 PM | Sun June 9 1:45 PM -> 2:43 PM | Total ~2hrs
  - first session was mostly fiddling around w/ TS and MySQL, second was writing out all the routes, third was sql dump and optimizing 

## Instructions:
 To run; simply clone and then run
 ` docker compose up `
 to build/run the app and mysql_server images/containers. 


## TO DO:

- [X] Define data model
- Users: 
  - user_id
  - email 
  - password
  - first
  - last
- Messages:
  - message_id
  - sender_user_id FK user_id
  - receiver_user_id FK user_id
  - message
  - epoch

- [X] Write DDL to populate DB w/ tables and schema

- [X] Create register endpoint

- [X] test register endpoint

- [X] create error handling for register 
endpoint 

- [X] repeat above 3 for login, view, send and list

- [X] SQL dump 
  
- [ ] optimizations (just notes)
  - [ ] flesh out db.ts file for multi query
    - [ ] compose a MySQL Store dependency to make code more flexible/testable
  - [ ] add testing for the routes

- [x] evaluate security and usability


## Evaluations

### security

- More validation on inputs
  - The inputs parsed in the request body are not validated to ensure that they meet the criteria for inputs. While the use of a paramterized query library prevents injection attacks, the lack of governance surrounding inputs will result in typing issues later on. 
- Password hashing
  - Passwords are currently stored plaintext, and using a hashing library is an easy way to make this more secure. 
- Auth/sessions 
  - There is currently no authentication of users after login. A simple cookie or auth header can make this application much more secure. 

### usability
- Better error handling:
  - In my endpoints, I could implement more graceful error handling, for breaking vs non breaking issues. For example, I am throwing an exception for an unconnected db, but that is being handled by the same handler/logic for other errors. This is poor architecture and leads to confusion when debugging. Having more granular handling of errors allows for faster building down the road. 
- Closer adherence to REST API standards
  - REST recommends a Uniform interface for each resouce: ie, the verb should be explained by the HTTP method, where this principle is violated 
    - for ex: GET /users instead of GET /list_all_users, or POST /messages instead of POST /send_message. A
    - Also, /send_message sends a status code in the body of the response (and is the only endpoint that does that), when the status code is part of the HTTP response. 
