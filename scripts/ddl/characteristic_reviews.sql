DROP TABLE IF EXISTS characteristic_reviews;
CREATE TABLE characteristic_reviews (
  id INT primary key auto_increment,
  characteristic_id INT,
  review_id INT,
  value INT
);
