const LRU = require('lru-cache');
const jwt = require("jsonwebtoken");
import { jwtVerify } from "jose";

const linkedList = {
    sessionCache: new LRU({ttl: 1000 * 60 * 60 }),
    userMapping: new LRU({ttl: 1000 * 60 * 60 }),
    roleMapping: new LRU({ttl: 1000 * 60 * 60 }),
}

const setSession = (User, jwtToken, sessionData) => {
    linkedList.sessionCache.set(jwtToken, sessionData);
    linkedList.userMapping.set(User.username, jwtToken);
    linkedList.roleMapping.set(User.roleid, [jwtToken]);
};

const getSessionFromUsername = (username) => {
    const token = linkedList.userMapping.get(username);

    if(!token) return null;

    return linkedList.sessionCache.get(token); //data de la session
};

const getSessionFromUsername = (username) => {
    const allSessions = linkedList.sessionCache.getAll();

    let sessionReturn = undefined;

    allSessions.forEach(session => {
       if(session.username == username){
           sessionReturn = session;
           return session;
       }
    });

    return sessionReturn;
};

const JWT_SECRET = 'thisisverysecretkeyhein'; //process.env.JWT_SECRET


const signToken = (payload, expires) => {
    if(expires === undefined) expires = "10h";

    return jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: expires }
    );
};

const registerSession = (User) => {
    const token = signToken({user_id: user.id, role_id: user.role_id}, '10h');

    sessionCache.set(token, {
        id: user.id,
        locale: user.locale,
        email: user.email
    });

    return token;
};

const getSession = async (token) => {
    const payload = await jwtVerify(token, JWT_SECRET);

    return {payload: payload, session: sessionCache.get(token)};
};