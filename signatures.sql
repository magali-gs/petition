DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    -- first_name VARCHAR (50) NOT NULL CHECK (first_name != ''),
    -- last_name VARCHAR (200) NOT NULL CHECK (last_name != ''),
    signature TEXT NOT NULL CHECK (signature != ''),
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SELECT COUNT (id) 
-- FROM signatures;

-- SELECT first_name, last_name 
-- FROM signatures;

-- SELECT signature 
-- FROM signatures
-- WHERE id = ;