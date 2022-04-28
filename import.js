const fs = require('fs');
const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'student',
  password: 'student'
});

connection.query("CREATE DATABASE IF NOT EXISTS neptune");
connection.query("set global local_infile = 1");
connection.query("USE neptune");

const DDL_SQLS = [
  //'characteristics.sql',
  'reviews.sql',
  //'characteristic_reviews.sql',
  //'reviews_photos.sql',
];

const IMPORT_SQLS = [
  'reviews.sql',
  //'characteristic_reviews.sql',
  //'reviews_photos.sql',
  //'characteristics.sql',
];

const CONSTRAINT_SQLS = [
  'characteristic_reviews.sql',
  'reviews_photos.sql'
]

const execute_script = async (connection, filename) => {
  content = fs.readFileSync(filename, { encoding: "utf-8" });
  console.log(`Running ${filename}...`);
  content.split(';').forEach(sql => {
    if (!sql.trim()) {
      return;
    }
    connection.query(sql, (err, result) => {
      if (err) {
        console.error(err.message)
      }
    });
  });
}

DDL_SQLS.forEach(file => execute_script(connection, `scripts/ddl/${file}`));
IMPORT_SQLS.forEach(file => execute_script(connection, `scripts/import/${file}`));
CONSTRAINT_SQLS.forEach(file => execute_script(connection, `scripts/constraint/${file}`));

connection.end();
