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
    </section>
    <!-- button -->
    <div class="field is-grouped mt-3">
      <div class="control">
        <button
          class="button"
          @click="sentProblem"
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
import { required } from "@vuelidate/validators";
import { useVuelidate } from '@vuelidate/core'
import { ref } from "vue";
import { useDropzone } from "vue3-dropzone";
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
    const uploadedFiles = ref([]);

    const saveFiles = (files) => {
      uploadedFiles.value = files;
    };

    function onDrop(acceptedFiles, rejectedFiles) {
      saveFiles(acceptedFiles);
      console.log(rejectedFiles);
    }

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    const sentProblem = async () => {
      const formData = new FormData(); // pass data as a 
      formData.append("systemName", this.systemName);
      formData.append("details", this.details);
      for (let i = 0; i < uploadedFiles.value.length; i++) {
        formData.append("File", uploadedFiles.value[i]);
      }
      axios
        .post("/problem", formData)
        .then((response) => {
          console.info(response.data);
        })
        .catch((err) => {
          console.error(err);
        });
    };

    return {
      uploadedFiles,
      getRootProps,
      getInputProps,
      sentProblem,
      v$,
    };
  },
};
</script>

<style>
@import "@/css/dropzone.scss";
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
