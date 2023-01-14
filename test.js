const express = require("express");
const multer = require("multer");
const config = require("../config");
const oracledb = require("oracledb");
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

router.post(
  "/upload",
  upload.array("File", 5),
  async (req, res, next) => {
    if (req.method == "POST") {
      const file = req.files;
      if (!file) {
        return res.status(400).json({ message: "กรุณาอัพโหลดเอกสารประกอบ" });
      }

      const fileNames = req.body.fileNames;
      const conn = await pool.getConnection();

      try{
        req.files.forEach(async (file,index) => {
          await conn.execute(
            `INSERT INTO TEST_UPLOAD(REPORT_ID, PATH, PART, FILE_NAME) VALUES(:v1, :v2, :v3, :v4)`,
            { v1: '1', v2: file.path.substring(6), v3: 0, v4:  fileNames[index]},
            { autoCommit: true }
          );
        });
        res.status(201).json("Uploaded!!!")
      }catch(err){
        conn.rollback();
        res.status(400).json(err.toString())
      }finally{
        conn.close();
      }
    }
  }
);

router.get("/file", async (req, res) => {
  const reportId = req.query.id;
  const conn = await pool.getConnection();
  try {
    // ค้นหา Report_Image ด้วย ReportId
    const files = await conn.execute(
      `SELECT * FROM TEST_UPLOAD WHERE REPORT_ID = :v1`,
      { v1: reportId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.status(200).json({
      files: files.rows,
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


module.exports = router;
