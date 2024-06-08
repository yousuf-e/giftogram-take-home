# Giftogram Take Home 
- Author: Yousuf Elkhoga
- Time elapsed: Sat June 8 2:36 PM ->  

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

- [ ] Create register endpoint

- [ ] test register endpoint

- [ ] create error handling for register 
endpoint 

- [ ] ? optional: compose a MySQL Store dependency to make code more flexible/testable

- [ ] repeat above 3 for login, view, send and list

- [ ] SQL dump

- [ ] evaluate security and usability


## Evaluations
- use a pool instead of connection for the db
- creating the tables if not exists on connection (not sure how to do that for mysql + docker yet .. will figure out later)
- more graceful error handling for db connection failure
- 