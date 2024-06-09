# Giftogram Take Home 
- Author: Yousuf Elkhoga
- Time elapsed: Sat June 8 2:36 PM ->  3:46 PM | Sun June 9 1:45 PM -> 
  - first session was mostly fiddling around w/ TS and MySQL 
- 

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
ß
- [ ] ? optional: compose a MySQL Store dependency to make code more flexible/testable. define the table schema in docker compose so we can persist accros builds??

- [ ] SQL dump

- [ ] evaluate security and usability


## Evaluations
- use a pool instead of connection for the db
- creating the tables if not exists on connection (not sure how to do that for mysql + docker yet .. will figure out later)
- more graceful error handling for db connection failure
- handling errors around invlaid inputs 
- epoch is a DATEIME should be a UTC time INT