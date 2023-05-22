<template>
  <div class="container pt-5 px-6 pb-6">
    <p class="is-size-4-tablet has-text-centered">
      รายละเอียดขอแก้ไขข้อมูลหรือข้อผิดพลาดระบบงาน
    </p>

    <!-- Detail ส่วนของผู้แจ้ง -->
    <section>
      <div class="root-rpShow px-3">
        <div class="columns is-desktop">
          <div
            style="background-color: #bbb"
            class="column is-full rpShow has-text-centered"
          >
            <h3 class="is-size-5">ส่วนของผู้แจ้งปัญหาระบบงาน</h3>
          </div>
        </div>
        <div class="columns is-desktop">
          <div
            class="column is-full rpShow has-text-left"
          >
            <label class="has-text-grey"
              >ชื่อระบบงาน:
              <span class="has-text-black">{{
                problem.system_name
              }}</span>
            </label>
          </div>
        </div>
        <div class="columns is-desktop">
          <div
            class="column is-full rpShow has-text-left"
          >
            <label class="has-text-grey"
              >สำนัก/กอง/กลุ่ม/สนง.ธพ:
              <span class="has-text-black">{{ problem.agency }}</span></label
            >
          </div>
        </div>
        <div class="columns is-desktop">
          <div
            class="column is-half-desktop is-full-mobile rpShow has-text-left"
          >
            <label class="has-text-grey"
              >ชื่อ-สกุล ผู้ขอแก้ไข:
              <span class="has-text-black">{{
                problem.first_name + " " + problem.last_name
              }}</span></label
            >
          </div>
          <div
            class="column is-half-desktop is-full-mobile rpShow has-text-left"
          >
            <label class="has-text-grey"
              >วันที่ขอแก้ไข:
              <span class="has-text-black">{{ problem.write_date }}</span></label
            >
          </div>
        </div>
        <div class="columns is-desktop">
          <div
            class="column is-full rpShow has-text-left"
          >
            <label class="has-text-grey"
              >ตำแหน่ง:
              <span class="has-text-black">{{ problem.job_title }}</span></label
            >
          </div>
        </div>
        <div class="columns is-desktop">
          <div
            class="column is-full rpShow has-text-left"
          >
            <label class="has-text-grey" id="detail"
              >รายละเอียดการขอแก้ไข:
              <span class="has-text-black">{{ problem.details }}</span></label
            >
          </div>
        </div>
      </div>

      <!-- แสดง FILES ส่วนของผู้แจ้ง -->
      <div v-if="files[0]" class="columns is-multiline mt-3">
        <div
          v-for="(file, index) in 
            files.filter((file) => {
              return file.part == 0;
            })"
          :key="index"
          class="column is-one-fifth"
        >
          <a class="card" :href="filePath(file.path)" target="_BLANK">
            <div class="card-image">
              <span style="overflow-x: hidden;">{{file.file_name}}</span>
              <span class="mx-1">
                <font-awesome-icon v-if="fileType(file.file_name,'pdf')" icon="fa-solid fa-file-pdf" />
                <font-awesome-icon v-else-if="fileType(file.file_name,'jpg') || fileType(file.file_name,'png')" icon="fa-solid fa-file-image" />
                <font-awesome-icon v-else-if="fileType(file.file_name,'docx')" icon="fa-solid fa-file-word" />
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
          problem.analysis ||
          (problem.assign_details &&
            this.user?.user_type == 'staff')
        "
        class="root-rpShow px-3"
      >
        <div class="columns is-desktop">
          <div
            style="background-color: #bbb"
            class="column is-full rpShow has-text-centered"
          >
            <h3 class="is-size-5">
              ส่วนของศูนย์เทคโนโลยีสารสนเทศและการสื่อสาร
            </h3>
          </div>
        </div>
        <div
          class="columns is-desktop"
          v-if="
            problem.assign_details &&
            this.user?.user_type == 'staff'
          "
        >
          <div
            class="column is-full rpShow has-text-left"
          >
            <label class="has-text-grey"
              >รายละเอียดการมอบหมาย:
              <span class="has-text-black">{{
                problem.assign_details
              }}</span></label
            >
          </div>
        </div>
        <div class="columns is-desktop" v-if="problem.analysis">
          <div
            class="column is-full rpShow has-text-left"
          >
            <label class="has-text-grey"
              >ประเภท:
              <span class="has-text-black">{{
                problem.problem_type || "ไม่ระบุ"
              }}</span></label
            >
          </div>
        </div>
        <div class="columns is-desktop" v-if="problem.analysis">
          <div
            class="column is-full rpShow has-text-left"
          >
            <label class="has-text-grey" id="detail"
              >ผลการวิเคราะห์/การแก้ไข:
              <span class="has-text-black">{{ problem.analysis }}</span></label
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
          <a class="card" :href="filePath(file.path)" target="_BLANK">
            <div class="card-image">
              <span style="overflow-x: hidden;">{{file.file_name}}</span>
              <span class="mx-1">
                <font-awesome-icon v-if="fileType(file.file_name,'pdf')" icon="fa-solid fa-file-pdf" />
                <font-awesome-icon v-else-if="fileType(file.file_name,'jpg') || fileType(file.file_name,'png')" icon="fa-solid fa-file-image" />
                <font-awesome-icon v-else-if="fileType(file.file_name,'docx')" icon="fa-solid fa-file-word" />
                <font-awesome-icon v-else icon="fa-solid fa-file" />
              </span>
           </div>
          </a>
        </div>
      </div>
    </section>
    
    <!-- Problem_Logs -->
    <section class="mt-4">
      <div
        class="box-shadow"
      >
        <p
          class="is-size-4-tablet has-text-centered mb-3"
        >
          ติดตามผล
        </p>
        <div v-for="(log, index) in logs" :key="index">
          <div class="columns is-tablet px-6">
            <div class="column is-2-tablet is-2-mobile has-text-left">
              <label> {{ log.log_date }} </label>
            </div>
            <div class="column is-1-tablet is-1-mobile dnon has-text-centered">
              <div class="LogDot" :class="logDot(index)"></div>
            </div>
            <div class="column has-text-left">
              <label>{{ log.discription }}</label>
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
        this.user?.user_id == problem.editor_id &&
        problem.state == 1
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
        this.user?.user_id == problem.editor_id &&
        (problem.state == 2 || problem.state == 3)
      "
    >
      <div class="control">
        <!-- state2 -->
        <div
          v-if="problem.state == 2"
          class="select is-fullwidth"
          :class="[v$.s23AssignId.$invalid ? 'is-danger' : 'is-success']"
        >
          <select id="select" v-model="s23AssignId">
            <option value="" disabled selected>เลือกส่วนงานที่รับผิดชอบ</option>
            <optgroup
              v-for="(staff, index) in s23ArrStaff"
              :key="index"
              :label="'ส่วน' + staff.team"
            >
              <option :value="staff.user_id">
                {{ staff.first_name + " " + staff.last_name }}
              </option>
            </optgroup>
          </select>
        </div>

        <!-- state3 -->
        <div class="field" v-if="problem.state == 3">
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
          v-if="problem.state == 3"
          class="select is-fullwidth"
          :class="[v$.s23AssignId.$invalid ? 'is-danger' : 'is-success']"
        >
          <select id="select" v-model="s23AssignId">
            <option value="" disabled selected>เลือกผู้ดำเนินการ</option>
            <option
              v-for="(staff, index) in s23ArrStaff"
              :value="staff.user_id"
              :key="index"
            >
              {{ staff.first_name + " " + staff.last_name }}
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
        this.user?.user_id == problem.editor_id &&
        problem.state == 4
      "
    >
      <div class="mt-4">
        <div class="field">
          <div class="control">
            <label class="radio">
              <input
                type="radio"
                v-model="s4ProblemType"
                value="Bug/Error"
                name="problemType"
              />
              Bug/Error
            </label>
            <label class="radio">
              <input
                type="radio"
                v-model="s4ProblemType"
                value="แก้ไขข้อมูล"
                name="problemType"
              />
              แก้ไขข้อมูล
            </label>
          </div>
        </div>
        <div class="field">
          <label class="label">ผลการวิเคราะห์/การแก้ไข</label>
          <div class="control">
            <textarea
              v-model="s4Analysis"
              class="textarea"
              placeholder="ความยาวไม่เกิน 1000 ตัวอักษร"
              :class="[v$.s4Analysis.$invalid ? 'is-danger' : 'is-success']"
            ></textarea>
          </div>
        </div>
        <!-- DropZone -->
        <div class="mt-4">
          <div > <!-- DropZone -->
            <div v-bind="getRootProps()" class="dropzone">
              <input v-bind="getInputProps()"/>
              <p v-if="isDragActive">Drop the files here ...</p>
              <p v-else>Drag 'n' drop some files here, or click to select files</p>
            </div>
          </div>
          <!-- Display Files -->
          <div class="columns">
            <div class="column is-12 pt-6">
              <div>
                <h1 class="is-size-4 mb-4">All Files ({{ uploadedFiles.length }})</h1>
                <Button class="is-danger mb-4 button" @click="uploadedFiles = []">Clear</Button>
              </div>
              <div class="container is-max-desktop">
                <div class="is-multiline columns is-variable is-2">
                  <div id="card_product" class="column is-one-fifth" v-for="file,index in uploadedFiles" :key="index">
                    <div class="card">
                      <div class="card-content">
                        <font-awesome-icon :icon="['fasr', 'file-word']" size="2xl" v-if="file.type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'"/>
                        <font-awesome-icon :icon="['fas', 'file-pdf']" size="2xl" v-else-if="file.type == 'application/pdf'"/>
                        <font-awesome-icon :icon="['fas', 'file-image']" size="2xl" v-else-if="file.type == 'image/png' || file.type == 'image/jpeg'"/>
                        <font-awesome-icon :icon="['fas', 'file']" size="2xl" v-else/>
                        <div class="media">
                          <div class="media-content">
                            <p>{{ file.name }}</p>
                          </div>
                        </div>
                        <button @click="uploadedFiles.splice(index, 1)">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
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
        this.user?.user_id == problem.editor_id &&
        (problem.state == 5 || problem.state == 6)
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
              {{ problem.system_name }}
            </span>
          </p>
          <p>
            ผู้ขอแก้ไข:
            <span class="is-6 has-text-link"
              >{{ problem.first_name + " " + problem.last_name }}
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
import { required} from "@vuelidate/validators";
import { useVuelidate } from '@vuelidate/core'
import { ref } from "vue";
import { useDropzone } from "vue3-dropzone";

export default {
  name:"ProblemDetail",
  data() {
    return {
      problem: {},
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
      s4ProblemType: "",
      // data state5
      s5ModalActive: false,
      // dropzone
    };
  },
  mounted() {
    this.getDetail();
  },
  methods: {
    // หาข้อมูล problem ไป server (ไฟล์ server/routes/problem.js) ที่ get("/problem/detail")
    async getDetail() {
      await axios
        .get("/problem/detail", { params: { id: this.$route.params.id } })
        .then((res) => {
          this.problem = res.data.problem;
          this.files = res.data.files;
          this.logs = res.data.logs.sort((a, b) => {
            let da = a.log_date,
              db = b.log_date;
            if (da > db) {
              return -1;
            }
            if (da < db) {
              return 1;
            }
            return 0;
          });
          // ถ้า State2 จะหาข้อมูล ผอ.ส่วน
          if (res.data.problem.state == 2) {
            this.getManager();
          } 
          // ถ้า State3 จะหาข้อมูล พนักงานในส่วน
          else if (res.data.problem.state == 3) {
            this.getEmployee();
          }
        })
        .catch((e) => {
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
        problemId: this.$route.params.id,
      };
      axios
        .put("/problem/confirm", data)
        .then((res) => {
          this.mAlertText = res.data;
          this.mAlertActive = true;
        })
        .catch((e) => console.log(e.response.data));
    },
    s23Assign() {
      if (!this.v$.s23AssignId.$invalid) {
        const data = {
          problemId: this.$route.params.id,
          nextEditorId: this.s23AssignId,
          assign_details: this.s3AssignDetails,
        };
        axios
          .put("/problem/assign", data)
          .then((res) => {
            this.mAlertText = res.data;
            this.mAlertActive = true;
          })
          .catch((e) => console.log(e.response.data));
      }
    },
    s4analys(){
      const token = localStorage.getItem("ts-token");
      this.setData({
        token: token,
        problemId: this.$route.params.id,
        problemType: this.s4ProblemType,
        analysis: this.s4Analysis,
      });
      this.sendRequest();
    },
    s56Confirm() {
      this.s5ModalActive = false;
      const data = {
        problemId: this.$route.params.id,
      };
      axios
        .put("/problem/complete", data)
        .then((res) => {
          this.mAlertText = res.data;
          this.mAlertActive = true;
        })
        .catch((e) => console.log(e.response.data));
    },
  },
  computed: {
  },
  validations () {
    return {
      s23AssignId: {
        required: required,
      },
    }
  },
  setup() {
    var data = {};
    const v$ = useVuelidate();
    const uploadedFiles = ref([]);

    const saveFiles = (files) => {
      uploadedFiles.value = files;
    };

    function onDrop(acceptedFiles, rejectedFiles) {
      saveFiles(acceptedFiles);
      console.log(rejectedFiles);
    }

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    const sendRequest = async () => {
      const formData = new FormData(); // pass data as a 
      formData.append("token", data.token);
      formData.append("problemId", data.problemId);
      formData.append("problemType", data.problemType);
      formData.append("analysis", data.analysis);
      for (let i = 0; i < uploadedFiles.value.length; i++) {
        formData.append("File", uploadedFiles.value[i]);
      }
      axios
        .put("/problem/analysis", formData)
        .then((res) => {
          this.mAlertText = res.data;
          this.mAlertActive = true;
        })
        .catch((e) => {
          console.log(e.response.data);
        });
    };

    return {
      uploadedFiles,
      getRootProps,
      getInputProps,
      sendRequest,
      v$,
    };
  },
};
</script>

<style>
@import "@/css/dropzone.scss";
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
