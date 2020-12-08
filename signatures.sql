DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    signature TEXT NOT NULL CHECK (signature != ''),
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SELECT COUNT (id) 
-- FROM signatures;

-- SELECT first_name, last_name 
-- FROM signatures;

-- SELECT signature 
-- FROM signatures
-- WHERE id = ;