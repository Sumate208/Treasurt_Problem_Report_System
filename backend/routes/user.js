const express = require("express")
const pool = require("../config")
const Joi = require('joi')
const bcrypt = require('bcrypt');
const { generateToken } = require("../utils/token");
const { isLoggedIn } = require('../middlewares');
const { number } = require("joi");

router = express.Router();

const usernameValidator = async (value, helpers) => {
    const [rows, _] = await pool.query("SELECT username FROM users WHERE username = ?", [value])
    if (rows.length > 0) {
        const message = 'This username is already taken'
        throw new Joi.ValidationError(message, { message })
    }
    return value
}

const phoneValidator = async (value, helpers) => {
    const [rows, _] = await pool.query("SELECT phone FROM users WHERE phone = ?", [value])
    if (rows.length > 0) {
        const message = 'This phone number is already taken'
        throw new Joi.ValidationError(message, { message })
    }
    return value
}

const signupSchema = Joi.object({
    username: Joi.string().required().pattern(/[0-9]{13}/).external(usernameValidator),
    first_name: Joi.string().required().max(20),
    last_name: Joi.string().required().max(20),
    phone: Joi.string().required().pattern(/0[6,8,9]{1}[0-9]{8}/).external(phoneValidator),
    agency: Joi.string().required(),
    job_title: Joi.string().required(),
})

router.post('/user/signup', async (req, res, next) => {
    try {
        await signupSchema.validateAsync(req.body, { abortEarly: false })
    } catch (err) {
        return res.status(400).send(err)
    }

    const conn = await pool.getConnection()
    await conn.beginTransaction()

    const username = req.body.username
    const password = await bcrypt.hash(req.body.phone, 5)
    const first_name = req.body.first_name
    const last_name = req.body.last_name
    const job_title = req.body.jobtitle
    const agency = req.body.agency
    const phone = req.body.phone
    try {
        var [sql,] = await conn.query(
            'INSERT INTO users(username, password, first_name, last_name, phone, user_type) VALUES (?, ?, ?, ?, ?, ?)',
            [username, password, first_name, last_name, phone, 'member']
        )
        await conn.query(
            'INSERT INTO member(user_id, agency, role, job_title) VALUES (?, ?, ?, ?)',
            [sql.insertId, agency, first_name, 'พนง.', job_title]
        )
        conn.commit()
        res.status(201).send("สมัครสมาชิคเรียกร้อย")
    } catch (err) {
        conn.rollback()
        res.status(400).json(err.toString());
    } finally {
        conn.release()
    }
})

const loginSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
})

router.post('/user/signin', async (req, res, next) => {
    try {
        await loginSchema.validateAsync(req.body, { abortEarly: false })
    } catch (err) {
        return res.status(400).send('Error: username and password has required')
    }
    const username = req.body.username
    const password = req.body.password

    const conn = await pool.getConnection()
    await conn.beginTransaction()

    try {
        // Check if username is correct
        const [users] = await conn.query(
            'SELECT * FROM users WHERE username=?', 
            [username]
        )
        const user = users[0]
        if (!user) {    
            throw new Error('Incorrect username or password')
        }

        // Check if password is correct
        if (!(await bcrypt.compare(password, user.password))) {
            throw new Error('Incorrect username or password')
        }

        // Check if token already existed
        const [tokens] = await conn.query(
            'SELECT * FROM tokens WHERE user_id = ?', 
            [user.user_id]
        )
        let token = tokens[0]?.token
        if (!token) {
            // Generate and save token into database
            token = generateToken()
            await conn.query(
                'INSERT INTO tokens(user_id, token, user_type) VALUES (?, ?, ?)', 
                [user.user_id, token, user.user_type]
            )
        }
        conn.commit()
        res.status(200).json({'token': token})
    } catch (error) {
        conn.rollback()
        res.status(400).json(error.toString())
    } finally {
        conn.release()
    }
})

router.get('/user', isLoggedIn, async (req, res, next) => {
    res.json(req.user)
})

const ChangePasswordSchema = Joi.object({
    user_id: Joi.string().required(),
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().required().custom(phoneValidator),
    confirm_password: Joi.string().required().valid(Joi.ref('password')),
})

router.put('/user/change-password', isLoggedIn, async (req, res, next) => {
    try {
        await ChangePasswordSchema.validateAsync(req.body, { abortEarly: false })
    } catch (err) {
        return res.status(400).send(err)
    }

    const token = req.body.token
    const oldPassword = req.body.oldPassword
    const newPassword = await bcrypt.hash(req.body.newPassword, 5)

    const conn = await pool.getConnection()
    await conn.beginTransaction()

    try {
        // Check if username is correct
        const [users] = await conn.query(
            'SELECT u.password ,u.user_id FROM tokens t RIGHT OUTER JOIN users u ON(t.user_id = u.user_id) WHERE t.token = ?', 
            [token]
        )
        const user = users[0]
        if (!(await bcrypt.compare(oldPassword, user.password))) {
            throw new Error('Incorrect password')
        }
        else{
            await conn.query(
                'UPDATE users SET password = ? WHERE user_id = ?', 
                [ newPassword, user.user_id]
            )
        }
        conn.commit()
        res.status(200).json({'token': token})
    } catch (error) {
        conn.rollback()
        res.status(400).json(error.toString())
    } finally {
        conn.release()
    }
})

// หาขอมูล ของ ผอ.ส่วน ทั้งหมด
router.get('/team/manager', isLoggedIn, async (req, res, next) => {
    const conn = await pool.getConnection()
    await conn.beginTransaction()
    try {
        const [manager,_] = await conn.query(
            'SELECT s.team, u.first_name, u.last_name FROM users u LEFT JOIN staff s ON(u.user_id = s.user_id) WHERE s.role = ?', 
            [ 'ผอ.']
        )
        res.json(manager)
    } catch (error) {
        res.status(400).json(error.toString())
    } finally {
        conn.release()
    }
})

// หาขอมูล ของ พนักงานส่วน ทั้งหมด
router.get('/team/employee', async (req, res, next) => {
    const user = req.user;
    const conn = await pool.getConnection()
    await conn.beginTransaction()
    try {
        const [employee,_] = await conn.query(
            'SELECT s.team, u.first_name, u.last_name ' +
            'FROM users u LEFT JOIN staff s ON(u.user_id = s.user_id) '+
            'WHERE s.role = ? AND s.team = ?', 
            [ 'พนง.', user.team]
        )
        res.json(employee)
    } catch (error) {
        res.status(400).json(error.toString())
    } finally {
        conn.release()
    }
})


// router.get('/team/manager', isLoggedIn, async (req, res, next) => {
//     const conn = await pool.getConnection()
//     await conn.beginTransaction()
//     try {
    
//     } catch (error) {
//         conn.rollback()
//         res.status(400).json(error.toString())
//     } finally {
//         conn.release()
//     }
// })

exports.router = router