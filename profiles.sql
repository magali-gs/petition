DROP TABLE IF EXISTS users_profile;

CREATE TABLE users_profile(
  id SERIAL PRIMARY KEY,
  age INT,
  city VARCHAR(255),
  url VARCHAR(255),
  user_id INT UNIQUE NOT NULL REFERENCES users(id)
);