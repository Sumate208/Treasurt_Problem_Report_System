const config = require("../config");
const oracledb = require("oracledb");

async function logger (req, res, next) {
    const timestamp = new Date().toISOString().substring(0, 19)
    console.log(`${timestamp} | ${req.method}: ${req.originalUrl}`)
    next()
}

async function isLoggedIn (req, res, next) {
    const conn = await oracledb.getConnection(config);
    let authorization = req.headers.authorization
    
    if (!authorization) {
        return res.status(401).send('You are not logged in')
    }
    
    let [part1, part2] = authorization.split(' ')
    if (part1 !== 'Bearer' || !part2) {
        return res.status(401).send('You are not logged in')
    }
    
    try{
        // Check token
        const tokens = await conn.execute(`SELECT * FROM TOKENS WHERE TOKEN = :v1`,{v1:part2},{outFormat:oracledb.OUT_FORMAT_OBJECT})
        const token = tokens.rows[0]
        if (!token) {
            return res.status(401).send('You are not logged in')
        }
        var q = `SELECT u.USER_ID, u.FIRST_NAME, u.LAST_NAME, u.ID_CARD, u.MOBILE, u.USER_TYPE, m.MEMBER_TYPE, m.AGENCY, m.ROLE, `+
                `m.JOB_TITLE FROM USERS u LEFT OUTER JOIN MEMBER m ON(u.USER_ID = m.USER_ID) WHERE u.USER_ID = :v1`
        if(token.USER_TYPE == 'staff'){
            q = `SELECT u.USER_ID, u.FIRST_NAME, u.LAST_NAME, u.ID_CARD, u.MOBILE, u.USER_TYPE, s.TEAM, s.ROLE`+
                ` FROM USERS u LEFT OUTER JOIN STAFF s ON(u.USER_ID = s.USER_ID) WHERE u.USER_ID = :v1`
        }            
        // Set user
        const users = await conn.execute(q, {v1:token.USER_ID}, {outFormat:oracledb.OUT_FORMAT_OBJECT}
        )
        req.user = users.rows[0]
    }
    catch(err){console.log(err)}
    
    next()
}

module.exports = {
    logger,
    isLoggedIn
}