DROP TABLE signatures;

CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR (50) NOT NULL CHECK (first_name != ''),
    last_name VARCHAR (200) NOT NULL CHECK (last_name != '')
    -- signature VARCHAR (250) NOT NULL CHECK (signature != '')
);

INSERT INTO signatures (first_name, last_name) VALUES ('Magali', 'Silva');

SELECT COUNT (first_name) 
FROM signatures;

SELECT first_name, last_name 
FROM signatures;