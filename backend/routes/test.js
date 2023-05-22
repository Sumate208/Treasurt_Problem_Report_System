const express = require("express")
const pool = require("../config")
const Joi = require('joi')
const bcrypt = require('bcrypt');
const { isLoggedIn } = require('../middlewares');
const multer = require("multer");
const { number } = require("joi");
const path = require("path");

router = express.Router();

// SET STORAGE
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, "./static/uploads");
    },
    filename: function (req, file, callback) {
        console.log(file)
      callback(
        null,
        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      );
    },
  });
  const upload = multer({ storage: storage });

router.post('/test', async (req, res, next) => {
    const conn = await pool.getConnection()
    await conn.beginTransaction()

    const text = req.body.text

    try {
        var [sql,_] = await conn.query(
            'INSERT INTO test(text) VALUES (?)',
            [text]
        )
        console.log(sql)
        console.log(sql.insertId)
        conn.commit()
        res.status(201).send()
    } catch (err) {
        conn.rollback()
        res.status(400).json(err.toString());
    } finally {
        conn.release()
    }
})

const usernameValidator = async (value, helpers) => {
    const [rows, _] = await pool.query("SELECT username FROM users WHERE username = ?", [value])
    if (rows.length > 0) {
        const message = 'This username is already taken'
        throw new Joi.ValidationError(message, { message })
    }
    return value
}

const passwordValidator = (value, helpers) => {
    if (value.length < 5) {
        throw new Joi.ValidationError('Password must contain at least 8 characters')
    }
    if (!(value.match(/[a-z]/) && value.match(/[A-Z]/))) {
        throw new Joi.ValidationError('Password must be harder')
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
    username: Joi.string().required().min(5).max(20).external(usernameValidator),
    password: Joi.string().required().custom(passwordValidator),
    confirm_password: Joi.string().required().valid(Joi.ref('password')),
    first_name: Joi.string().required().max(20),
    last_name: Joi.string().required().max(20),
    phone: Joi.string().required().pattern(/0[0-9]{9}/).external(phoneValidator),
    team: Joi.string().required().max(50),
    role: Joi.string().required().max(20),
})

router.post('/user/signup/staff', async (req, res, next) => {
    try {
        await signupSchema.validateAsync(req.body, { abortEarly: false })
    } catch (err) {
        return res.status(400).send(err)
    }

    const conn = await pool.getConnection()
    await conn.beginTransaction()

    const username = req.body.username
    const password = await bcrypt.hash(req.body.password, 5)
    const first_name = req.body.first_name
    const last_name = req.body.last_name
    const phone = req.body.phone
    const team = req.body.team
    const role = req.body.role
    try {
        var [sql,_] = await conn.query(
            'INSERT INTO users(username, password, first_name, last_name, phone, user_type) VALUES (?, ?, ?, ?, ?, ?)',
            [username, password, first_name, last_name, phone, 'staff']
        )
        await conn.query(
            'INSERT INTO staff(user_id, team, role) VALUES (?, ?, ?)',
            [sql.insertId, team, role]
        )
        conn.commit()
        res.status(201).send()
    } catch (err) {
        conn.rollback()
        res.status(400).json(err.toString());
    } finally {
        conn.release()
    }
})

router.post("/test/upload", isLoggedIn, upload.array("File", 5), async function (req, res, next) {
    const file = req.files;
  
    if (!file) {
      return res.status(400).json({ message: "Please upload a file" });
    }
    const text = req.body.text;

    try {
      res.send("อัพโหลดแล้ว");
    } catch (err) {
      return res.status(400).json(err);
    } finally {
    }
  });

exports.router = router