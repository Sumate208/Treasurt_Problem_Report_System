const express = require("express");
const config = require("../config");
const oracledb = require("oracledb");
const { isLoggedIn } = require("../middlewares/index");
const multer = require("multer");
var path = require("path");

let pool;
const cPool = async () => {
  pool = await oracledb.createPool(config);
};
cPool();

router = express.Router();

/// setStorage
var storage = multer.diskStorage({
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

// บันทึก report ไป database
router.post(
  "/report",
  upload.array("File", 5),
  async function (req, res, next) {
    if (req.method == "POST") {
      const file = req.files;

      if (!file) {
        return res.status(400).json({ message: "กรุณาอัพโหลดไฟล์ประกอบ" });
      }

      const token = req.body.token;
      const systemName = req.body.systemName;
      const details = req.body.details;
      const fileNames = req.body.fileNames;
      const conn = await pool.getConnection();

      try {
        // หา USER_ID คนส่ง REPORT จาก TOKEN
        const users = await conn.execute(
          `SELECT u.USER_ID, u.FIRST_NAME, u.LAST_NAME  ,m.AGENCY, m.MEMBER_TYPE ` +
            `FROM USERS u,TOKENS t,MEMBER m WHERE u.USER_ID = t.USER_ID ` +
            `AND u.USER_ID = m.USER_ID AND t.USER_ID = m.USER_ID AND t.TOKEN = :v1`,
          { v1: token },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const user = users.rows[0];

        // หา USER_ID ผอ/ธพ
        const managers = await conn.execute(
          `SELECT USER_ID FROM MEMBER WHERE AGENCY = :v1 AND ROLE = :v2`,
          { v1: user.AGENCY, v2: "ผอ/ธพ" },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        //  INSER REPORT & RETURN REPORT_ID มาเก็บใน result
        var discription = "รอ(ผู้อำนวยการ" + user.AGENCY + ")อนุมัติ";
        if (user.MEMBER_TYPE == "ธพ") {
          discription = "รอ(" + user.AGENCY.slice(8) + ")อนุมัติ";
        }
        const result = await conn.execute(
          `INSERT INTO REPORTS(INFORMER_ID, SYSTEM_NAME, DETAILS, EDITOR_ID, ` +
            `STATE,STATUS) VALUES(:v1, :v2, :v3, :v4, :v5, :v6) RETURNING REPORT_ID INTO :REPORT_ID`,
          {
            v1: user.USER_ID,
            v2: systemName,
            v3: details,
            v4: managers.rows[0].USER_ID,
            v5: 1,
            v6: discription,
            REPORT_ID: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
          }
        );
        // reportId = REPORT_ID
        const reportId = result.outBinds.REPORT_ID[0];
        // Loop INSERT REPORT_IMAGE
        req.files.forEach(async (file, index) => {
          await conn.execute(
            `INSERT INTO REPORT_FILES(REPORT_ID, FILE_NAME,PATH, PART) VALUES(:v1, :v2, :v3, :v4)`,
            {
              v1: reportId,
              v2: fileNames[index],
              v3: file.path.substring(6),
              v4: "0",
            }
          );
        });

        // INSERT REPORT_PERMISION
        [user.USER_ID, managers.rows[0].USER_ID].forEach(async (id) => {
          await conn.execute(
            `INSERT INTO REPORT_PERMISION(REPORT_ID, USER_ID) VALUES(:v1, :v2)`,
            { v1: reportId, v2: id }
          );
        });
        // INSERT REPORT_LOG
        await conn.execute(
          `INSERT INTO REPORT_LOG(REPORT_ID, DISCRIPTION) VALUES(:v1, :v2)`,
          {
            v1: reportId,
            v2:
              "(" +
              user.FIRST_NAME +
              " " +
              user.LAST_NAME +
              ") แจ้งขอแก้ไขข้อมูล/ข้อผิดพลาด",
          },
          { autoCommit: true }
        );

        res
          .status(201)
          .json("แจ้งขอแก้ไขข้อมูล/ข้อผิดพลาดเรียบร้อย รอดำเนินการ");
      } catch (err) {
        conn.rollback();
        return res.status(400).json(err.toString());
      } finally {
        conn.close();
      }
    }
  }
);

// หา Report ทั้งหมดที่ user ต้องดำเนินการ
router.get("/todo-report", isLoggedIn, async (req, res) => {
  const user = req.user;
  const conn = await pool.getConnection();
  try {
    // หา REPORT ด้วย USER_ID
    const reports = await conn.execute(
      `SELECT DISTINCT r.REPORT_ID, u.FIRST_NAME, u.LAST_NAME, m.AGENCY, r.SYSTEM_NAME, r.WRITE_DATE, ` +
        `r.STATE, r.STATUS FROM REPORTS r , REPORT_PERMISION rp ,USERS u  ,MEMBER m WHERE r.REPORT_ID = rp.REPORT_ID ` +
        `AND r.INFORMER_ID = u.USER_ID AND u.USER_ID = m.USER_ID AND r.EDITOR_ID = :v1`,
      { v1: user.USER_ID },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.status(200).json(reports.rows);
  } catch (err) {
    console.log(err);
    res.status(400).json("บางอย่างผิดพลาด");
  } finally {
    if (conn) {
      try {
        conn.close();
      } catch (err) {
        console.log(err);
      }
    }
  }
});

// หา Report ทั้งหมดที่ user สามารถมองเห็น
router.get("/report", isLoggedIn, async (req, res) => {
  const user = req.user;
  const conn = await pool.getConnection();
  try {
    let q =
      `SELECT r.REPORT_ID, u.FIRST_NAME, u.LAST_NAME, m.AGENCY, r.SYSTEM_NAME, r.WRITE_DATE, ` +
      `r.STATE, r.STATUS FROM REPORTS r LEFT JOIN REPORT_PERMISION rp ON (r.REPORT_ID = rp.REPORT_ID) ` +
      `LEFT JOIN USERS u ON (r.INFORMER_ID = u.USER_ID) LEFT JOIN MEMBER m ` +
      `ON (u.USER_ID = m.USER_ID) WHERE rp.USER_ID = :v1`;
    // หา REPORT ด้วย USER_ID
    const reports = await conn.execute(
      q,
      { v1: user.USER_ID },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      }
    );
    res.status(200).json(reports.rows);
  } catch (err) {
    console.log(err);
    res.status(400).json("บางอย่างผิดพลาด");
  } finally {
    if (conn) {
      try {
        conn.close();
      } catch (err) {
        console.log(err);
      }
    }
  }
});

// หา รายละเอียด ด้วย report_id
router.get("/report/detail", isLoggedIn, async (req, res) => {
  const reportId = req.query.id;
  const user = req.user;
  const conn = await pool.getConnection();
  try {
    const permision = await conn.execute(
      `SELECT * FROM REPORT_PERMISION ` +
        `WHERE REPORT_ID = :v1 AND USER_ID = :v2`,
      { v1: reportId, v2: user.USER_ID }
    );
    if (!permision.rows[0]) {
      throw new Error("คุณไม่มีสิทธิในการดำเนินการ");
    }
    // ค้นหาข้อมูล Report ด้วย ReportId
    const reports = await conn.execute(
      `SELECT r.REPORT_ID, r.SYSTEM_NAME, u.FIRST_NAME, u.LAST_NAME, m.AGENCY, m.JOB_TITLE, ` +
        `r.EDITOR_ID, r.WRITE_DATE, r.DETAILS, r.ASSIGN_DETAILS, r.REPORT_TYPE, r.STATUS, ` +
        `r.ANALYSIS, r.STATE FROM REPORTS r LEFT JOIN USERS u ON(r.INFORMER_ID = u.USER_ID) ` +
        `LEFT JOIN MEMBER m ON(r.INFORMER_ID = m.USER_ID) WHERE r.REPORT_ID = :v1`,
      { v1: reportId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    // ค้นหา Report_Image ด้วย ReportId
    const files = await conn.execute(
      `SELECT * FROM REPORT_FILES WHERE REPORT_ID = :v1`,
      { v1: reportId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    // ค้นหา Report_log ด้วย ReportId
    const logs = await conn.execute(
      `SELECT * FROM REPORT_LOG WHERE REPORT_ID = :v1`,
      { v1: reportId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.status(200).json({
      report: reports.rows[0],
      files: files.rows,
      logs: logs.rows,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json("บางอย่างผิดพลาด");
  } finally {
    if (conn) {
      try {
        conn.close();
      } catch (err) {
        console.log(err);
      }
    }
  }
});

// fuction หาข้อมูล Report ตาม Report_id ที่รับ
async function getReport(reportId) {
  const conn = await pool.getConnection();
  try {
    const result = await conn.execute(
      `SELECT * FROM REPORTS WHERE REPORT_ID = :v1`,
      { v1: reportId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows[0];
  } catch (err) {
    console.log(err);
    return err;
  } finally {
    if (conn) {
      try {
        conn.close;
      } catch (err) {
        console.log(err);
      }
    }
  }
}

// ผอของ สำนัก/กอง/กลุ่ม/ธพ. อัพเดต report
router.put("/report/confirm", isLoggedIn, async (req, res) => {
  const status = req.body.status;
  const reportId = req.body.reportId;
  const user = req.user;
  const report = await getReport(reportId);
  if (user.USER_ID != report.EDITOR_ID) {
    throw new Error("คุณไม่มีสิทธิในการดำเนินการ");
  }
  const conn = await pool.getConnection();
  try {
    if (status == "approve") {
      // Query หา ID ผอ.IT
      const boss = await conn.execute(
        `SELECT USER_ID FROM STAFF WHERE ROLE = :v1`,
        { v1: "ผส." },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      // อัพเดต ID คนที่จะเป็นคนแก้ไข Report คนต่อไป
      await conn.execute(
        `UPDATE REPORTS SET EDITOR_ID = :v1, STATE = :v2, STATUS = :v3 WHERE REPORT_ID = :v4`,
        {
          v1: boss.rows[0].USER_ID,
          v2: 2,
          v3: "รอศูนย์เทคโนโลยีสารสนเทศเทศและการสื่อสารรับเรื่อง",
          v4: report.REPORT_ID,
        }
      );

      // เพิ่ม Permision ให้มองเห็น Report
      await conn.execute(
        `INSERT INTO REPORT_PERMISION(REPORT_ID, USER_ID) VALUES(:v1, :v2)`,
        { v1: report.REPORT_ID, v2: boss.rows[0].USER_ID }
      );

      // เพิ่ม Report Log
      let userP = "ผู้อำนวยการ" + user.AGENCY;
      if (user.MEMBER_TYPE == "ธพ") {
        userP = user.AGENCY.slice(8);
      }
      await conn.execute(
        `INSERT INTO REPORT_LOG(REPORT_ID, DISCRIPTION) VALUES(:v1, :v2)`,
        {
          v1: report.REPORT_ID,
          v2:
            "(" +
            user.FIRST_NAME +
            " " +
            user.LAST_NAME +
            ") " +
            userP +
            " ผู้อนุมัติ",
        },
        { autoCommit: true }
      );
      res.status(200).json("ดำเนินการสำเร็จ");
    } else if (status == "disaapproved") {
      // ไม่อนุมัติ set คนแก้เป็น null
      await conn.execute(
        `UPDATE REPORTS SET EDITOR_ID = :v1, STATE = :v2, STATUS = :v3 WHERE REPORT_ID = :v4`,
        { v1: null, v2: 0, v3: "ไม่ผ่านอนุมัติ", v4: report.REPORT_ID }
      );
      // อัพเดต Log
      let discription = "ผู้อำนวยการ" + user.AGENCY + " ไม่อนุมัติ";
      if (user.MEMBER_TYPE == "ธพ") {
        discription = user.AGENCY.slice(8) + " ไม่อนุมัติ";
      }
      await conn.execute(
        `INSERT INTO REPORT_LOG(REPORT_ID, DISCRIPTION) VALUES(:v1, :v2)`,
        { v1: report.REPORT_ID, v2: discription },
        { autoCommit: true }
      );
      res.status(200).json("ดำเนินการสำเร็จ");
    } else {
      res.status(400).json("มีบางอย่างผิดพลาด");
    }
  } catch (err) {
    conn.rollback();
    console.log(err);
    res.status(400).json("มีบางอย่างผิดพลาด");
  } finally {
    if (conn) {
      try {
        conn.close();
      } catch (err) {
        console.log(err);
      }
    }
  }
});

// ผอ.IT และ ผอ.ส่วน อัพเดต report
router.put("/report/assign", isLoggedIn, async (req, res) => {
  const user = req.user;
  const reportId = req.body.reportId;
  const nextEditorId = req.body.nextEditorId;
  const assign_details = req.body.assign_details;
  const report = await getReport(reportId);

  if (user.USER_ID != report.EDITOR_ID) {
    throw new Error("คุณไม่มีสิทธิในการดำเนินการ");
  }
  const conn = await pool.getConnection();
  try {
    // Update Report
    var nextState = 3,
      status = "รอตรวจสอบ",
      q = `UPDATE REPORTS SET EDITOR_ID = :v1, STATE = :v2, STATUS = :v3 WHERE REPORT_ID = :v4`,
      p = { v1: nextEditorId, v2: nextState, v3: status, v4: report.REPORT_ID };
    if (report.STATE == 3) {
      nextState = 4;
      status = "รอดำเดินการแก้ไข";
      q = `UPDATE REPORTS SET EDITOR_ID = :v1, ASSIGN_DETAILS = :v2, STATE = :v3, STATUS = :v4 WHERE REPORT_ID = :v5`;
      p = {
        v1: nextEditorId,
        v2: assign_details,
        v3: nextState,
        v4: status,
        v5: report.REPORT_ID,
      };
    }
    await conn.execute(q, p);
    // Add Permision
    await conn.execute(
      `INSERT INTO REPORT_PERMISION(REPORT_ID, USER_ID) VALUES(:v1, :v2)`,
      { v1: report.REPORT_ID, v2: nextEditorId }
    );
    // เพิ่ม Report_Log
    var discription = "ศูนย์เทคโนโลยีสารสนเทศและการสื่อสารรับเรื่อง";
    if (report.STATE == 3) {
      discription =
        "(" + user.FIRST_NAME + " " + user.LAST_NAME + ") ผู้ตรวจสอบ";
    }
    await conn.execute(
      `INSERT INTO REPORT_LOG(REPORT_ID, DISCRIPTION) VALUES(:v1, :v2)`,
      {
        v1: report.REPORT_ID,
        v2: discription,
      },
      { autoCommit: true }
    );
    res.status(200).json("ดำเนินการสำเร็จ");
  } catch (err) {
    conn.rollback();
    console.log(err);
    res.status(400).json("มีบางอย่างผิดพลาด");
  } finally {
    if (conn) {
      try {
        conn.close();
      } catch (err) {
        console.log(err);
      }
    }
  }
});

// ผู้ดำเนินการอัพเดต report
router.put(
  "/report/analysis",
  upload.array("File", 5),
  async (req, res) => {
    const file = req.files;
    const conn = await pool.getConnection();
    // หา USER_ID คนส่ง REPORT จาก TOKEN
    const token = req.body.token;
    const users = await conn.execute(
      `SELECT u.USER_ID, u.FIRST_NAME, u.LAST_NAME, s.TEAM FROM USERS u,TOKENS t,STAFF s WHERE `+
      `u.USER_ID = t.USER_ID AND u.USER_ID = t.USER_ID AND u.USER_ID = s.USER_ID AND t.TOKEN = :v1`,
      { v1: token },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const user = users.rows[0];
    console.log(user)
    if (!file) {
      return res.status(400).json({ message: "กรุณาอัพโหลดไฟล์ประกอบ" });
    }

    const reportId = req.body.reportId;
    const reportType = req.body.reportType || "ไม่ระบุ";
    const analysis = req.body.analysis;
    const fileNames = req.body.fileNames;
    const report = await getReport(reportId);

    if (user.USER_ID != report.EDITOR_ID) {
      throw new Error("คุณไม่มีสิทธิในการดำเนินการ");
    }
    try {
      // Update Report
      const nextEditId = await conn.execute(
        `SELECT USER_ID FROM STAFF WHERE TEAM = :v1 AND ROLE = :v2`,
        { v1: user.TEAM, v2: "ผอ." },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      await conn.execute(
        `UPDATE REPORTS SET EDITOR_ID = :v1, REPORT_TYPE = :v2, ` +
          `ANALYSIS = :v3, STATE = :v4, STATUS = :v5 WHERE REPORT_ID = :v6`,
        {
          v1: nextEditId.rows[0].USER_ID,
          v2: reportType,
          v3: analysis,
          v4: 5,
          v5: "รอ(ผอ.ส่วน" + user.TEAM + ")อนุมัติการแก้ไข",
          v6: report.REPORT_ID,
        }
      );
      // loop insert file
      req.files.forEach(async (file, index) => {
        await conn.execute(
          `INSERT INTO REPORT_FILES(REPORT_ID, FILE_NAME, PATH, PART) VALUES(:v1, :v2, :v3, :v4)`,
          {
            v1: reportId,
            v2: fileNames[index],
            v3: file.path.substring(6),
            v4: "1",
          }
        );
      });
      // เพิ่ม Report_Log
      await conn.execute(
        `INSERT INTO REPORT_LOG(REPORT_ID, DISCRIPTION) VALUES(:v1, :v2)`,
        {
          v1: report.REPORT_ID,
          v2: "(" + user.FIRST_NAME + " " + user.LAST_NAME + ") ผู้ดำเนินการ",
        },
        { autoCommit: true }
      );
      res.status(200).json("ดำเนินการสำเร็จ");
    } catch (err) {
      conn.rollback();
      console.log(err);
      res.status(400).json("มีบางอย่างผิดพลาด");
    } finally {
      if (conn) {
        try {
          conn.close();
        } catch (err) {
          console.log(err);
        }
      }
    }
  }
);

// ผอ.ส่วน รับทราบ ผอ.IT อนุมัติแก้ปิดงาน
router.put("/report/complete", isLoggedIn, async (req, res) => {
  const user = req.user;
  const reportId = req.body.reportId;
  const report = await getReport(reportId);

  if (user.USER_ID != report.EDITOR_ID) {
    throw new Error("คุณไม่มีสิทธิในการดำเนินการ");
  }
  const conn = await pool.getConnection();
  try {
    // Update Report
    const boss = await conn.execute(
      `SELECT USER_ID FROM STAFF WHERE AND ROLE = :v1`,
      { v1: "ผส." },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    var nextEditId = null,
      nextState = 7,
      nextStatus = "ดำเนินการ/แก้ไขเสร็จสิ้น";
    if (report.STATE == 5) {
      const boss = await conn.execute(
        `SELECT USER_ID FROM STAFF WHERE AND ROLE = :v1`,
        { v1: "ผส." },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      nextEditId = boss.rows[0].USER_ID;
      nextState = 6;
      nextStatus = "รอ(ผอ.ศูนย์เทคโนโลยีสารสนเทศและการสื่อสาร)อนุมัติการแก้ไข";
    }
    await conn.execute(
      `UPDATE REPORTS SET EDITOR_ID = :v1, STATE = :v2, STATUS = :v3 WHERE REPORT_ID = :v4`,
      { v1: nextEditId, v2: nextState, v3: nextStatus, v4: report.REPORT_ID }
    );
    // เพิ่ม Report_Log
    var beforTeam = "ส่วน";
    if (report.STATE == 6) {
      beforTeam = "";
    }
    await conn.execute(
      `INSERT INTO REPORT_LOG(REPORT_ID, DISCRIPTION) VALUES(:v1, :v2)`,
      {
        v1: report.REPORT_ID,
        v2:
          "(" +
          user.FIRST_NAME +
          " " +
          user.LAST_NAME +
          ") ผู้อำนวยการ" +
          beforTeam +
          user.TEAM +
          " ผู้อนุมัติดำเนินการ/แก้ไข",
      },
      { autoCommit: true }
    );
    res.status(200).json("ดำเนินการสำเร็จ");
  } catch (err) {
    conn.rollback();
    console.log(err);
    res.status(400).json("มีบางอย่างผิดพลาด");
  } finally {
    if (conn) {
      try {
        conn.close();
      } catch (err) {
        console.log(err);
      }
    }
  }
});

module.exports = router;
