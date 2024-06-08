import mysql from 'mysql2/promise';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const mysqlConfig = {
  host: "mysql_server",
  user: "yousuf",
  password: "secret",
  database: "chat_db"
}

async function connectMySql() {
    try {
        await sleep(5000);
        const connection =  await mysql.createConnection(mysqlConfig);
        console.log('MySQL connected');
        return connection;
    } catch (err) {
        console.log({ err });
    }
  
  } 


const connection = await connectMySql();

export default connection;