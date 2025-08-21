import mysql from "mysql2/promise";

//creating a connection pool
const pool = mysql.createPool({

    host: "localhost",
    user: "root",
    password: "Spencer123",
    database: "ggUsers"

});

export default pool;