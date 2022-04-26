DROP TABLE IF EXISTS reviews;
CREATE TABLE reviews (
  id int primary key auto_increment,
  product_id int,
  rating int not null,
  date timestamp,
  summary VARCHAR(1000),
  body VARCHAR(1000),
  recommend boolean,
  reported boolean,
  reviewer_name VARCHAR(100),
  reviewer_email VARCHAR(100),
  response VARCHAR(1000) DEFAULT NULL,
  helpfulness INT DEFAULT 0;
);
