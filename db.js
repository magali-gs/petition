const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

/////////////////////////QUERY para petiçao///////////////////////////
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

/////////////////////////QUERY para registro///////////////////////////
module.exports.addUser = (firstName, lastName, email, password) => {
    const q = `
    INSERT INTO users (first_name, last_name, email, password) 
    VALUES ($1, $2, $3, $4)
    RETURNING id;
    `;
    const params = [firstName, lastName, email, password];
    return db.query(q, params);
};

//editar em breve pq esta pegando os dados de users em vez de signatures
//fazer inner join!!
module.exports.getFullName = () => {
    const q = `
        SELECT first_name, last_name 
        FROM users;
        `;
    return db.query(q);
};


/////////////////////////QUERY para login///////////////////////////
module.exports.getUserInfo = (userEmail) => {
    const q = `
        SELECT id, email, password
        FROM users
        WHERE email = $1;
        `;
    const params = [userEmail];
    return db.query(q, params);
};