<template>
  <section class="hero is-fullheight">
    <div class="hero-body">
      <div class="container">
        <div class="columns is-centered has-text-centered">
          <div class="column is-5">
            <form action="" class="box">
              <!-- ชื่อ -->
              <div class="field">
                <label for="" class="label">ชื่อจริง</label>
                <div class="control has-icons-left">
                  <input
                    v-model="first_name"
                    type="text"
                    placeholder="ชื่อจริง"
                    class="input"
                    :class="{
                      'is-danger': v$.first_name.$invalid && first_name != null,
                    }"
                  />
                  <span class="icon is-small is-left">
                    <font-awesome-icon icon="fa-solid fa-user" />
                  </span>
                </div>
                <template v-if="v$.first_name.$invalid && first_name != null">
                  <p class="help is-danger">*กรุณากรอกชื่อจริง</p>
                </template>
              </div>
              <!-- นามสกุล -->
              <div class="field">
                <label class="label">นามสกุล</label>
                <div class="control has-icons-left">
                  <input
                    v-model="last_name"
                    type="text"
                    placeholder="นามสกุล"
                    class="input"
                    :class="{
                      'is-danger': v$.last_name.$invalid && last_name != null,
                    }"
                  />
                  <span class="icon is-small is-left">
                    <font-awesome-icon icon="fa-solid fa-user" />
                  </span>
                </div>
                <template v-if="v$.last_name.$invalid && last_name != null">
                  <p class="help is-danger">*กรุณากรอกนามสกุล</p>
                </template>
              </div>
              <!-- รหัสบัตรประชาชน -->
              <div class="field">
                <label for="" class="label">รหัสบัตรประชาชน</label>
                <div class="control has-icons-left">
                  <input
                    v-model="username"
                    type="text"
                    maxlength="13"
                    placeholder="รหัสบัตรประชาชน 13 หลัก"
                    class="input"
                    @focus="usernameError = false"
                    :class="{
                      'is-danger':
                        (v$.username.$invalid && username != null) ||
                        usernameError,
                    }"
                  />
                  <span class="icon is-small is-left">
                    <font-awesome-icon icon="fa-solid fa-id-card" />
                  </span>
                </div>
                <template v-if="(v$.username.$invalid && username != null) || usernameError">
                  <p class="help is-danger" v-if="!v$.username.required">
                    *กรุณากรอกรหัสบัตรประชาชน
                  </p>
                  <p class="help is-danger" v-if="!v$.username.username">
                    *รหัสบัตรประชาชนไม่ถูกต้อง
                  </p>
                  <p class="help is-danger" v-if="usernameError">
                    *รหัสบัตรประชาชนนี้เคยลงทะเบียนแล้ว
                  </p>
                </template>
              </div>
              <!-- หน่วยงาน -->
              <div class="columns">
                <div class="column field line-justify-evenly">
                  <label for="" class="label">สังกัดหน่วยงาน</label>
                  <label class="radio"
                    ><input
                      type="radio"
                      v-model="agencyType"
                      value="สกก"
                      name="type"
                    />สำนัก/กอง/กลุ่ม</label
                  >
                  <label class="radio"
                    ><input
                      type="radio"
                      v-model="agencyType"
                      value="ธพ"
                      name="type"
                    />สนง.ธนารักษ์พื้นที่</label
                  >
                </div>
              </div>
              <div class="columns">
                <div class="column">
                  <v-select
                    class="agencyDropdown"
                    v-if="agencyType == 'สกก'"
                    placeholder="สังกัดหน่วยงาน(พิมพ์ค้นหาได้)"
                    v-model="agency"
                    :options="allAgency.skk"
                    label="title"
                  />
                  <v-select
                    class="agencyDropdown"
                    v-if="agencyType == 'ธพ'"
                    placeholder="สังกัดหน่วยงาน(พิมพ์ค้นหาได้)"
                    v-model="agency"
                    :class="{ 'is-danger': v$.agency.$invalid }"
                    :options="allAgency.tnp"
                    label="title"
                  />
                  <template v-if="v$.agency.$invalid">
                    <p class="help is-danger" v-if="!v$.agency.required">
                      *กรุณากรอกเลือกหน่วยงาน
                    </p>
                  </template>
                </div>
              </div>
              <!-- ตำแหน่งงาน -->
              <div class="field">
                <label for="" class="label">ตำแหน่งงาน</label>
                <div class="control has-icons-left">
                  <input
                    v-model="job_title"
                    type="text"
                    placeholder="ตำแหน่งงาน"
                    class="input"
                    :class="{
                      'is-danger': (v$.job_title.$invalid && job_title != null)
                    }"
                  />
                  <span class="icon is-small is-left">
                  </span>
                </div>
                <template v-if="(v$.job_title.$invalid && job_title != null)">
                  <p class="help is-danger">
                    *กรุณากรอกตำแหน่งงาน
                  </p>
                </template>
              </div>
              <!-- เบอร์โทรศัพท์ -->
              <div class="field">
                <label for="" class="label">เบอร์โทรศัพท์</label>
                <div class="control has-icons-left">
                  <input
                    v-model="phone"
                    type="text"
                    maxlength="10"
                    placeholder="Ex.08X-XXX-XXXX"
                    class="input pr-0"
                    @focus="phoneError = false"
                    :class="{
                      'is-danger':
                        (v$.phone.$invalid && phone != null) || phoneError,
                    }"
                  />
                  <span class="icon is-small is-left">
                    <font-awesome-icon icon="fa-solid fa-mobile-button" />
                  </span>
                </div>
                <template v-if="(v$.phone.$invalid && phone != null) || phoneError">
                  <p class="help is-danger" v-if="!v$.phone.required">
                    *กรุณากรอกเบอร์โทรศัพท์
                  </p>
                  <p class="help is-danger" v-else-if="!v$.phone.phone">
                    *เบอร์โทรศัพท์ไม่ถูกต้อง
                  </p>
                  <p class="help is-danger" v-else-if="phoneError">
                    *เบอร์โทรศัพท์นี้เคยลงทะเบียนแล้ว
                  </p>
                </template>
              </div>

              <div class="field">
                <button
                  class="button is-success"
                  :disabled="v$.$invalid"
                  @click="submit()"
                >
                  Sign Up
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <!-- MODAL -->
    <div class="modal is-danger" :class="{ 'is-active': modalAlert }">
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">แจ้งเตือน</p>
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
import myJson from "../data/agency2.json";
import { required, helpers } from "@vuelidate/validators";
import { useVuelidate } from '@vuelidate/core'

const phone = (value) => {
  return !helpers.req(value) || !!value.match(/0[6,8,9]{1}[0-9]{8}/);
};
const username = (value) => {
  return !helpers.req(value) || !!value.match(/[0-9]{13}/);
};

export default {
  name: "SignUpPage",
  setup: () => ({ v$: useVuelidate() }),
  data() {
    return {
      first_name: null,
      last_name: null,
      username: null,
      agency: null,
      job_title:null,
      phone: null,
      otp: null,
      agencyType: "สกก",
      allAgency: myJson,
      otpSending: false,
      firstCount: true,
      modalAlert: false,
      mAlertText: "",
      // Error
      intervalid1: null,
      usernameError: false,
      phoneError: false,
    };
  },
  components: {
  },
  methods: {
    submit() {
      if (!this.v$.$invalid) {
        const data = {
          first_name: this.first_name,
          last_name: this.last_name,
          username: this.username,
          agency: this.agency.title,
          job_title: this.job_title,
          phone: this.phone,
        };
        axios
          .post("http://localhost:3000/user/signup", data)
          .then((res) => {
            clearInterval(this.intervalid1);
            alert(res.data.msg);
            this.$router.push({ path: "/signin" });
          })
          .catch((err) => {
            this.mAlertText = err.response.data;
            this.checkError(err.response.data);
            this.modalAlert = true;
          });
      }
    },
    checkError(error) {
      if(error == "ValidationError: รหัสบัตรประชาชนนี้เคยลงทะเบียนแล้ว (username)"){
        this.usernameError = true;
      }
      if (
        error == "ValidationError: หมายเลขโทรศัพท์นี้เคยลงทะเบียนแล้ว (phone)"
      ) {
        this.phoneError = true;
      }
      if (error == "รหัส OTP ไม่ถูกต้อง") {
        this.otpError = true;
      }
    },
  },
  validations: {
    first_name: {
      required: required,
    },
    last_name: {
      required: required,
    },
    username: {
      required: required,
      username: username,
    },
    agency: {
      required: required,
    },
    job_title:{
      required: required,
    },
    phone: {
      required: required,
      phone: phone,
    },
  },
};
</script>

<style>
.vs--searchable .vs__dropdown-toggle {
    height: 45px;
}
.body {
  padding-top: 20px;
  padding-left: 20vw;
  padding-right: 20vw;
}
#sent {
  position: absolute;
  right: 0;
}
.select {
  width: 100%;
}
select {
  width: 100%;
}
select .opTitle {
  font-weight: bold;
}
</style>
