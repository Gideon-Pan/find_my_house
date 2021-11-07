require('dotenv').config();
const bcrypt = require('bcrypt');
// const got = require('got');
// const {pool} = require('./mysqlcon');
const axios  = require('axios')
const pool = require('./db/mysql')
const salt = parseInt(process.env.BCRYPT_SALT);
const {TOKEN_EXPIRE, TOKEN_SECRET} = process.env; // 30 days by seconds
const jwt = require('jsonwebtoken');
// const { default: axios } = require('axios');

const USER_ROLE = {
    ALL: -1,
    ADMIN: 1,
    USER: 2
};

const signUp = async (name, email, password) => {
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION');

        const emails = await conn.query('SELECT email FROM user WHERE email = ? FOR UPDATE', [email]);
        if (emails[0].length > 0){
            await conn.query('COMMIT');
            return {error: 'Email Already Exists'};
        }
        // console.log('finish first check')
        const loginAt = new Date();

        const user = {
            provider: 'native',
            // role_id: roleId,
            email: email,
            password: bcrypt.hashSync(password, salt),
            name: name,
            // picture: null,
            access_expired: TOKEN_EXPIRE,
            // login_at: loginAt
        };
        const accessToken = jwt.sign({
            provider: user.provider,
            name: user.name,
            email: user.email,
            // picture: user.picture
        }, TOKEN_SECRET);
        user.access_token = accessToken;

        const queryStr = 'INSERT INTO user SET ?';
        const [result] = await conn.query(queryStr, user);

        user.id = result.insertId;
        await conn.query('COMMIT');
        // console.log('finish insert new user data for sign up')
        return {user};
    } catch (error) {
        console.log(error);
        await conn.query('ROLLBACK');
        return {error};
    } finally {
        await conn.release();
    }
};

const nativeSignIn = async (email, password) => {
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION');

        const [users] = await conn.query('SELECT * FROM user WHERE email = ?', [email]);
        const user = users[0];
        if (!bcrypt.compareSync(password, user.password)){
            await conn.query('COMMIT');
            return {error: 'Password is wrong'};
        }

        const loginAt = new Date();
        const accessToken = jwt.sign({
            provider: user.provider,
            name: user.name,
            email: user.email,
            picture: user.picture
        }, TOKEN_SECRET);

        const queryStr = 'UPDATE user SET access_token = ?, access_expired = ?, login_at = ? WHERE id = ?';
        await conn.query(queryStr, [accessToken, TOKEN_EXPIRE, loginAt, user.id]);

        await conn.query('COMMIT');

        user.access_token = accessToken;
        user.login_at = loginAt;
        user.access_expired = TOKEN_EXPIRE;

        return {user};
    } catch (error) {
        await conn.query('ROLLBACK');
        return {error};
    } finally {
        await conn.release();
    }
};

const facebookSignIn = async (id, roleId, name, email) => {
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION');
        const loginAt = new Date();
        let user = {
            provider: 'facebook',
            role_id: roleId,
            email: email,
            name: name,
            picture:'https://graph.facebook.com/' + id + '/picture?type=large',
            access_expired: TOKEN_EXPIRE,
            login_at: loginAt
        };
        const accessToken = jwt.sign({
            provider: user.provider,
            name: user.name,
            email: user.email,
            picture: user.picture
        }, TOKEN_SECRET);
        user.access_token = accessToken;

        const [users] = await conn.query('SELECT id FROM user WHERE email = ? AND provider = \'facebook\' FOR UPDATE', [email]);
        let userId;
        if (users.length === 0) { // Insert new user
            const queryStr = 'insert into user set ?';
            const [result] = await conn.query(queryStr, user);
            userId = result.insertId;
        } else { // Update existed user
            userId = users[0].id;
            const queryStr = 'UPDATE user SET access_token = ?, access_expired = ?, login_at = ?  WHERE id = ?';
            await conn.query(queryStr, [accessToken, TOKEN_EXPIRE, loginAt, userId]);
        }
        user.id = userId;

        await conn.query('COMMIT');

        return {user};
    } catch (error) {
        await conn.query('ROLLBACK');
        return {error};
    } finally {
        await conn.release();
    }
};

const getUserDetail = async (email, roleId) => {
    try {
        if (roleId) {
            const [users] = await pool.query('SELECT * FROM user WHERE email = ? AND role_id = ?', [email, roleId]);
            return users[0];
        } else {
            const [users] = await pool.query('SELECT * FROM user WHERE email = ?', [email]);
            return users[0];
        }
    } catch (e) {
        return null;
    }
};

const getFacebookProfile = async function(accessToken){
    try {
        let res = await axios.get('https://graph.facebook.com/me?fields=id,name,email&access_token=' + accessToken, {
            responseType: 'json'
        });
        return res.body;
    } catch (e) {
        console.log(e);
        throw('Permissions Error: facebook access token is wrong');
    }
};

module.exports = {
    USER_ROLE,
    signUp,
    nativeSignIn,
    facebookSignIn,
    getUserDetail,
    getFacebookProfile,
};