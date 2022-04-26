DROP TABLE IF EXISTS reviews_photos;
CREATE TABLE reviews_photos (
   id INT primary key auto_increment,
   review_id INT,
   url varchar(1000)
);
