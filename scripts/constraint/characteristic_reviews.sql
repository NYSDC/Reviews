ALTER TABLE characteristic_reviews
ADD CONSTRAINT FOREIGN KEY (review_id)
REFERENCES reviews (id);
ADD CONSTRAINT FOREIGN KEY (characteristic_id)
REFERENCES characteristics (id);
