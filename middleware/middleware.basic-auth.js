const {Request, Response, NextFunction} = require('express');

const {nvr_user, nvr_password} = process.env;

if (nvr_user) console.log('Basic Auth using username', nvr_user);

/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
 function basicAuth(req, res, next) {
    if (!nvr_user) return next(); // skip if no username-password provided
    const authHeader = req.header('Authorization') || '';
    const base64userpass = authHeader.split(' ')[1] || '';
    const usernamepassword = Buffer.from(base64userpass, 'base64').toString();
    const colonIndex = usernamepassword.indexOf(":");
    const username = usernamepassword.substring(0, colonIndex);
    const password = usernamepassword.substring(colonIndex + 1);
    if (username === nvr_user & password === nvr_password) {
        next()
    } else {
        return noBasicAuthRes(res);
    }
}
/**
 * 
 * @param {Response} res 
 * @returns 
 */
function noBasicAuthRes(res) {
    return res.set('WWW-Authenticate', 'Basic realm="DeepSpace"')
        .status(401)
        .send("Login needed")
}

module.exports = basicAuth