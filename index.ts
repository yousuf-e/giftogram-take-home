import express, { Application, json, urlencoded } from 'express';
import { Request, Response, NextFunction } from 'express';
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
  epoch: Date;
}


let mysql: MySQL | null = null; 


(async () => {
  mysql = new MySQL(access);

  /** Deleting the `users` table, if it exists */
  await mysql.queryResult('DROP TABLE IF EXISTS `messages`;');
  await mysql.queryResult('DROP TABLE IF EXISTS `users`;');


  /** Creating a minimal user table */
  // await mysql.queryResult(
  //   'CREATE TABLE `users` (`id` INT(11) AUTO_INCREMENT, `name` VARCHAR(50), PRIMARY KEY (`id`));'
  // );

  await mysql.queryResult(
    `CREATE TABLE users (
      user_id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      first_name VARCHAR(50),
      last_name VARCHAR(50)
    );
  `);

  await mysql.queryResult(
    `CREATE TABLE messages (
      message_id INT AUTO_INCREMENT PRIMARY KEY,
      sender_user_id INT,
      receiver_user_id INT,
      message TEXT,
      epoch TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
      FOREIGN KEY (receiver_user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );
  `);
  // /** Inserting some users */
  // const [inserted] = await mysql.executeResult(
  //   'INSERT INTO `users`(`name`) VALUES(?), (?), (?), (?);',
  //   ['Josh', 'John', 'Marie', 'Gween']
  // );

  // console.log('Inserted:', inserted.affectedRows);

  /** Getting users */
  // const [users] = await mysql.queryRows(
  //   'SELECT * FROM `users` ORDER BY `id` ASC;'
  // );

  // users.forEach((user: User) => {
  //   console.log('-----------');
  //   console.log('id:  ', user.id);
  //   // console.log('name:', user.name);
  // });

  // await mysql.connection.end();
})();

/** Output
 *
 * Inserted: 4
 * -----------
 * id:   4
 * name: Gween
 * -----------
 * id:   2
 * name: John
 * -----------
 * id:   1
 * name: Josh
 * -----------
 * id:   3
 * name: Marie
 */


app.get('/',  async (_req: Request, res: Response) => {

  if(mysql !== null){
    res.send(`hello world!`);
  } else {
    res.send(' connection failure ');
  }

})


app.post('/register', async (req: Request, res: Response) => {
    const { email, password, first_name, last_name } = req.body;

    if(mysql !== null){
      const [inserted] = await mysql.executeResult(
        'INSERT INTO `users` (`email`, `password`, `first_name`, `last_name`) VALUES (?, ?, ?, ?);',
        [email, password, first_name, last_name]
      );
      
      console.log({ "inserted": inserted});

        const [users] = await mysql.queryRows(
          'SELECT * FROM `users` ORDER BY `user_id` ASC;'
        );

          users.forEach((user: User) => {
            console.log('-----------');
            console.log('id:  ', user.user_id);
            console.log('name:', user.first_name);
          });

        res.send('great success!');

        } else {
        res.json({
            "error_code": 101,
            "error_title": "Registration Failure",
            "error_message": "Database not connected yet my bad"
            })
    }

});





app.listen(3000);

console.log("listening on port 3000");

