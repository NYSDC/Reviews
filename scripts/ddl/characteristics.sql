DROP TABLE IF EXISTS characteristics;
CREATE TABLE characteristics (
  id INT primary key auto_increment,
  product_id INT,
  name VARCHAR(250)
);