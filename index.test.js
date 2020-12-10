const superTest = require('supertest');
const { app } = require('./index');
const cookieSession = require('cookie-session');

//1
test(`GET /petiton sends 303 and redirects to /register page when logged out`, () => {
    cookieSession.mockSessionOnce({
        userId: null
    });
    return superTest(app)
        .get("/petition")
        .then((response) => {
            expect(response.statusCode).toBe(302);
            expect(response.headers.location).toBe("/register");
        });
});

//2
test(`GET /register sends 303 and redirects to /petition page when logged in`, () => {
    cookieSession.mockSessionOnce({
        userId: 1,
    });
    return superTest(app)
        .get("/register")
        .then((response) => {
            expect(response.statusCode).toBe(302);
            expect(response.headers.location).toBe("/petition");
        });
});

test(`GET /login sends 302 and redirects to /petition page when logged in`, () => {
    cookieSession.mockSessionOnce({
        userId: 1,
    });
    return superTest(app)
        .get("/login")
        .then((response) => {
            expect(response.statusCode).toBe(302);
            expect(response.headers.location).toBe("/petition");
        });
});
//3
test(`GET /petition sends 302 and redirects to /thanks page when signed`, () => {
    cookieSession.mockSessionOnce({
        userId: 1,
        sigId: 2,
    });
    return superTest(app)
        .get("/petition")
        .then((response) => {
            expect(response.statusCode).toBe(302);
            expect(response.headers.location).toBe("/thanks");
        });
});
//4
test(`GET /thanks sends 302 and redirects to /thanks page when not signed`, () => {
    cookieSession.mockSessionOnce({
        userId: 1,
        sigId: null,
    });
    return superTest(app)
        .get("/thanks")
        .then((response) => {
            expect(response.statusCode).toBe(302);
            expect(response.headers.location).toBe("/petition");
        });
});


test(`GET /signers sends 302 and redirects to /petition page when not signed`, () => {
    cookieSession.mockSessionOnce({
        userId: 1,
        sigId: null,
    });
    return superTest(app)
        .get("/signers")
        .then((response) => {
            expect(response.statusCode).toBe(302);
            expect(response.headers.location).toBe("/petition");
        });
});