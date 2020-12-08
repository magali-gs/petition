DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL CHECK (first_name != ''),
    last_name VARCHAR(255) NOT NULL CHECK (last_name != ''),
    email VARCHAR(250) NOT NULL UNIQUE CHECK (email != ''),
    password  VARCHAR(250) NOT NULL CHECK (password != ''),
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);