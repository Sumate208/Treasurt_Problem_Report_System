<template>
  <section>
    <vue-dropzone
      ref="myVueDropzone"
      id="dropzone"
      :options="dropzoneOptions"
      @vdropzone-success="vsuccess"
      @vdropzone-removed-file="vremove"
    >
    <a class="button">Remove file</a>
    </vue-dropzone>

    <button class="button is-info" @click="submit()">Upload</button>

    <div v-if="fileQuery[0]" class="columns is-multiline mt-3">
      <div
        v-for="(file,index) in fileQuery"
        :key="index"
        class="column is-one-quarter"
      >
        <div class="card">
          <div class="card-image">
            <a :href="filePath(file.PATH)" target="_BLANK">{{ file.FILE_NAME }}</a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import axios from "@/plugins/axios";
import vue2Dropzone from "vue2-dropzone";
export default {
  components: {
    vueDropzone: vue2Dropzone,
  },
  data() {
    return {
      path: "\\uploads\\File-1661279190831.pdf",
      images: [],
      filesUpload: [],
      filesUploadName: [],
      fileQuery: [],
      test: "ทดสอบ",
      dropzoneOptions: {
        url: "https://httpbin.org/post",
        thumbnailWidth: 150,
        maxFilesize: 0.5,
        headers: { "My-Awesome-Header": "header value" },
        addRemoveLinks:true,
        maxFiles:5,
      },
    };
  },
  mounted() {
    this.getFiles();
  },
  methods: {
    vsuccess(file) {
      this.filesUpload.push(file);
      this.filesUploadName.push(file.upload.filename)
    },
    vremove(file) {
      var index = this.filesUpload.indexOf(file);
      if(index > -1){
        this.filesUpload.splice(index,1)
        this.filesUploadName.splice(index,1)
      }
    },
    submit() {
      let formData = new FormData();
      formData.append("test", this.test);
      // formData.append("fileNames", this.filesUploadName);
      Array.from(this.filesUpload).forEach((file) => {
        formData.append("File", file);
      });
      Array.from(this.filesUploadName).forEach((fileName) => {
        formData.append("fileNames", fileName);
      });
      console.log(formData);
      axios
        .post("/upload", formData)
        .then((res) => {
          console.log(res.data);
        })
        .catch((e) => {
          console.log(e.response.data);
        });
    },
    filePath(file_path) {
      if (file_path) {
        return "http://localhost:3000/" + file_path;
      }
    },
    async getFiles() {
      await axios
        .get("/file", { params: { id: 1 } })
        .then((res) => {
          this.fileQuery = res.data.files;
        })
        .catch((e) => {
          alert(e.response.data);
        });
    },
  },
};
</script>

<style>
@import "vue2-dropzone/dist/vue2Dropzone.min.css";
</style>
