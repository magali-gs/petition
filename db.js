const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

module.exports.addSigner = (firstName, lastName, signature) => {
    const q = `
    INSERT INTO signatures (first_name, last_name, signature) 
    VALUES ($1, $2, $3)
    RETURNING id;
    `;
    const params = [firstName, lastName, signature];
    return db.query(q, params);
};

module.exports.getTotalSigners = () => {
    const q = `
        SELECT COUNT (id) 
        FROM signatures;
        `;
    return db.query(q);
};

module.exports.getFullName = () => {
    const q = `
        SELECT first_name, last_name 
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
