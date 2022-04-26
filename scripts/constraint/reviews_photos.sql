ALTER TABLE reviews_photos
ADD CONSTRAINT FOREIGN KEY (review_id)
REFERENCES reviews (id);
