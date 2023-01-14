const express = require("express");
const config = require("../config");
const oracledb = require("oracledb");
const Joi = require("joi")
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/token");
const { generateOTP } = require("../utils/otp");
const { isLoggedIn } = require("../middlewares/index");
var pool;
const cPool = async() =>{
    pool = await oracledb.createPool(config);
}
cPool();

router = express.Router();

/// เช็คว่ารหัสบัตรประชาชนที่รับเข้ามาเคยลงทะเบียนไปหรือยัง
const id_cardValidator = async (value, helpers) => {
    var result;
    const conn = await pool.getConnection();
    try{
        result = await conn.execute("SELECT ID_CARD FROM USERS WHERE ID_CARD = :id",{id:{val:value}},{outFormat: oracledb.OBJECT})
    }catch(err){
        console.log(err.toString())
    }finally{
        conn.close();
    }
    
    if (result.rows.length > 0) {
        const message = 'รหัสบัตรประชาชนนี้เคยลงทะเบียนแล้ว'
        throw new Joi.ValidationError(message)
    }
    return value
}

/// เช็คว่า เบอร์โทรศัพท์ ที่รับเข้ามาเคยลงทะเบียนไปหรือยัง
const mobileValidator = async (value, helpers) => {
    var result;
    const conn = await pool.getConnection();
    try{
        result = await conn.execute("SELECT MOBILE FROM USERS WHERE MOBILE = :mobile", {mobile:{val:value}},{outFormat: oracledb.OBJECT})
    }catch(err){
        console.log(err.toString())
    }finally{
        conn.close();
    }
    if (result.rows.length > 0) {
        const message = 'หมายเลขโทรศัพท์นี้เคยลงทะเบียนแล้ว'
        throw new Joi.ValidationError(message)
    }
    return value
}

/// validate ข้อมูล(เบอร์โทรศัพท์)ก่อนส่ง OTP
const sentOtpSchema = Joi.object({
    mobile: Joi.string().required().pattern(/0[6,8,9]{1}[0-9]{8}/).external(mobileValidator),  
})

/// return เวลาปัจจุบัน และ เวลาปัจจุบัน + 15นาที(อายุ OTP)
function gettime(){
    const timeNow =  new Date().toLocaleString();
    var timeEnd =  new Date();
    timeEnd.setMinutes(timeEnd.getMinutes() + 15);
    timeEnd = timeEnd.toLocaleString();
    return {timeNow:timeNow,timeEnd:timeEnd}
}

/// ตั้งเวลาลบ OTP ใน Database auto
async function autoDeleteOtp(mobile){
    const conn = await pool.getConnection();
    var recursivecooldown = 905000;

    const deleteOTP = async() =>{
        const result = await conn.execute(`SELECT END_DATE FROM OTP WHERE MOBILE = :v1`,
        {v1:mobile},
        {outFormat:oracledb.OUT_FORMAT_OBJECT})
        const time = gettime()
        if(result.rows[0]){
            if(time.timeNow > result.rows[0].END_DATE){
                try{
                    await conn.execute(`DELETE FROM OTP WHERE MOBILE = :v1`, 
                    {v1:mobile}, {autoCommit:true})
                    console.log('OTP เบอร์ '+mobile+' หมดอายุแล้ว')
                    if(conn){
                        try{
                            conn.close();
                        }catch(err){
                            console.log(err.toString())
                        }
                    }
                    clearTimeout(callTimeout)
                }catch(err){
                    conn.rollback
                    console.log(err.toString())
                }
            }else{
                let cooldown = Date.parse(result.rows[0].END_DATE) - Date.parse(time.timeNow) +5000
                console.log(cooldown)
                clearTimeout(callTimeout)
                callTimeout(cooldown);  
            } 
        }else{
            return
        }
    }

    const callTimeout = (cooldown) => {setTimeout(deleteOTP,cooldown)}

    try{
        callTimeout(recursivecooldown)
        console.log('เรียก timeout')
    }
    catch(err){
        console.log(err.toString())

    }
}

/// สร้าง และ ส่ง OTP
router.post('/sentotp', async (req,res) => {
    try {
        await sentOtpSchema.validateAsync(req.body, { abortEarly: false })
    } catch (err) {
        return res.status(400).send(err.toString())
    }
    const conn = await pool.getConnection()
    const otp = generateOTP()
    const mobile = req.body.mobile;
    const time = gettime();
    try{
        ///เช็คว่าเบอร์ที่จะส่ง OTP มี OTP ที่ทำงานอยู่มั่ย
        const result = await conn.execute(`SELECT * FROM OTP WHERE MOBILE = :v1`,{v1:mobile},{outFormat:oracledb.OUT_FORMAT_OBJECT})
        ///ตั้ง Default execute เป็นเพิ่ม otp ลง DB 
        var q = `INSERT INTO OTP(OTP, MOBILE, START_DATE, END_DATE) VALUES(:v1, :v2, :v3, :v4)`     
        ///ถ้ามีเบอร์นี้มี OTP ที่ทำงานอยู่เปลี่ยนเป็น Update table แทน
        if(result.rows[0]){
            q = `UPDATE OTP SET OTP = :v1, START_DATE = :v3, END_DATE = :v4 WHERE MOBILE = :v2`
        }
        /// Run execute
        await conn.execute(q, {v1:otp, v2:mobile, v3:time.timeNow, v4:time.timeEnd}, {autoCommit:true}) 
        /// external api mailbit

        console.log(otp)
        res.status(201).json({msg:"OTP ถูกส่งไปยังหมายเลขโทรศัพท์ "+mobile+" แล้ว"})

        autoDeleteOtp(mobile);

    }catch(err){
        conn.rollback()
        console.log(err.toString())
        res.status(400).json({msg:err.toString()})
    }finally{
        if(conn){
            try{
                conn.close();
                console.log('ปิด pool หลักแล้ว')
            }catch(err){
                console.log(err.toString())
            }
        }
    }
})

/// validate ข้อมูลที่ใช้ SingUp
const signupSchema = Joi.object({
    first_name: Joi.string().required().max(20),
    last_name: Joi.string().required().max(20),
    mobile: Joi.string().required().pattern(/0[6,8,9]{1}[0-9]{8}/).external(mobileValidator),  
    id_card: Joi.string().required().pattern(/[0-9]{13}/).external(id_cardValidator).messages({
        'string.empty': `กรุณากรอกรหัสบัตรประชาชน`,
        'string.pattern.base': `รหัสบัตรประชาชนไม่ถูกต้อง`,
    }),
    agency: Joi.string().required(),
    job_title: Joi.string().required(),
    otp: Joi.string().required().pattern(/[a-zA-Z0-9]{6}/).messages({
        'string.empty': `กรุณากรอกรหัส OTP`,
        'string.pattern.base': `รหัส OTP ไม่ถูกต้อง`,
    }),
    agencyType: Joi.string().required(),
})

/// SingUp บันทุก user ไป database
router.post('/signup', async (req, res, next) => {
    try {
        await signupSchema.validateAsync(req.body, { abortEarly: false })
    } catch (err) {
        return res.status(400).send(err.toString())
    }

    const conn = await pool.getConnection();

    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const id_card = req.body.id_card;
    const agencyType = req.body.agencyType;
    const agency = req.body.agency;
    const job_title = req.body.job_title;
    const mobile = req.body.mobile;
    const otp = req.body.otp;
    try{
        const dbOTP = await conn.execute(`SELECT OTP FROM OTP WHERE MOBILE = :v1`,{v1:mobile},{outFormat:oracledb.OUT_FORMAT_OBJECT})
        if(dbOTP.rows[0]){
            if(otp == dbOTP.rows[0].OTP){
                try {
                    const password = bcrypt.hashSync(mobile, 10);
                    // เพิ่ม User
                    const result = await conn.execute(`INSERT INTO USERS(FIRST_NAME, LAST_NAME, ID_CARD, MOBILE, PASSWORD, USER_TYPE)`+
                    ` VALUES(:v1, :v2, :v3, :v4, :v5, :v6) RETURNING USER_ID INTO :USER_ID`,
                    {
                        v1:first_name, v2:last_name, v3:id_card, v4:mobile, v5:password, v6:'member',
                        USER_ID: {type: oracledb.NUMBER,  dir:oracledb.BIND_OUT} 
                    }, {autoCommit:true})
                    // ลบ OTP ที่ใช้สมัครไป
                    await conn.execute(`DELETE FROM OTP WHERE MOBILE = :v1`,{v1:mobile},{autoCommit:true})
                    // USER_ID ของ User ที่พึ่งเพิ่มไป
                    const USER_ID = result.outBinds.USER_ID[0] 
                    // เพิ่ม Usre เป็น Member
                    await conn.execute(`INSERT INTO MEMBER(USER_ID, MEMBER_TYPE, AGENCY, JOB_TITLE, ROLE)`+
                    ` VALUES(:v1, :v2, :v3, :v4, :v5)`,
                    {v1:USER_ID, v2:agencyType, v3:agency, v4:job_title, v5:'พนง.'}, {autoCommit:true})

                    console.log("Successfully sign up: "+first_name)
                    res.status(201).json({msg:"ลงทะเบียนสำเร็จ"})
                } catch (err) {
                    conn.rollback()
                    res.status(400).json(err.toString());
                }
            }else{
                res.status(400).json("รหัส OTP ไม่ถูกต้อง")
            }
        }else{
            res.status(404).json("เบอร์โทรศัพท์ที่ไม่รู้จัก กรุณากดส่ง OTP อีกครั้ง")
        }
    }catch(err){
        console.log(err.toString())
    }finally{
        if(conn){
            try{
                conn.close();
            }catch(err){
                console.log(err.toString())
            }
        }
    }
})


/// validate ข้อมูลที่ใช้ SingUp
const loginSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
})

/// login & สร้าง token
router.post('/signin',async (req,res) => {
    try{
        await loginSchema.validateAsync(req.body, { abortEarly: false })
    }catch(err){
        return res.status(400).send(err.toString())
    }
    const username = req.body.username;
    const password = req.body.password;
    const conn = await pool.getConnection();
    try{
        const users = await conn.execute(`SELECT * FROM USERS WHERE ID_CARD = :v1`,
        {v1:username},{outFormat:oracledb.OUT_FORMAT_OBJECT})
        const user = users.rows[0];
        if(!user){
            throw new Error('username หรือ password ไม่ถูกต้อง')
        }
        if(!(bcrypt.compareSync(password,user.PASSWORD))){
            throw new Error('username หรือ password ไม่ถูกต้อง')
        }

        const tokens = await conn.execute(`SELECT * FROM TOKENS WHERE USER_ID = :v1`,
        {v1:user.USER_ID},{outFormat:oracledb.OUT_FORMAT_OBJECT})
        var token = tokens.rows[0]?.TOKEN
        if(!token){
            token = generateToken()
            await conn.execute(`INSERT INTO TOKENS(USER_ID, TOKEN, USER_TYPE) VALUES(:v1, :v2, :v3)`,
            {v1:user.USER_ID, v2:token, v3:user.USER_TYPE}, {autoCommit:true})
        }
        res.status(200).json({token: token})
    }catch(err){
        conn.rollback()
        res.status(400).json(err.toString())
    }finally{
        if(conn){
            try{
                conn.close();
                console.log('close Connection')
            }catch(err){
                console.log(err)
            }
        }
    }
})

// get ข้อมูล user
router.get('/user',isLoggedIn, async(req, res, next) => {
    res.json(req.user)
})

// เปลี่ยนรหัสผ่าน
router.put('/change-password', async(req, res, next) => {
    const token = req.body.token;
    const password = req.body.password;
    const newPassword = req.body.newPassword;
    const conn = await pool.getConnection();
    
    try{
        const user = await conn.execute(
            `SELECT u.PASSWORD ,u.USER_ID FROM TOKENS t RIGHT OUTER JOIN USERS u ON(t.USER_ID = u.USER_ID) WHERE t.TOKEN = :v1`
            ,{v1:token}
            ,{outFormat:oracledb.OUT_FORMAT_OBJECT})
        const comparePass = bcrypt.compareSync(password,user.rows[0].PASSWORD)
        if(comparePass){
            const hashNewPass = bcrypt.hashSync(newPassword, 10);
            await conn.execute(
                `UPDATE USERS SET PASSWORD = :v1 WHERE USER_ID = :v2`,
                {v1:hashNewPass, v2:user.rows[0].USER_ID},
                {autoCommit:true}
            )
            res.status(200).json({msg:'เปลี่ยนรหัสผ่านแล้ว'})
        }
        else{
            res.status(400).json({msg:'รหัสผ่านปัจจุบันไม่ถูกต้อง'})
        }
    }catch(err){
        conn.rollback()
        console.log(err)
    }finally{
        if(conn){
            try{
                conn.close();
                console.log('close Connection')
            }catch(err){
                console.log(err)
            }
        }
    }   
})

// หาขอมูล ของ ผอ.ส่วน ทั้งหมด
router.get('/team/manager',isLoggedIn, async(req, res, next) => {
    const conn = await pool.getConnection()
    try{
        const users = await conn.execute(`SELECT s.*, u.FIRST_NAME, u.LAST_NAME `+
            `FROM USERS u LEFT JOIN STAFF s ON(u.USER_ID = s.USER_ID) WHERE s.ROLE = :v1`,
            {v1:'ผอ.'},{outFormat:oracledb.OUT_FORMAT_OBJECT})
        res.status(200).json(users.rows)
    }catch(err){
        console.log(err)
    }finally{
        if(conn){
            try{
                conn.close()
            }catch(err){
                console.log(err)
            }
        }
    }
})

// หาขอมูล ของ พนักงานส่วน ทั้งหมด
router.get('/team/employee',isLoggedIn, async(req, res, next) => {
    const user = req.user;
    const conn = await pool.getConnection()
    try{
        const users = await conn.execute(`SELECT s.*, u.FIRST_NAME, u.LAST_NAME FROM USERS u `+
            `LEFT JOIN STAFF s ON(u.USER_ID = s.USER_ID) WHERE s.ROLE = :v1 AND s.TEAM = :v2`,
            {v1:'พนง.',v2:user.TEAM},{outFormat:oracledb.OUT_FORMAT_OBJECT})
        res.status(200).json(users.rows)
    }catch(err){
        console.log(err)
    }finally{
        if(conn){
            try{
                conn.close()
            }catch(err){
                console.log(err)
            }
        }
    }
})

module.exports = router;