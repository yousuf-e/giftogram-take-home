import express, { Request, Response, NextFunction } from 'express';
import { PoolOptions, RowDataPacket } from 'mysql2/promise';
import { MySQL } from './db';
const app = express()

const access: PoolOptions = {
  host: "mysql_server",
  user: "yousuf",
  password: "secret",
  database: "chat_db"
}

interface User extends RowDataPacket {
  id: number;
  name: string;
}

let mysql: MySQL | null = null; 


(async () => {
  mysql = new MySQL(access);

  /** Deleting the `users` table, if it exists */
  await mysql.queryResult('DROP TABLE IF EXISTS `users`;');

  /** Creating a minimal user table */
  await mysql.queryResult(
    'CREATE TABLE `users` (`id` INT(11) AUTO_INCREMENT, `name` VARCHAR(50), PRIMARY KEY (`id`));'
  );

  /** Inserting some users */
  const [inserted] = await mysql.executeResult(
    'INSERT INTO `users`(`name`) VALUES(?), (?), (?), (?);',
    ['Josh', 'John', 'Marie', 'Gween']
  );

  console.log('Inserted:', inserted.affectedRows);

  /** Getting users */
  const [users] = await mysql.queryRows(
    'SELECT * FROM `users` ORDER BY `name` ASC;'
  );

  users.forEach((user: User) => {
    console.log('-----------');
    console.log('id:  ', user.id);
    console.log('name:', user.name);
  });

  await mysql.connection.end();
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


app.post('/register', async (_req: Request, res: Response) => {
    // const { email, password, first_name, last_name } = req.body;
    if(mysql !== null){
        
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

