const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

/////////////////////////QUERY for petiçao///////////////////////////
module.exports.addSigner = (signature, userId) => {
    const q = `
    INSERT INTO signatures (signature, user_id) 
    VALUES ($1, $2)
    RETURNING id;
    `;
    const params = [signature, userId];
    return db.query(q, params);
};

module.exports.getTotalSigners = () => {
    const q = `
        SELECT COUNT (id) 
        FROM signatures;
        `;
    return db.query(q);
};

module.exports.getSignature = (signerId) => {
    const q = `
        SELECT signature 
        FROM signatures
        WHERE id = $1;
        `;
    const params = [signerId];
    return db.query(q, params);
};

/////////////////////////QUERY for registro///////////////////////////
module.exports.addUser = (firstName, lastName, email, password) => {
    const q = `
    INSERT INTO users (first_name, last_name, email, password) 
    VALUES ($1, $2, $3, $4)
    RETURNING id;
    `;
    const params = [firstName, lastName, email, password];
    return db.query(q, params);
};

/////////////////////////QUERY for signers///////////////////////////
//fazer inner join!!
module.exports.getSignersInfo = () => {
    const q = `
        SELECT first_name, last_name, age, city, url
        FROM users 
        JOIN signatures 
        ON users.id = signatures.user_id
        LEFT JOIN users_profile
        ON users.id = users_profile.user_id
        `;
    return db.query(q);
};

module.exports.getSignersByCity = (city) => {
    const q = `
        SELECT first_name, last_name, age, url
        FROM users 
        JOIN signatures 
        ON users.id = signatures.user_id
        LEFT JOIN users_profile
        ON users.id = users_profile.user_id
        WHERE LOWER(city) = LOWER($1)
        `;
    const params = [city];
    return db.query(q, params);
};


/////////////////////////QUERY for login///////////////////////////
module.exports.getUserInfo = (userEmail) => {
    const q = `
        SELECT id, email, password
        FROM users
        WHERE email = $1;
        `;
    const params = [userEmail];
    return db.query(q, params);
};

/////////////////////////QUERY for profile///////////////////////////
module.exports.addUserProfile = (userAge, userCity, userHomepage, userId) => {
    const q = `
    INSERT INTO users_profile (age, city, url, user_id) 
    VALUES ($1, $2, $3, $4)
    RETURNING id;
    `;
    const params = [
        userAge || null,
        userCity || null,
        userHomepage || null,
        userId,
    ];
    return db.query(q, params);
};

/////////////////////////QUERY for edit///////////////////////////
module.exports.getInfoToEdit = (userId) => {
    const q = `
        SELECT first_name, last_name, email, age, city, url
        FROM users 
        LEFT JOIN users_profile 
        ON users.id = users_profile.user_id
        WHERE users.id = $1;
        `;
    const params = [userId];
    return db.query(q, params);
};

module.exports.editUsersTable = (firstName, lastName, email) => {
    const q = `
        INSERT INTO users(first_name, last_name, email)
        VALUES ($1, $2, $3)  
        ON CONFLICT (id)
        DO UPDATE SET first_name=$1, last_name=$2, email=$3;
        `;
    const params = [firstName, lastName, email];
    return db.query(q, params);
};

module.exports.editProfileTable = (userAge, userCity, userHomepage, userId) => {
    const q = `
        INSERT INTO users_profile(age, city, url, user_id)
        VALUES ($1, $2, $3, $4)  
        ON CONFLICT (user_id)
        DO UPDATE SET age=$1, city=$2, url=$3, user_id=$4;
        `;
    const params = [userAge, userCity, userHomepage, userId];
    return db.query(q, params);
};