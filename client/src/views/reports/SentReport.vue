<template>
  <div class="container pt-6 px-6 pb-6">
    <!-- ฟอร์มกรอกแจ้งปัญหา -->
    <section>
      <div class="root-rpForm">
        <div class="columns is-desktop">
          <div
            class="column is-full rpForm text-center"
            style="background-color: #aaa"
          >
            <h3 :class="{ 'has-text-white': this.$parent.$data.darkMode }">
              การแจ้งขอแก้ไขข้อมูลหรือข้อผิดพลาดระบบงาน
            </h3>
          </div>
        </div>
        <div class="columns is-desktop">
          <div class="column is-full rpForm has-text-left">
            <div class="field is-horizontal">
              <div class="field-label">
                <label
                  :class="{ 'has-text-white': this.$parent.$data.darkMode }"
                  >ชื่อระบบงาน :</label
                >
              </div>
              <div class="field-body">
                <input
                  type="text"
                  class="input is-small rpInput"
                  v-model="systemName"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="columns is-desktop">
          <div class="column is-full rpForm has-text-left">
            <div class="field is-horizontal">
              <div class="field-label">
                <label
                  :class="{ 'has-text-white': this.$parent.$data.darkMode }"
                  >สำนัก/กอง/กลุ่ม/สนง.ธพ :</label
                >
              </div>
              <div class="field-body">
                <input
                  type="text"
                  class="input is-small rpInput"
                  v-model="agency"
                  disabled
                />
              </div>
            </div>
          </div>
        </div>
        <div class="columns is-desktop">
          <div class="column is-half-desktop rpForm has-text-left">
            <div class="field is-horizontal">
              <div class="field-label">
                <label
                  :class="{ 'has-text-white': this.$parent.$data.darkMode }"
                  >ชื่อ-สกุล ผู้ขอแก้ไข :</label
                >
              </div>
              <div class="field-body">
                <input
                  type="text"
                  class="input is-small rpInput"
                  v-model="fullname"
                  disabled
                />
              </div>
            </div>
          </div>
          <div class="column rpForm has-text-left">
            <div class="field is-horizontal">
              <div class="field-label">
                <label
                  :class="{ 'has-text-white': this.$parent.$data.darkMode }"
                  >วันที่ขอแก้ไข :</label
                >
              </div>
              <div class="field-body">
                <input
                  type="text"
                  class="input is-small rpInput"
                  v-model="timeNow"
                  disabled
                />
              </div>
            </div>
          </div>
        </div>
        <div class="columns is-desktop">
          <div class="column is-full rpForm has-text-left">
            <div class="field is-horizontal">
              <div class="field-label">
                <label
                  :class="{ 'has-text-white': this.$parent.$data.darkMode }"
                  >ตำแหน่ง :</label
                >
              </div>
              <div class="field-body">
                <input
                  type="text"
                  class="input is-small rpInput"
                  v-model="job_title"
                  disabled
                />
              </div>
            </div>
          </div>
        </div>
        <div class="columns is-desktop">
          <div class="column is-full rpForm has-text-left">
            <label :class="{ 'has-text-white': this.$parent.$data.darkMode }"
              >รายละเอียดการขอแก้ไข</label
            >
            <textarea
              class="textarea"
              rows="4"
              v-model="details"
              placeholder="ระบุรายละเอียดของข้อมูลที่ต้องการแก้ไขปัญหาที่เกิด"
            ></textarea>
          </div>
        </div>
      </div>
      <!-- อัพโหลดไฟล์ -->
      <vue-dropzone
        class="mt-5"
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
    </section>
    <!-- button -->
    <div class="field is-grouped mt-3">
      <div class="control">
        <button
          class="button"
          :class="[this.$parent.$data.darkMode ? 'is-dark' : 'is-link']"
          @click="submit()"
        >
          ส่งรายงานปัญหา
        </button>
      </div>
    </div>

    <!-- MODAL -->
    <div class="modal" :class="{ 'is-active': modalAlert }">
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Alert</p>
          <button class="delete" aria-label="close" @click="goBack()"></button>
        </header>
        <section class="modal-card-body">
          {{ mAlertText }}
        </section>
        <footer class="modal-card-foot">
          <button class="button" @click="goBack()">OK</button>
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
      user: null,
      systemName: "",
      agency: this.$parent.$data.user.AGENCY,
      first_name: this.$parent.$data.user.FIRST_NAME,
      last_name: this.$parent.$data.user.LAST_NAME,
      job_title: this.$parent.$data.user.JOB_TITLE,
      details: "",
      filesUpload: [],
      filesUploadName: [], // array of image

      // modal
      modalAlert: false,
      mAlertText: "",
      success: false,
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
  mounted() {},
  methods: {
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
    // ส่งแจ้งปัญหา
    submit() {
      this.$parent.$data.isLoading = true;
      // set data //
      let formData = new FormData();
      const token = localStorage.getItem("ts-token");
      formData.append("token", token);
      formData.append("systemName", this.systemName);
      formData.append("details", this.details);
      Array.from(this.filesUpload).forEach((file) => {
        formData.append("File", file);
      });
      Array.from(this.filesUploadName).forEach((fileName) => {
        formData.append("fileNames", fileName);
      });
      // set data ///

      // request บันทึก report ไป server (ไฟล์ server/routes/report.js) ที่ post("/report")
      axios
        .post("/report", formData)
        .then((res) => {
          this.mAlertText = res.data;
          this.$parent.$data.isLoading = false;
          this.modalAlert = true;
          this.success = true;
        })
        .catch((e) => {
          this.mAlertText = e.response.data;
          this.$parent.$data.isLoading = false;
          this.modalAlert = true;
          console.log(e.response.data);
        });
    },
    goBack() {
      this.modalAlert = false;
      if (this.success) {
        this.$router.go(-1);
      }
    },
  },
  validations: {
    fullname: {
      required: required,
    },
    agency: {
      required: required,
    },
  },
  computed: {
    timeNow() {
      return new Date().toLocaleDateString("th-TH");
    },
    fullname() {
      return this.first_name + " " + this.last_name;
    },
  },
};
</script>

<style>
@import "vue2-dropzone/dist/vue2Dropzone.min.css";
select {
  width: 100%;
  max-height: 25px;
}
.select {
  width: 100%;
  max-height: 25px;
}
#reportDetail {
  width: 100%;
  height: 100%;
}
.rpForm {
  border: solid 0.5px black;
}
.rpInput {
  width: 100%;
}
</style>
