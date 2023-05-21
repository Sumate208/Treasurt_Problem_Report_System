<template>
  <div class="container pt-6 px-6 pb-6">
    <!-- ฟอร์มกรอกแจ้งปัญหา -->
    <section v-if="user != null">
      <div class="root-rpForm">
        <div class="columns is-desktop">
          <div
            class="column is-full rpForm text-center"
            style="background-color: #aaa"
          >
            <h3>
              การแจ้งขอแก้ไขข้อมูลหรือข้อผิดพลาดระบบงาน
            </h3>
          </div>
        </div>
        <div class="columns is-desktop">
          <div class="column is-full rpForm has-text-left">
            <div class="field is-horizontal">
              <div class="field-label">
                <label
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
                  >สำนัก/กอง/กลุ่ม/สนง.ธพ :</label
                >
              </div>
              <div class="field-body">
                <input
                  type="text"
                  class="input is-small rpInput"
                  v-model="user.agency"
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
                  >ตำแหน่ง :</label
                >
              </div>
              <div class="field-body">
                <input
                  type="text"
                  class="input is-small rpInput"
                  v-model="user.job_title"
                  disabled
                />
              </div>
            </div>
          </div>
        </div>
        <div class="columns is-desktop">
          <div class="column is-full rpForm has-text-left">
            <label>รายละเอียดการขอแก้ไข</label>
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
      <div>
        <div v-if="state.files.length > 0" class="files">
          <div class="file-item" v-for="(file, index) in state.files" :key="index">
            <span>{{ file.name }}</span>
            <span class="delete-file" @click="handleClickDeleteFile(index)">
              Delete
            </span>
          </div>
        </div>
        <div v-else class="dropzone" v-bind="getRootProps()">
          <div
            class="border"
            :class="{
              isDragActive,
            }"
          >
            <input v-bind="getInputProps()" />
            <p v-if="isDragActive">Drop the files here ...</p>
            <p v-else>Drag and drop files here, or Click to select files</p>
          </div>
        </div>
      </div>    
    </section>
    <!-- button -->
    <div class="field is-grouped mt-3">
      <div class="control">
        <button
          class="button"
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
import { useDropzone } from 'vue3-dropzone';
import { required } from "@vuelidate/validators";
import { useVuelidate } from '@vuelidate/core'

export default {
  mame:"SentProblem",
  data() {
    return {
      user: null,
      systemName: "",
      details: "",
      filesUpload: [],
      filesUploadName: [], // array of image

      // modal
      modalAlert: false,
      mAlertText: "",
      success: false,
    };
  },
  mounted(){
    this.user = JSON.parse(localStorage.getItem("ts-user"));
  },
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
      formData.append("systemName", this.systemName);
      formData.append("details", this.details);
      Array.from(this.filesUpload).forEach((file) => {
        formData.append("File", file);
      });
      Array.from(this.filesUploadName).forEach((fileName) => {
        formData.append("fileNames", fileName);
      });
      // set data ///

      // request บันทึก problem ไป server (ไฟล์ server/routes/problem.js) ที่ post("/problem")
      axios
        .post("/problem", formData)
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
  validations() {
    return {
      fullname: {
        required: required,
      },
      agency: {
        required: required,
      },
    }
  },
  computed: {
    timeNow() {
      return new Date().toLocaleDateString("th-TH");
    },
    fullname() {
      return this.user.first_name + " " + this.user.last_name;
    },
  },
  setup() {
    const v$ = useVuelidate();
    const url = "{your_url}"; // Your url on the server side
    const saveFiles = (files) => {
      const formData = new FormData(); // pass data as a form
      for (var x = 0; x < files.length; x++) {
        // append files as array to the form, feel free to change the array name
        formData.append("images[]", files[x]);
      }

      // post the formData to your backend where storage is processed. In the backend, you will need to loop through the array and save each file through the loop.

      axios
        .post(url, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          console.info(response.data);
        })
        .catch((err) => {
          console.error(err);
        });
    };

    function onDrop(acceptFiles, rejectReasons) {
      saveFiles(acceptFiles); // saveFiles as callback
      console.log(rejectReasons);
    }

    const { getRootProps, getInputProps, ...rest } = useDropzone({ onDrop });

    return {
      getRootProps,
      getInputProps,
      ...rest,
      v$,
    };
  },
};
</script>

<style>
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
