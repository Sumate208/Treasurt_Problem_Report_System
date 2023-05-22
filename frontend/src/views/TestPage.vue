<template>
  <section class="hero is-fullheight">
    <div class="hero-body">
      <div class="container">
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
            <h1 class="is-size-4 mb-4">All Files ({{ uploadedFiles.length }})</h1>
            <Button class="is-danger mb-4 button" @click="uploadedFiles = []">Clear</Button>
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
                      <!-- <button @click="acceptedFiles.splice(index, 1)"> -->
                      <button @click="uploadedFiles.splice(index, 1)">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button @click="run">Upload Files</button>
            <!-- <button @click="uploadFiles">Upload Files</button> -->
            <!-- <button @click="(setData(text))">setdta</button> -->
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
// @ is an alias to /src
import axios from "@/plugins/axios";
import { ref  } from "vue";
import { useDropzone } from "vue3-dropzone";

export default {
  name: "TestPage",
  components: {
  },
  data() {
    return {
      text:'text',
    };
  },
  methods:{
    run(){
      this.setData(this.text);
      this.uploadFiles();
    },
  },
  setup() {
    var data = {};
    
    const setData = (inp) => {
      data = inp
    };

    const uploadedFiles = ref([]);

    const saveFiles = (files) => {
      uploadedFiles.value = files;
    };

    function onDrop(acceptedFiles, rejectedFiles) {
      saveFiles(acceptedFiles);
      console.log(rejectedFiles);
    }

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    const uploadFiles = async () => {
      console.log(data)
      const formData = new FormData(); // pass data as a form
      // formData.append("text", data.text.value);
      for (let i = 0; i < uploadedFiles.value.length; i++) {
        formData.append("File", uploadedFiles.value[i]);
      }
      axios
        .post("/test/upload", formData)
        .then((response) => {
          console.info(response.data);
        })
        .catch((err) => {
          console.error(err);
        });
    };

    return {
      setData,
      uploadedFiles,
      getRootProps,
      getInputProps,
      uploadFiles,
    };
  },

  computed(){
  }
};
</script>

<style lang="scss" scoped>

.dropzone {
  margin: auto;
  width: 400px;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  row-gap: 16px;
  border: 2px dashed #41b883;
  background-color: #fff;
  transition: 0.3s ease all;

  label {
    padding: 8px 12px;
    color: #fff;
    background-color: #41b883;
    transition: 0.3s ease all;
  }

  input {
    display: none;
  }
}

.active-dropzone {
  color: #fff;
  border-color: #fff;
  background-color: #41b883;

  label {
    background-color: #fff;
    color: #41b883;
  }
}
</style>
