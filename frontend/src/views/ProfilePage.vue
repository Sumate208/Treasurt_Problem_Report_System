<template>
  <div class="container is-widescreen">
    <section class="hero" v-if="user != null">
      <div class="hero-body">
        <div class="card mx-6 has-text-centered">
          <header class="card-header">
            <p class="card-header-title has-text-centered">ข้อมูลผู้ใช้</p>
          </header>
          <div class="card-content">
            <div class="content">
              <p>
                ชื่อผู้ใช้:
                {{
                  user.first_name +
                  " " +
                  user.last_name
                }}
              </p>
              <!-- ปัจจุบัน -->
              <div class="field">
                <label class="label">รหัสผ่านปัจจุบัน</label>
                <div class="control has-icons-right">
                  <input
                    :type="[showPass ? 'text' : 'password']"
                    :class="{'is-danger':(v$.password.$invalid && password != null)}"
                    v-model="password"
                    placeholder="รหัสเข้าใช้งานปัจจุบัน"
                    class="input"
                  />
                  <button
                    class="button is-right sPassBut"
                    @click="showPass = !showPass"
                  >
                    <span v-if="!showPass" class="icon is-small">
                      <font-awesome-icon icon="fa-solid fa-eye" />
                    </span>
                    <span v-else-if="showPass" class="icon is-small">
                      <font-awesome-icon icon="fa-solid fa-eye-slash" />
                    </span>
                  </button>
                </div>
                <template v-if="v$.password.$invalid && password != null">
                  <p class="help is-danger" v-if="!v$.password.required">
                    กรุณากรอกรหัสผ่านปัจจุบัน
                  </p>
                </template>
              </div>
              <!-- รหัสผ่านใหม่ -->
              <div class="field">
                <label class="label">รหัสผ่านใหม่</label>
                <div class="control has-icons-right">
                  <input
                    :type="[showNewPassword ? 'text' : 'password']"
                    :class="{'is-danger':(v$.newPassword.$invalid && newPassword != null)}"
                    v-model="newPassword"
                    placeholder="รหัสผ่านใหม่ต้องเป็นตัวอักษร a-z,A-Z และตัวเลข ไม่ต่ำกว่า 8 ตัวอักษร"
                    class="input"
                  />
                  <button
                    class="button is-right sPassBut"
                    @click="showNewPassword = !showNewPassword"
                  >
                    <span v-if="!showNewPassword" class="icon is-small">
                      <font-awesome-icon icon="fa-solid fa-eye" />
                    </span>
                    <span v-else-if="showNewPassword" class="icon is-small ">
                      <font-awesome-icon icon="fa-solid fa-eye-slash" />
                    </span>
                  </button>
                </div>
                <template v-if="v$.newPassword.$invalid && v$.newPassword.$model != null">
                  <p class="help is-danger" v-if="!v$.newPassword.required">
                    กรุณากรอกรหัสผ่าน
                  </p>
                  <p class="help is-danger" v-else-if="!v$.newPassword.minLength || !v$.newPassword.complex">
                    รหัสผ่านใหม่ไม่ถูกต้อง
                  </p>
                </template>
              </div>
              <!-- ยืนยันรหัสผ่านใหม่ -->
              <div class="field">
                <label class="label">ยืนยันรหัสผ่านใหม่</label>
                <div class="control has-icons-right">
                  <input
                    :type="[showconfirmNewPassword ? 'text' : 'password']"
                    :class="{'is-danger':(v$.confirmNewPassword.$invalid && confirmNewPassword != null)}"
                    v-model="confirmNewPassword"
                    placeholder="ยืนยันรหัสผ่านใหม่อีกครั้ง"
                    class="input"
                  />
                  <a
                    class="button is-right sPassBut"
                    @click="showconfirmNewPassword = !showconfirmNewPassword"
                  >
                    <span v-if="!showconfirmNewPassword" class="icon is-small">
                      <font-awesome-icon icon="fa-solid fa-eye" />
                    </span>
                    <span v-else-if="showconfirmNewPassword" class="icon is-small">
                      <font-awesome-icon icon="fa-solid fa-eye-slash" />
                    </span>
                  </a>
                </div>
                <template v-if="v$.confirmNewPassword.$invalid && confirmNewPassword != null">
                  <p class="help is-danger" v-if="!v$.confirmNewPassword.required">
                    กรุณากรอกยืนยันรหัสผ่านใหม่
                  </p>
                  <p class="help is-danger" v-else-if="!v$.confirmNewPassword.sameAs">
                    รหัสผ่านใหม่ไม่ตรงกัน
                  </p>
                </template>
              </div>
            </div>
          </div>
          <footer class="card-footer">
            <a class="card-footer-item" @click="opeModal()"
              >เปลี่ยนรหัสผ่าน</a
            >
          </footer>
        </div>
      </div>
    </section>

    <!-- Modal ยืนยัน -->
    <div class="modal" :class="{ 'is-active': modal_confirm }">
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">ยืนยันเปลี่ยนรหัสผ่าน</p>
          <button class="delete" aria-label="close" @click="cancel()"></button>
        </header>
        <section class="modal-card-body">
          <p>กดยืนยันเพื่อเปลี่ยนรหัสเข้าใช้งาน</p>
        </section>
        <footer class="modal-card-foot">
          <button class="button is-success" @click="changePass()">
            Confirm
          </button>
          <button class="button" @click="cancel()">Cancel</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "@/plugins/axios";
import { required, minLength, sameAs } from "@vuelidate/validators";
import { useVuelidate } from '@vuelidate/core'


// เช็คว่ารหัสตรงเงือนไขมั้ย
function complexPassword(value) {
  if (!(value.match(/[a-z]/) && value.match(/[A-Z]/) && value.match(/[0-9]/))) {
    return false;
  }
  return true;
}
export default {
  name: "ProfilePage",
  setup: () => ({ v$: useVuelidate() }),
  data() {
    return {
      user: null,
      modal_confirm: false,
      password: null,
      showPass:false,
      newPassword: null,
      showNewPassword:false,
      confirmNewPassword: null,
      showconfirmNewPassword:false,
    };
  },
  mounted(){
    this.user = JSON.parse(localStorage.getItem("ts-user"));
  },
  validations () {
    return {
      password: {
        required: required,
      },
      newPassword: {
        required: required,
        minLength: minLength(8),
        complex: complexPassword,
      },
      confirmNewPassword: {
        required: required,
        sameAs: sameAs("newPassword"),
      },
    }
  },
  methods: {
    cancel() {
      this.modal_confirm = !this.modal_confirm;
    },
    opeModal() {
      if (!this.v$.$invalid) {
        this.modal_confirm = true;
      }
    },
    changePass() {
      this.v$.$touch();
      if (!this.v$.$invalid) {
        const data = {
          password: this.state.password,
          newPassword: this.state.newPassword,
          confirmNewPassword: this.state.confirmNewPassword,
        };
        axios
          .post("/change-password", data)
          .then((res) => {
            this.modal_confirm = false;
            alert(res.data.msg);
          })
          .catch((error) => {
            this.error = error.response.data;
            console.log(error.response.data);
          });
      }
    },
  },
};
</script>

<style>
.container {
  min-height: 95vh;
}
.sPassBut {
  position: absolute;
  right: 0;
  border: hidden;
  outline: none;
  box-shadow: none;
  margin: 2px;
  width: 35px;
  height: 35px;
}
.card-footer-item:hover {
  background-color: #485fc7;
  color:white;
}
.card-footer-item .has-text-white:hover {
  background-color: white;
  color:black;
}
</style>
