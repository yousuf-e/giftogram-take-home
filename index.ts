import express, { Application, json, urlencoded } from 'express';
import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { PoolOptions, RowDataPacket } from 'mysql2/promise';
import { MySQL } from './db';


const app: Application = express();

app.use(json({ limit: '50mb' }));
app.use(urlencoded({ extended: true, limit: '50mb' }));



const access: PoolOptions = {
  host: "mysql_server",
  user: "yousuf",
  password: "secret",
  database: "chat_db"
}

interface User extends RowDataPacket {
  user_id: number;
  email: string;
  password: string;
  first: string;
  last: string;
}

interface Message extends RowDataPacket {
  message_id: number;
  sender_user_id: number;
  receiver_user_id: number;
  message: string;
  epoch: number;
}


let mysql: MySQL | null = null; 


// DDL for the db
(async () => {
  mysql = new MySQL(access);

  await mysql.queryResult(
    `CREATE TABLE IF NOT EXISTS users (
      user_id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      first_name VARCHAR(50),
      last_name VARCHAR(50)
    );
  `);

  await mysql.queryResult(
    `CREATE TABLE IF NOT EXISTS messages (
      message_id INT AUTO_INCREMENT PRIMARY KEY,
      sender_user_id INT,
      receiver_user_id INT,
      message TEXT,
      epoch TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
      FOREIGN KEY (receiver_user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );
  `);

})();


app.get('/',  async (_req: Request, res: Response) => {

  if(mysql !== null){
    res.send(`hello world!`);
  } else {
    res.send(' connection failure ');
  }

})


app.post('/register', async (req: Request, res: Response, next: NextFunction) => {

  const { email, password, first_name, last_name } = req.body;

    try {

      if (!mysql) throw new Error('No Database connected!');

      await mysql.executeResult(
        'INSERT INTO `users` (`email`, `password`, `first_name`, `last_name`) VALUES (?, ?, ?, ?);',
        [email, password, first_name, last_name]
      );


      // MySQL doesnt have RETURNING support, and there is prob a way to set up Multi statements w/ mysql2 
      const [user]: [User] = await mysql.queryRows(
        'SELECT * FROM `users` WHERE `email` =  ?;',
        [email]
      );



      res.json({ user });

    } catch (error) {
      // advanced error handling here
      return next({
        log: `Error occured in registration middleware: ${error}`,
        status: 102,
        message: {
          error_code: 102,
          error_title: "Registration Failure",
          error_message: 'Unable to register user.',
        },
      });
    }

});


app.post('/login', async (req: Request, res: Response, next: NextFunction) => {

  const { email, password } = req.body;

  try {

    if (!mysql) throw new Error('No Database connected!');

    // Query to find the user with the provided email
    const [users]: [User] = await mysql.queryRows(
      'SELECT * FROM `users` WHERE `email` =  ?;',
      [email]
    );

    if (users.length === 0) {
      // If no user found with the provided email
      return res.status(102).json({
        error_code: 102,
        error_title: 'Login Failure',
        error_message: 'No user found with this email',
      });
    }

    const user = users[0];

    // Check if the provided password matches the stored password
    const isPasswordValid = user.password === password; 

    if (!isPasswordValid) {
      // If password does not match
      return res.status(102).json({
        error_code: 102,
        error_title: 'Login Failure',
        error_message: 'Password is invalid',
      });
    }

    // If login is successful, respond with user data 
    res.json({
      user_id: user.user_id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
    });

  } catch (error) {
    // Advanced error handling here
    return next({
      log: `Error occurred in login middleware: ${error}`,
      status: 500,
      message: {
          error_code: 102,
          error_title: "Login Failure",
          error_message: 'Email or Password was Invalid!',
      },
    });
  }
});


app.post('/send_message', async (req: Request, res: Response, next: NextFunction) => {

  const { sender_user_id, receiver_user_id, message } = req.body;

  try {
    if (!mysql) throw new Error('No Database connected!');

    // Check if both sender and receiver exist
    const [sender] = await mysql.queryRows(
      'SELECT * FROM `users` WHERE `user_id` = ?;',
      [sender_user_id]
    );

    const [receiver] = await mysql.queryRows(
      'SELECT * FROM `users` WHERE `user_id` = ?;',
      [receiver_user_id]
    );

    if (sender.length === 0 || receiver.length === 0) {
      return res.status(103).json({
        error_code: 103,
        error_title: 'Message Sending Failure',
        error_message: 'Sender or receiver does not exist',
      });
    }

    // Insert the message into the messages table
    const [inserted] = await mysql.executeResult(
      'INSERT INTO `messages` (`sender_user_id`, `receiver_user_id`, `message`) VALUES (?, ?, ?);',
      [sender_user_id, receiver_user_id, message]
    );

    // Respond with success message
    res.status(200).json({
      success_code: 200,
      success_title: 'Message Sent',
      success_message: 'Message sent successfully',
    });

  } catch (error) {
    // Advanced error handling here
    return next({
      log: `Error occurred in send_message middleware: ${error}`,
      status: 102,
      message: {
        error_code: 102,
        error_title: "Message Send Failure",
        error_message: 'Message send was Invalid!',
      },
    });
  }
});


app.get('/list_all_users', async (req: Request, res: Response, next: NextFunction) => {

  // GET does not always have a body, but endpoint is implemented as per spec

  const { requester_user_id } = req.body;

  try {

    if (!mysql) throw new Error('No Database connected!');

    // Query to get all users except the requester
    const [users] = await mysql.queryRows(
      'SELECT user_id, email, first_name, last_name FROM `users` WHERE `user_id` != ?;',
      [requester_user_id]
    );

    // Respond with the list of users
    res.json({ users });

  } catch (error) {
    // Advanced error handling here
    return next({
      log: `Error occurred in list_all_users middleware: ${error}`,
      status: 500,
      message: {
        error_code: 102,
        error_title: "User Lookup Failure",
        error_message: 'User look up is invalid!',
      },
    });
  }
});


app.get('/view_messages', async (req: Request, res: Response, next: NextFunction) => {

  const { user_id_a, user_id_b } = req.body;

  try {

    if (!mysql) throw new Error('No Database connected!');

    // Validate query parameters
    if (!user_id_a || !user_id_b) {
      return res.status(400).json({
        error_code: 104,
        error_title: 'Invalid Request',
        error_message: 'User IDs must be provided',
      });
    }

    // Query to get all messages exchanged between the two users
    const [messages] = await mysql.queryRows(
      `SELECT  message_id, sender_user_id, receiver_user_id, message, UNIX_TIMESTAMP(epoch) as epoch FROM messages 
       WHERE (sender_user_id = ? AND receiver_user_id = ?) 
       OR (sender_user_id = ? AND receiver_user_id = ?)
       ORDER BY epoch ASC;`,
      [user_id_a, user_id_b, user_id_b, user_id_a]
    );

    // Respond with the list of messages
    res.json({ messages });

  } catch (error) {
    return next({
      log: `Error occurred in view_messages middleware: ${error}`,
      status: 500,
      message: {
        error_code: 102,
        error_title: "View Message Failure",
        error_message: 'Sending a message from/to this user is invalid!',
      },
    });
  }
});



// Global error handling middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use(
  (
    err: ErrorRequestHandler,
    _req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
  ) => {
    const defaultErr = {
      log: 'Express error handler caught unknown middleware error',
      status: 400,
      message: { err: 'An error occurred' },
    };
    const errorObj = Object.assign({}, defaultErr, err);
    console.log(errorObj.log);
    return res.status(errorObj.status).json(errorObj.message);
  }
);



app.listen(3000);

console.log("listening on port 3000");

