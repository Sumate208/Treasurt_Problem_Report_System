<template>
  <section class="hero">
    <div class="hero-body">
      <div class="container">
        <div class="columns is-centered has-text-centered">
          <div class="column is-5-tablet is-4-desktop is-3-widescreen">
            <form action="" class="box">
              <div class="field">
                <label class="label">Username</label>
                <div class="control has-icons-left">
                  <input
                    type="text"
                    v-model="$v.username.$model"
                    :class="{
                      'is-danger': $v.username.$invalid && username != null,
                    }"
                    placeholder="รหัสบัตรประชาชน 13 หลัก"
                    class="input"
                  />
                  <span class="icon is-small is-left">
                    <font-awesome-icon icon="fa-solid fa-user" />
                  </span>
                </div>
                <template v-if="$v.username.$invalid && username != null">
                  <p class="help is-danger" v-if="!$v.username.required">
                    กรุณากรอกชื่อผู้ใช้งาน
                  </p>
                </template>
              </div>

              <div class="field">
                <label class="label">Password</label>
                <div class="control has-icons-left has-icon-right">
                  <input
                    :type="[showPass ? 'text' : 'password']"
                    :class="{
                      'is-danger': $v.password.$invalid && password != null,
                    }"
                    v-model="$v.password.$model"
                    placeholder="รหัสผ่าน"
                    class="input"
                  />
                  <span class="icon is-small is-left">
                    <font-awesome-icon icon="fa-solid fa-lock" />
                  </span>
                  <button
                    id="sPassBut"
                    class="button is-right"
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
                <template v-if="$v.password.$invalid && password != null">
                  <p class="help is-danger">กรุณากรอกรหัสผ่าน</p>
                </template>
              </div>

              <div class="field">
                <label for="" class="checkbox">
                  <input type="checkbox" v-model="remember" />
                  จดจำ username
                </label>
              </div>
              <div class="field">
                <button @click="submit()" class="button is-success mx-2">
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    
    <!-- MODAL -->
    <div class="modal" :class="{ 'is-active': modalAlert }">
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Alert</p>
          <button
            class="delete"
            aria-label="close"
            @click="modalAlert = false"
          ></button>
        </header>
        <section class="modal-card-body">
          {{ mAlertText }}
        </section>
        <footer class="modal-card-foot">
          <button class="button" @click="modalAlert = false">OK</button>
        </footer>
      </div>
    </div>
  </section>
</template>

<script>
import axios from "axios";
import { required } from "vuelidate/lib/validators";
export default {
  data() {
    return {
      username: null,
      password: null,

      remember: false,
      showPass: false,
      error: "",
      mAlertText: "",
      modalAlert: false,
    };
  },
  mounted() {
    // this.inLogin()
    this.loadUsername();
  },
  methods: {
    loadUsername() {
      const rememLs = localStorage.getItem("username");
      if (rememLs) {
        this.username = rememLs;
        this.remember = true;
      }
    },
    submit() {
      if (!this.$v.$invalid) {
        this.$parent.$data.isLoading = true;
        const data = {
          username: this.username,
          password: this.password,
        };
        axios
          .post("http://localhost:3000/user/signin", data)
          .then((res) => {
            if (this.remember) {
              localStorage.setItem("username", this.username);
            }
            if (localStorage.getItem("username") && !this.remember) {
              localStorage.removeItem("username");
            }
            const token = res.data.token;
            localStorage.setItem("ts-token", token);
            this.$emit("auth-change");
            this.$router.push({ path: "/" });
            this.$parent.$data.isLoading = false;
          })
          .catch((err) => {
            this.mAlertText = err.response.data;
            this.$parent.$data.isLoading = false;
            this.modalAlert = true;
          });
      }
    },
  },
  validations: {
    username: {
      required: required,
    },
    password: {
      required: required,
    },
  },
};
</script>

<style>
.body {
  padding-top: 20px;
  padding-left: 20vw;
  padding-right: 20vw;
}
#sPassBut {
  position: absolute;
  right: 0;
  border: hidden;
  outline: none;
  box-shadow: none;
  margin: 2px;
  width: 35px;
  height: 35px;
}
.modal-card-foot {
  justify-content: end;
}
</style>
