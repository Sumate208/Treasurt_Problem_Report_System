<template>
  <div class="container pt-5 px-6 pb-6">
    <p
      class="is-size-4-tablet has-text-centered"
      :class="{ 'has-text-white': this.$parent.$data.darkMode }"
    >
      รายละเอียดขอแก้ไขข้อมูลหรือข้อผิดพลาดระบบงาน
    </p>

    <!-- Detail ส่วนของผู้แจ้ง -->
    <section>
      <div
        class="root-rpShow px-3"
        :class="{ 'has-background-grey-light': this.$parent.$data.darkMode }"
      >
        <div class="columns is-desktop">
          <div
            style="background-color: #bbb"
            :style="darkModeStyle1"
            class="column is-full rpShow has-text-centered"
            :class="[
              this.$parent.$data.darkMode
                ? 'has-background-dark has-text-white'
                : 'has-background-danger-light',
            ]"
          >
            <h3 class="is-size-5">ส่วนของผู้แจ้งปัญหาระบบงาน</h3>
          </div>
        </div>
        <div class="columns is-desktop">
          <div
            class="column is-full rpShow has-text-left"
            :style="darkModeStyle1"
          >
            <label class="has-text-grey"
              >ชื่อระบบงาน:
              <span class="has-text-black">{{
                report.SYSTEM_NAME
              }}</span></label
            >
          </div>
        </div>
        <div class="columns is-desktop">
          <div
            class="column is-full rpShow has-text-left"
            :style="darkModeStyle1"
          >
            <label class="has-text-grey"
              >สำนัก/กอง/กลุ่ม/สนง.ธพ:
              <span class="has-text-black">{{ report.AGENCY }}</span></label
            >
          </div>
        </div>
        <div class="columns is-desktop">
          <div
            class="column is-half-desktop is-full-mobile rpShow has-text-left"
            :style="darkModeStyle1"
          >
            <label class="has-text-grey"
              >ชื่อ-สกุล ผู้ขอแก้ไข:
              <span class="has-text-black">{{
                report.FIRST_NAME + " " + report.LAST_NAME
              }}</span></label
            >
          </div>
          <div
            class="column is-half-desktop is-full-mobile rpShow has-text-left"
            :style="darkModeStyle1"
          >
            <label class="has-text-grey"
              >วันที่ขอแก้ไข:
              <span class="has-text-black">{{ report.WRITE_DATE }}</span></label
            >
          </div>
        </div>
        <div class="columns is-desktop">
          <div
            class="column is-full rpShow has-text-left"
            :style="darkModeStyle1"
          >
            <label class="has-text-grey"
              >ตำแหน่ง:
              <span class="has-text-black">{{ report.JOB_TITLE }}</span></label
            >
          </div>
        </div>
        <div class="columns is-desktop">
          <div
            class="column is-full rpShow has-text-left"
            :style="darkModeStyle1"
          >
            <label class="has-text-grey" id="detail"
              >รายละเอียดการขอแก้ไข:
              <span class="has-text-black">{{ report.DETAILS }}</span></label
            >
          </div>
        </div>
      </div>

      <!-- แสดง FILES ส่วนของผู้แจ้ง -->
      <div v-if="files[0]" class="columns is-multiline mt-3">
        <div
          v-for="(file, index) in files.filter((file) => {
            return file.PART == 0;
          })"
          :key="index"
          class="column is-one-fifth"
        >
          <a class="card" :href="filePath(file.PATH)" target="_BLANK">
            <div class="card-image">
              <span style="overflow-x: hidden;">{{file.FILE_NAME}}</span>
              <span class="mx-1">
                <font-awesome-icon v-if="fileType(file.FILE_NAME,'pdf')" icon="fa-solid fa-file-pdf" />
                <font-awesome-icon v-else-if="fileType(file.FILE_NAME,'jpg') || fileType(file.FILE_NAME,'png')" icon="fa-solid fa-file-image" />
                <font-awesome-icon v-else-if="fileType(file.FILE_NAME,'docx')" icon="fa-solid fa-file-word" />
                <font-awesome-icon v-else icon="fa-solid fa-file" />
              </span>
           </div>
          </a>
        </div>
      </div>
    </section>
    
    <!-- ส่วนของ ศูนย์IT -->
    <section>  
      <div
        v-if="
          report.ANALYSIS ||
          (report.ASSIGN_DETAILS &&
            this.$parent.$data.user?.USER_TYPE == 'staff')
        "
        class="root-rpShow px-3"
        :class="{ 'has-background-grey-light': this.$parent.$data.darkMode }"
      >
        <div class="columns is-desktop">
          <div
            style="background-color: #bbb"
            :style="darkModeStyle1"
            class="column is-full rpShow has-text-centered"
            :class="[
              this.$parent.$data.darkMode
                ? 'has-background-dark has-text-white'
                : 'has-background-danger-light',
            ]"
          >
            <h3 class="is-size-5">
              ส่วนของศูนย์เทคโนโลยีสารสนเทศและการสื่อสาร
            </h3>
          </div>
        </div>
        <div
          class="columns is-desktop"
          v-if="
            report.ASSIGN_DETAILS &&
            this.$parent.$data.user?.USER_TYPE == 'staff'
          "
        >
          <div
            class="column is-full rpShow has-text-left"
            :style="darkModeStyle1"
          >
            <label class="has-text-grey"
              >รายละเอียดการมอบหมาย:
              <span class="has-text-black">{{
                report.ASSIGN_DETAILS
              }}</span></label
            >
          </div>
        </div>
        <div class="columns is-desktop" v-if="report.ANALYSIS">
          <div
            class="column is-full rpShow has-text-left"
            :style="darkModeStyle1"
          >
            <label class="has-text-grey"
              >ประเภท:
              <span class="has-text-black">{{
                report.REPORT_TYPE || "ไม่ระบุ"
              }}</span></label
            >
          </div>
        </div>
        <div class="columns is-desktop" v-if="report.ANALYSIS">
          <div
            class="column is-full rpShow has-text-left"
            :style="darkModeStyle1"
          >
            <label class="has-text-grey" id="detail"
              >ผลการวิเคราะห์/การแก้ไข:
              <span class="has-text-black">{{ report.ANALYSIS }}</span></label
            >
          </div>
        </div>
      </div>
      <!-- แสดง FILES ส่วนของ ศูนย์IT  -->
      <div v-if="files[0]" class="columns is-multiline mt-3">
        <div
          v-for="(file, index) in files.filter((file) => {
            return file.PART == 1;
          })"
          :key="index"
          class="column is-one-fifth"
        >
          <a class="card" :href="filePath(file.PATH)" target="_BLANK">
            <div class="card-image">
              <span style="overflow-x: hidden;">{{file.FILE_NAME}}</span>
              <span class="mx-1">
                <font-awesome-icon v-if="fileType(file.FILE_NAME,'pdf')" icon="fa-solid fa-file-pdf" />
                <font-awesome-icon v-else-if="fileType(file.FILE_NAME,'jpg') || fileType(file.FILE_NAME,'png')" icon="fa-solid fa-file-image" />
                <font-awesome-icon v-else-if="fileType(file.FILE_NAME,'docx')" icon="fa-solid fa-file-word" />
                <font-awesome-icon v-else icon="fa-solid fa-file" />
              </span>
           </div>
          </a>
        </div>
      </div>
    </section>
    
    <!-- Report_Logs -->
    <section class="mt-4">
      <div
        class="box-shadow"
        :style="darkModeStyle3"
        :class="{ 'has-text-white': this.$parent.$data.darkMode }"
      >
        <p
          class="is-size-4-tablet has-text-centered mb-3"
          :class="{ 'has-text-white': this.$parent.$data.darkMode }"
        >
          ติดตามผล
        </p>
        <div v-for="(log, index) in logs" :key="index">
          <div class="columns is-tablet px-6">
            <div class="column is-2-tablet is-2-mobile has-text-left">
              <label> {{ log.LOG_DATE }} </label>
            </div>
            <div class="column is-1-tablet is-1-mobile dnon has-text-centered">
              <div class="LogDot" :class="logDot(index)"></div>
            </div>
            <div class="column has-text-left">
              <label>{{ log.DISCRIPTION }}</label>
            </div>
          </div>
          <hr
            class="mb-4 mt-0"
            style="width: 90%; margin-left: auto; margin-right: auto"
          />
        </div>
      </div>
    </section>

    <!-- ส่วน ผอ. ของ สำนัก/กอง/กลุ่ม/ธพ state1 -->
    <section
      class="mt-2 has-text-centered"
      v-if="
        this.$parent.$data.user?.USER_ID == report.EDITOR_ID &&
        report.STATE == 1
      "
    >
      <button class="button is-success mx-1" @click="s1Modal('approve')">
        อนุมัติ
      </button>
      <button class="button is-danger mx-1" @click="s1Modal('disaapproved')">
        ไม่อนุมัติ
      </button>
    </section>

    <!-- ผอ.IT และ ผอ.ส่วน  state 2,3 -->
    <section
      class="box-shadow mt-4"
      v-if="
        this.$parent.$data.user?.USER_ID == report.EDITOR_ID &&
        (report.STATE == 2 || report.STATE == 3)
      "
    >
      <div class="control">
        <!-- state2 -->
        <div
          v-if="report.STATE == 2"
          class="select is-fullwidth"
          :class="[$v.s23AssignId.$invalid ? 'is-danger' : 'is-success']"
        >
          <select id="select" v-model="$v.s23AssignId.$model">
            <!-- v-model="$v.agency.$model" -->
            <option value="" disabled selected>เลือกส่วนงานที่รับผิดชอบ</option>
            <optgroup
              v-for="(staff, index) in s23ArrStaff"
              :key="index"
              :label="'ส่วน' + staff.TEAM"
            >
              <option :value="staff.USER_ID">
                {{ staff.FIRST_NAME + " " + staff.LAST_NAME }}
              </option>
            </optgroup>
          </select>
        </div>

        <!-- state3 -->
        <div class="field" v-if="report.STATE == 3">
          <label class="label">รายละเอียดการมอบหมาย</label>
          <div class="control">
            <textarea
              v-model="s3AssignDetails"
              class="textarea"
              placeholder="ความยาวไม่เกิน 1000 ตัวอักษร"
            ></textarea>
          </div>
        </div>
        <div
          v-if="report.STATE == 3"
          class="select is-fullwidth"
          :class="[$v.s23AssignId.$invalid ? 'is-danger' : 'is-success']"
        >
          <select id="select" v-model="$v.s23AssignId.$model">
            <option value="" disabled selected>เลือกผู้ดำเนินการ</option>
            <option
              v-for="(staff, index) in s23ArrStaff"
              :value="staff.USER_ID"
              :key="index"
            >
              {{ staff.FIRST_NAME + " " + staff.LAST_NAME }}
            </option>
          </select>
        </div>
      </div>
      <div class="mt-3 has-text-centered">
        <button class="button is-success mx-1" @click="s23Assign()">
          มอบหมาย
        </button>
        <button class="button is-link-light mx-1" @click="goBack()">
          ย้อนกลับ
        </button>
      </div>
    </section>

    <!-- ผู้ดำเนินการ state4 -->
    <section
      class="box-shadow mt-4"
      v-if="
        this.$parent.$data.user?.USER_ID == report.EDITOR_ID &&
        report.STATE == 4
      "
    >
      <div class="mt-4">
        <div class="field">
          <div class="control">
            <label class="radio">
              <input
                type="radio"
                v-model="s4ReportType"
                value="Bug/Error"
                name="reportType"
              />
              Bug/Error
            </label>
            <label class="radio">
              <input
                type="radio"
                v-model="s4ReportType"
                value="แก้ไขข้อมูล"
                name="reportType"
              />
              แก้ไขข้อมูล
            </label>
          </div>
        </div>
        <div class="field">
          <label class="label">ผลการวิเคราะห์/การแก้ไข</label>
          <div class="control">
            <textarea
              v-model="$v.s4Analysis.$model"
              class="textarea"
              placeholder="ความยาวไม่เกิน 1000 ตัวอักษร"
              :class="[$v.s4Analysis.$invalid ? 'is-danger' : 'is-success']"
            ></textarea>
          </div>
        </div>

        <vue-dropzone
          class="mt-2"
          ref="myVueDropzone"
          id="dropzone"
          :useCustomSlot="true"
          :options="dropzoneOptions"
          @vdropzone-success="vsuccess"
          @vdropzone-removed-file="vremove"
        >
          <div class="dropzone-custom-content">
            <h3 class="dropzone-custom-title">ลากแล้ววางเพื่อเพิ่มไฟล์</h3>
            <div class="subtitle">...หรือคลิกเพื่อเลือกไฟล์</div>
          </div>
        </vue-dropzone>
        <div class="mt-3 has-text-centered">
          <button class="button is-link mx-1" @click="s4analys()">
            บันทึก
          </button>
          <button class="button is-link is-light mx-1" @click="goBack()">
            ย้อนกลับ
          </button>
        </div>
      </div>
    </section>

    <!-- ผอ.ส่วน&ผอ.IT อนุมัติแก้ไข state5,6-->
    <section
      class="mt-4 has-text-centered"
      v-if="
        this.$parent.$data.user?.USER_ID == report.EDITOR_ID &&
        (report.STATE == 5 || report.STATE == 6)
      "
    >
      <button class="button is-success s56" @click="s5ModalActive = true">
        อนุมัติการแก้ไข
      </button>
      <button class="button is-link-light s56" @click="goBack()">
        ย้อนกลับ
      </button>
    </section>

    <!-- MODAL ยืนยัน state2 -->
    <div class="modal" :class="{ 'is-active': s1ModalActive }">
      <div class="modal-background"></div>
      <div class="modal-card">
        <header
          class="modal-card-head"
          :class="[
            s1ModalTheme ? 'has-background-success' : 'has-background-danger',
          ]"
        >
          <p class="modal-card-title">การยืนยัน</p>
          <button
            class="delete"
            aria-label="close"
            @click="s1ModalActive = false"
          ></button>
        </header>
        <section
          class="modal-card-body"
          :class="[
            s1ModalTheme
              ? 'has-background-success-light'
              : 'has-background-danger-light',
          ]"
        >
          {{ s1Modaltext }}
        </section>
        <footer class="modal-card-foot">
          <button
            class="button"
            :class="[s1ModalTheme ? 'is-success' : 'is-danger']"
            @click="s1Confirm()"
          >
            อนุมัติ
          </button>
          <button class="button" @click="s1ModalActive = false">ยกเลิก</button>
        </footer>
      </div>
    </div>

    <!-- MODAL แจ้งเตือน -->
    <div class="modal" :class="{ 'is-active': mAlertActive }">
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head is-info">
          <p class="modal-card-title">แจ้งเตือน</p>
          <button
            class="delete"
            aria-label="close"
            @click="reloadData()"
          ></button>
        </header>
        <section class="modal-card-body is-info">
          {{ mAlertText }}
        </section>
        <footer class="modal-card-foot has-text-right">
          <button class="button is-info" @click="reloadData()">OK</button>
        </footer>
      </div>
    </div>

    <!-- MODAL ยืนยัน state 5,6 -->
    <div class="modal" :class="{ 'is-active': s5ModalActive }">
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head has-background-success">
          <p class="modal-card-title">การยืนยันอนุมัติแก้ไข</p>
          <button
            class="delete"
            aria-label="close"
            @click="s5ModalActive = false"
          ></button>
        </header>
        <section class="modal-card-body has-background-success-light">
          <p>
            ระบบงาน:
            <span class="is-6 has-text-link">
              {{ report.SYSTEM_NAME }}
            </span>
          </p>
          <p>
            ผู้ขอแก้ไข:
            <span class="is-6 has-text-link"
              >{{ report.FIRST_NAME + " " + report.LAST_NAME }}
            </span>
          </p>
        </section>
        <footer class="modal-card-foot is-centered">
          <button class="button is-success" @click="s56Confirm()">
            อนุมัติ
          </button>
          <button class="button" @click="s5ModalActive = false">ยกเลิก</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "@/plugins/axios";
import vue2Dropzone from "vue2-dropzone";
import { required } from "vuelidate/lib/validators";
export default {
  components: {
    vueDropzone: vue2Dropzone,
  },
  data() {
    return {
      report: {},
      files: [],
      logs: [],
      // alert modal
      mAlertText: "",
      mAlertActive: false,
      // data state1
      s1ModalTheme: false,
      s1ModalActive: false,
      s1Modaltext: "",
      s1Status: "",
      // data state 2,3
      s23ArrStaff: [],
      s23AssignId: "",
      s3AssignDetails: "",
      // data state4
      s4Analysis: "",
      s4ReportType: "",
      filesUpload: [],
      filesUploadName: [],
      // data state5
      s5ModalActive: false,
      // dropzone
      dropzoneOptions: {
        url: "https://httpbin.org/post",
        thumbnailWidth: 200,
        maxFilesize: 0.5,
        headers: { "My-Awesome-Header": "header value" },
        addRemoveLinks: true,
        maxFiles: 5,
      },
    };
  },
  mounted() {
    this.getDetail();
  },
  methods: {
    // เปลี่ยน icon
    fileType(name,type){
      let indexDot = name.indexOf(".")
      if(name.slice(indexDot+1) == type){return true}
      else{return false}
    },
    // อัพโหลดไฟล์
    vsuccess(file) {
      this.filesUpload.push(file);
      this.filesUploadName.push(file.upload.filename);
    },
    // ลบไฟล์ที่เลือก
    vremove(file) {
      var index = this.filesUpload.indexOf(file);
      if (index > -1) {
        this.filesUpload.splice(index, 1);
        this.filesUploadName.splice(index, 1);
      }
    },
    // หาข้อมูล Report ไป server (ไฟล์ server/routes/report.js) ที่ get("/report/detail")
    async getDetail() {
      this.$parent.$data.isLoading = true;
      await axios
        .get("/report/detail", { params: { id: this.$route.params.id } })
        .then((res) => {
          this.report = res.data.report;
          this.files = res.data.files;
          this.logs = res.data.logs.sort((a, b) => {
            let da = a.LOG_DATE,
              db = b.LOG_DATE;
            if (da > db) {
              return -1;
            }
            if (da < db) {
              return 1;
            }
            return 0;
          });
          // ถ้า State2 จะหาข้อมูล ผอ.ส่วน
          if (res.data.report.STATE == 2) {
            this.getManager();
          } 
          // ถ้า State3 จะหาข้อมูล พนักงานในส่วน
          else if (res.data.report.STATE == 3) {
            this.getEmployee();
          }
          this.$parent.$data.isLoading = false;
        })
        .catch((e) => {
          this.$parent.$data.isLoading = false;
          alert(e.response.data);
          this.$router.push("/");
        });
    },
    // หาข้อมูล ผอ.ส่วน
    getManager() {
      axios
        .get("/team/manager")
        .then((res) => {
          this.s23ArrStaff = res.data;
        })
        .catch((e) => console.log(e.response.data));
    },
    // หาข้อมูล พนักงานในส่วน
    getEmployee() {
      axios
        .get("/team/employee")
        .then((res) => {
          this.s23ArrStaff = res.data;
        })
        .catch((e) => console.log(e.response.data));
    },
    // เรียกไฟล์
    filePath(file_path) {
      if (file_path) {
        return "http://localhost:3000/" + file_path;
      } else {
        return "https://bulma.io/images/placeholders/640x360.png";
      }
    },
    // เปลี่ยนสี
    logDot(index) {
      if (index == 0) {
        return "greenDot";
      } else {
        return "lightGreenDot";
      }
    },
    // ดึงข้อมูลใหม่อัพเดทข้อมูล
    reloadData() {
      this.getDetail();
      this.mAlertActive = false;
    },
    goBack() {
      this.$router.go(-1);
    },
    // เปลี่ยน Modal state1
    s1Modal(status) {
      this.s1Status = status;
      if (status == "approve") {
        this.s1ModalTheme = true;
        this.s1Modaltext = "ยืนยันที่จะ (อนุมัติ) การขอแก้ไขข้อมูล/ปัญหานี้";
        this.s1ModalActive = true;
      } else {
        this.s1ModalTheme = false;
        this.s1Modaltext = "ยืนยันที่จะ (ไม่อนุมัติ) การขอแก้ไขข้อมูล/ปัญหานี้";
        this.s1ModalActive = true;
      }
    },
    s1Confirm() {
      this.s1ModalActive = false;
      const data = {
        status: this.s1Status,
        reportId: this.$route.params.id,
      };
      axios
        .put("/report/confirm", data)
        .then((res) => {
          this.mAlertText = res.data;
          this.mAlertActive = true;
        })
        .catch((e) => console.log(e.response.data));
    },
    s23Assign() {
      if (!this.$v.s23AssignId.$invalid) {
        const data = {
          reportId: this.$route.params.id,
          nextEditorId: this.s23AssignId,
          assign_details: this.s3AssignDetails,
        };
        axios
          .put("/report/assign", data)
          .then((res) => {
            this.mAlertText = res.data;
            this.mAlertActive = true;
          })
          .catch((e) => console.log(e.response.data));
      }
    },
    s4analys() {
      if (!this.$v.s4Analysis.$invalid) {
        this.$parent.$data.isLoading = true;
        // set data //
        let formData = new FormData();
        const token = localStorage.getItem("ts-token");
        formData.append("token", token);
        formData.append("reportId", this.$route.params.id);
        formData.append("reportType", this.s4ReportType);
        formData.append("analysis", this.s4Analysis);
        Array.from(this.filesUpload).forEach((file) => {
          formData.append("File", file);
        });
        Array.from(this.filesUploadName).forEach((fileName) => {
          formData.append("fileNames", fileName);
        });
        // set data //
        axios
          .put("/report/analysis", formData)
          .then((res) => {
            this.mAlertText = res.data;
            this.$parent.$data.isLoading = false;
            this.mAlertActive = true;
          })
          .catch((e) => {
            console.log(e.response.data);
            this.$parent.$data.isLoading = false;
          });
      }
    },
    s56Confirm() {
      this.s5ModalActive = false;
      const data = {
        reportId: this.$route.params.id,
      };
      axios
        .put("/report/complete", data)
        .then((res) => {
          this.mAlertText = res.data;
          this.mAlertActive = true;
        })
        .catch((e) => console.log(e.response.data));
    },
  },
  computed: {
    darkModeStyle1() {
      if (!this.$parent.$data.darkMode) {
        return "border: solid 3px plum;";
      } else {
        return "border: solid 3px rgb(59, 59, 59);";
      }
    },
    darkModeStyle2() {
      if (!this.$parent.$data.darkMode) {
        return "background-color: lightskyblue;";
      } else {
        return "background-color: rgb(59, 59, 59);";
      }
    },
    darkModeStyle3() {
      if (!this.$parent.$data.darkMode) {
        return "border: 5px solid limegreen;";
      } else {
        return "border: 10px solid rgb(59, 59, 59);";
      }
    },
  },
  validations: {
    s23AssignId: {
      required: required,
    },
    s4Analysis: {
      required: required,
    },
  },
};
</script>

<style>
@import "vue2-dropzone/dist/vue2Dropzone.min.css";
#select {
  height: 40px;
}
.full-width {
  width: 100%;
}
.report-card:hover {
  cursor: pointer;
}
.root-rpShow {
  border-radius: 50;
  margin-top: 20px;
}
.rpShow {
  border-radius: 3px;
  margin-top: -2px;
}
#detail {
  max-width: 100%;
  display: flex;
}
/* .button {
  margin-left: 10px;
  margin-right: 10px;
} */
.box-shadow {
  -webkit-box-shadow: 0px 0px 5px 0px #000000;
  box-shadow: 0px 0px 5px 0px #000000;
  border-radius: 4px;
  padding: 10px;
}
/* Image */
.card-image {
  -webkit-box-shadow: 0px 0px 5px 0px #000000;
  box-shadow: 0px 0px 5px 0px #000000;
  padding: 10px;
  border-radius: 4px;
  justify-content: space-between;
  display: flex;
  align-items: center;
}
.card-image:hover {
  background-color: #c4c4c4;
}
/* Log */
.LogDot {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  margin-left: auto;
  margin-right: auto;
}
.greenDot {
  background-color: green;
  width: 25px;
  height: 25px;
}
.lightGreenDot {
  background: rgb(144, 243, 114);
}
section button.s56 {
  margin: 10px;
}

@media only screen and (max-width: 769px) {
  .dnon {
    display: none;
  }
  .popUpImage img {
    width: 95%;
  }
  .rpShow {
    margin-bottom: -4px;
  }
}

/* slider */
</style>
