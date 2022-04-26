LOAD DATA LOCAL INFILE 'data/reviews.csv'
INTO TABLE reviews
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(id,product_id,rating,@date,summary,body,recommend,reported,reviewer_name,reviewer_email,response,helpfulness) SET date = from_unixtime(@date / 1000);