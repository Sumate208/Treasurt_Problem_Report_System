const express = require("express");
const path = require("path");
const pool = require("../config");
const fs = require("fs");
const multer = require("multer");
const { isLoggedIn } = require('../middlewares')
router = express.Router();

// SET STORAGE
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./static/uploads");
  },
  filename: function (req, file, callback) {
    callback(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });

// บันทึก problem ไป database
router.post("/problem", isLoggedIn, upload.array("File", 5), async function (req, res, next) {
  const file = req.files;
  const user = req.user;

  if (!file) {
    return res.status(400).json({ message: "Please upload a file" });
  }
  const systemName = req.body.systemName;
  const details = req.body.details;

  const conn = await pool.getConnection();
  await conn.beginTransaction();

  var pathArray = [];
  var userArray = [];

  try {
    // หา USER_ID ผอ/ธพ
    var [managers,_] = await conn.query(
      "SELECT user_id FROM member WHERE agency = ? AND role = ?",
      [ user.agency, "ผอ./ธพ."]
    );
    var manager = managers[0];
    //  INSER REPORT 
    let discription = "รอ(ผอ./ธพ." + user.agency + ")อนุมัติ";
    var [sql,_] = await conn.query(
      "INSERT INTO problems(informer_id, system_name, details, editor_id, "+
      "state,status) VALUES(?, ?, ?, ?, ?, ?);",
      [user.user_id, systemName, details, manager.user_id, 1, discription]
    )

    let insertId = sql.insertId

    //  INSER Problem_Files
    file.forEach((file, index) => {
      let path = [insertId, file.filename,file.path.substring(6),"0"];
      pathArray.push(path);
    });
    await conn.query(
      "INSERT INTO problem_files(problem_id, file_name, path, part) VALUES ?",
      [pathArray]
    );

    //  INSER Permision
    userArray.push([user.user_id, insertId]);
    userArray.push([manager.user_id, insertId]);
    await conn.query(
      "INSERT INTO problem_permision(user_id, problem_id) VALUES ?",
      [userArray]
    );

    //  INSER Log
    let textDis = "(" + user.first_name + " " + user.last_name + ") แจ้งขอแก้ไขข้อมูล/ข้อผิดพลาด"
    await conn.query(
      "INSERT INTO problem_log(problem_id, discription) VALUES(?, ?)",
      [insertId, textDis]
    );
    await conn.commit();
    res.send("แจ้งขอแก้ไขข้อมูล/ข้อผิดพลาดเรียบร้อย รอดำเนินการ");
  } catch (err) {
    await conn.rollback();
    console.log(err)
    return res.status(400).json(err);
  } finally {
    conn.release();
  }
});

// หา problem ทั้งหมดที่ user ต้องดำเนินการ
router.get("/todo-problem", isLoggedIn, async (req, res, next) => {
  const user = req.user;
  const conn = await pool.getConnection()
  await conn.beginTransaction()
  try {
    const [problems,_] = await conn.query(
      "SELECT DISTINCT p.problem_id, u.first_name, u.last_name, m.agency, p.system_name, p.write_date, " +
      "p.state, p.status FROM problems p , problem_permision pp ,users u  ,member m WHERE r.problem_id = pp.problem_id " +
      "AND p.informer_id = u.user_id AND u.user_id = m.user_id AND p.editor_id = ?",
      [user.user_id]
    );
    res.json(problems);
  } catch (err) {
    return res.status(400).json(err);
  } finally {
    conn.release();
  }
})

// หา problem ทั้งหมดที่ user สามารถมองเห็น
router.get('/problem', isLoggedIn, async (req, res, next) => {
  const user = req.user;
  const conn = await pool.getConnection()
  await conn.beginTransaction()
  try {
    const [problems,_] = await conn.query(
      "SELECT p.problem_id, u.first_name, u.last_name, m.agency, p.system_name, p.write_date, " +
      "p.state, p.status FROM problems p LEFT JOIN problem_permision pp ON (p.problem_id = pp.problem_id) " +
      "LEFT JOIN users u ON (p.informer_id = u.user_id) LEFT JOIN member m " +
      "ON (u.user_id = m.user_id) WHERE pp.user_id = ?",
      [user.user_id]
    );
    res.json(problems);
  } catch (err) {
    return res.status(400).json(err);
  } finally {
    conn.release();
  }
})

// หา รายละเอียด ด้วย report_id
router.get('/problem/detail', isLoggedIn, async (req, res, next) => {
  const problemId = req.query.id;
  const user = req.user;

  const conn = await pool.getConnection()
  await conn.beginTransaction()

  try {
    console.log('dddd')
    // var [permision,_] = await conn.query(
    //   "SELECT * FROM problem_permision " +
    //   "WHERE user_id = ? AND problem_id = ?",
    //   [user.user_id, problemId]
    // );
    // if (!permision.rows[0]) {
    //   return res.status(400).json("คุณไม่มีสิทธิในการดำเนินการ"); 
    // }
    // else{
    //   var [problems,_] = await conn.query(
    //     "SELECT p.problem_id, p.system_name, u.first_name, u.last_name, m.agency, m.job_title, " +
    //     "p.editor_id, p.write_date, p.details, p.assign_details, p.problem_type, p.status, " +
    //     "p.analysis, p.state FROM problems p LEFT JOIN users u ON(p.informer_id = u.user_id) " +
    //     "LEFT JOIN member m ON(p.informer_id = m.user_id) WHERE p.problem_id = ?",
    //     [problemId]
    //   );

    //   var [files,_] = await conn.query(
    //     "SELECT * FROM problem_files WHERE problem_id = ?",
    //     [problemId]
    //   );
    //   var [logs,_] = await conn.query(
    //     "SELECT * FROM problem_log WHERE problem_id = ?",
    //     [problemId]
    //   );
    //   console.log(problems)
    //   console.log(files)
    //   console.log(logs)
    //   res.status(200).json({
    //     problem: problems,
    //     files: files[0],
    //     logs: logs[0],
    //   });
    // }
  } catch (err) {
    return res.status(400).json("บางอย่างผิดพลาด");
  } finally {
    conn.release();
  }
})


async function getReport(problemId) {
  const conn = await pool.getConnection()
  await conn.beginTransaction()

  try {
    const [result,_] = await conn.query(
      "SELECT * FROM problems WHERE problem_id = ?",
      [problemId]
    );
    return result[0];
  } catch (err) {
    return err;
  } finally {
    conn.release();
  }
}

// ผอของ สำนัก/กอง/กลุ่ม/ธพ. อัพเดต report
router.put("/problem/confirm", isLoggedIn, async (req, res, next) => {
  const user = req.user;
  const status = req.body.status;
  const problemId = req.body.problemId;
  const problem = await getReport(problemId);

  if (user.user_id != problem.EDITOR_ID) {
    return res.status(400).json("คุณไม่มีสิทธิในการดำเนินการ"); 
  }

  const conn = await pool.getConnection()
  await conn.beginTransaction()
  try {
    if (status == "approve") {
      // Query หา ID ผอ.IT
      var [boss,_] = await conn.query(
        "SELECT user_id FROM staff WHERE role = ?",
        ["ผส."]
      );
      // อัพเดต ID คนที่จะเป็นคนแก้ไข Report คนต่อไป
      await conn.query(
        "UPDATE problems SET editor_id = ?, state = ?, status = ? WHERE problem_id = ?",
        [boss[0].user_id, 2, "รอศูนย์เทคโนโลยีสารสนเทศเทศและการสื่อสารรับเรื่อง",problem.problem_id]
      );
      // เพิ่ม Permision ให้มองเห็น Report
      await conn.query(
        "INSERT INTO problem_permision(user_id, problem_id) VALUES(?, ?)",
        [boss[0].user_id, problem.problem_id]
      );
      // เพิ่ม Report Log
      let discription =  "ผอ./ธพ.(" + user.FIRST_NAME + " " + user.LAST_NAME + ")ผู้อนุมัติ"
      await conn.query(
        "INSERT INTO problem_log(problem_id, discription) VALUES(?, ?)",
        [problem.problem_id, discription]
      );
      await conn.commit();
      res.status(200).json("ดำเนินการสำเร็จ");
    } 
    else if (status == "disaapproved"){
      await conn.query(
        "UPDATE problems SET editor_id = ?, state = ?, status = ? WHERE problem_id = ?",
        [null, 0, "ไม่ผ่านอนุมัติ",problem.problem_id]
      );
      // อัพเดต Log
      await conn.query(
        "INSERT INTO problem_log(problem_id, discription) VALUES(?, ?)",
        [problem.problem_id, "ปัญหานี้ไม่ผ่านการอนุมัติ"]
      );
      await conn.commit();
      res.status(200).json("ดำเนินการสำเร็จ");
    }
    else {
      res.status(400).json("มีบางอย่างผิดพลาด");
    }
  } catch (err) {
    return res.status(400).json("บางอย่างผิดพลาด");
  } finally {
    conn.release();
  }
})

// ผอ.IT และ ผอ.ส่วน อัพเดต report
router.put("/report/assign", isLoggedIn, async (req, res) => {
  const user = req.user;
  const problemId = req.body.problemId;
  const nextEditorId = req.body.nextEditorId;
  const assign_details = req.body.assign_details;
  const problem = await getReport(problemId);
  var discription = "ศูนย์เทคโนโลยีสารสนเทศและการสื่อสารรับเรื่อง";
  if (user.user_id != problem.editor_id) {
    return res.status(400).json("คุณไม่มีสิทธิในการดำเนินการ"); 
  }

  const conn = await pool.getConnection()
  await conn.beginTransaction()
  try {
      q = "UPDATE problems SET editor_id = ?, state = ?, status = ? WHERE problem_id = ?",
      p = [nextEditorId, 3, "รอตรวจสอบ", problem.problem_id];
    if (problem.STATE == 3) {
      q = "UPDATE problems SET editor_id = ?, assign_details = ?, state = ?, status = ? WHERE problem_id = ?";
      p = [nextEditorId, assign_details, 4, "รอดำเดินการแก้ไข", problem.problem_id,];
      discription = "(" + user.first_name + " " + user.last_name + ") ผู้ตรวจสอบ";
    }
    await conn.query(q, p)

    // Add Permision
    await conn.query(
      "INSERT INTO problem_permision(problem_id, user_id) VALUES(?, ?)",
      [problem.problem_id, nextEditorId]
    );

    // เพิ่ม Report_Log
    await conn.query(
      "INSERT INTO problem_log(problem_id, discription) VALUES(?, ?)",
      [problem.problem_id, discription]
    );
    await conn.commit();
    res.status(200).json("ดำเนินการสำเร็จ");
  } catch (err) {
    conn.rollback();
    return res.status(400).json("บางอย่างผิดพลาด");
  } finally {
    conn.release();
  }
})

// ผู้ดำเนินการอัพเดต report
router.put("/report/analysis", isLoggedIn, upload.array("File", 5), async function (req, res, next) {
  const file = req.files;
  const user = req.user;
  let pathArray = [];

  if (!file) {
    return res.status(400).json({ message: "Please upload a file" });
  }
  const problemId = req.body.problemId;
  const reportType = req.body.reportType || "ไม่ระบุ";
  const analysis = req.body.analysis;
  const fileNames = req.body.fileNames;
  const problem = await getReport(problemId);
  if (user.user_id != problem.editor_id) {
    return res.status(400).json("คุณไม่มีสิทธิในการดำเนินการ"); 
  }

  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    const [nextEditId,_] = await conn.query(
      "SELECT user_id FROM staff WHERE team = ? AND role = ?",
      [user.team, "ผอ."]
    );
    let status = "รอ(ผอ.ส่วน" + user.TEAM + ")อนุมัติการแก้ไข"
    await conn.query(
      "UPDATE problems SET editor_id = ?, problem_type = ?, " +
      "analysis = ?, state = ?, status = ? WHERE problem_id = ?",
      [nextEditId[0].user_id, reportType, analysis, 5, status, problem.problem_id]
    );
    
    //  INSER Problem_Files
    req.files.forEach((file, index) => {
      let path = [problem.problem_id, fileNames[index],file.path.substring(6),"1"];
      pathArray.push(path);
    });
    await conn.query(
      "INSERT INTO problem_files(problem_id, file_name, path, part) VALUES ?",
      [pathArray]
    );

    //  INSER Log
    let discription = "(" + user.FIRST_NAME + " " + user.LAST_NAME + ") ผู้ดำเนินการ"
    await conn.query(
      "INSERT INTO problem_log(problem_id, discription) VALUES(?, ?)",
      [problem.problem_id, discription]
    );
    await conn.commit();
    res.status(200).json("ดำเนินการสำเร็จ");
  } catch (err) {
    await conn.rollback();
    res.status(400).json("มีบางอย่างผิดพลาด");
  } finally {
    conn.release();
  }
});

// ผอ.ส่วน รับทราบ ผอ.IT อนุมัติแก้ปิดงาน
router.put("/report/complete", isLoggedIn, async (req, res) => {
  const user = req.user;
  const problemId = req.body.problemId;
  const problem = await getReport(problemId);

  if (user.user_id != problem.editor_id) {
    return res.status(400).json("คุณไม่มีสิทธิในการดำเนินการ"); 
  }

  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    var nextEditId = null,
      nextState = 7,
      nextStatus = "ดำเนินการ/แก้ไขเสร็จสิ้น";
    if (report.STATE == 5) {
      // Query หา ID ผอ.IT
      var [boss,_] = await conn.query(
        "SELECT user_id FROM staff WHERE role = ?",
        ["ผส."]
      );
      nextEditId = boss[0].user_id;
      nextState = 6;
      nextStatus = "รอ(ผอ.ศูนย์เทคโนโลยีสารสนเทศและการสื่อสาร)อนุมัติการแก้ไข";
    }
    await conn.query(
      "UPDATE problems SET editor_id = ?, state = ?, status = ? WHERE problem_id = ?",
      [nextEditId, nextState, nextStatus, problem.problem_id]
    );

    //  INSER Log
    var beforTeam = "ส่วน";
    if (report.STATE == 6) {
      beforTeam = "";
    }
    let discription = "(" + user.first_name + " " + user.last_name + ") ผู้อำนวยการ" + 
                      beforTeam + user.team +" ผู้อนุมัติดำเนินการ/แก้ไข"
    await conn.query(
      "INSERT INTO problem_log(problem_id, discription) VALUES(?, ?)",
      [problem.problem_id, discription]
    );
    await conn.commit();
    res.status(200).json("ดำเนินการสำเร็จ");
  } catch (err) {
    await conn.rollback();
    res.status(400).json("มีบางอย่างผิดพลาด");
  } finally {
    conn.release();
  }
})

router.get("/dashboard/problem", async (req, res, next) => {
  const conn = await pool.getConnection()
  await conn.beginTransaction()

  try {
    var [day,_] = await conn.query(
      "SELECT * FROM problems WHERE write_date >= CURDATE() && write_date < (CURDATE() + INTERVAL 1 DAY)"
    );
    var [week,_] = await conn.query(
      "SELECT * FROM problems WHERE  YEARWEEK(`write_date`, 1) = YEARWEEK(CURDATE(), 1)"
    );
    var [month,_] = await conn.query(
      "SELECT * FROM problems WHERE MONTH(write_date) = MONTH(CURRENT_DATE()) AND "+
      "YEAR(write_date) = YEAR(CURRENT_DATE()) ORDER BY write_date DESC"
    );
    res.json({
      arrDay : day,
      arrWeek : week,
      arrMonth : month,
    });
  } catch (err) {
    return res.status(400).json(err);
  } finally {
    conn.release();
  }
})

exports.router = router;
