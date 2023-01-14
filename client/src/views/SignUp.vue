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
                    v-model="$v.first_name.$model"
                    type="text"
                    placeholder="ชื่อจริง"
                    class="input"
                    :class="{
                      'is-danger': $v.first_name.$invalid && first_name != null,
                    }"
                  />
                  <span class="icon is-small is-left">
                    <font-awesome-icon icon="fa-solid fa-user" />
                  </span>
                </div>
                <template v-if="$v.first_name.$invalid && first_name != null">
                  <p class="help is-danger">*กรุณากรอกชื่อจริง</p>
                </template>
              </div>
              <!-- นามสกุล -->
              <div class="field">
                <label class="label">นามสกุล</label>
                <div class="control has-icons-left">
                  <input
                    v-model="$v.last_name.$model"
                    type="text"
                    placeholder="นามสกุล"
                    class="input"
                    :class="{
                      'is-danger': $v.last_name.$invalid && last_name != null,
                    }"
                  />
                  <span class="icon is-small is-left">
                    <font-awesome-icon icon="fa-solid fa-user" />
                  </span>
                </div>
                <template v-if="$v.last_name.$invalid && last_name != null">
                  <p class="help is-danger">*กรุณากรอกนามสกุล</p>
                </template>
              </div>
              <!-- รหัสบัตรประชาชน -->
              <div class="field">
                <label for="" class="label">รหัสบัตรประชาชน</label>
                <div class="control has-icons-left">
                  <input
                    v-model="$v.id_card.$model"
                    type="text"
                    maxlength="13"
                    placeholder="รหัสบัตรประชาชน 13 หลัก"
                    class="input"
                    @focus="id_cardError = false"
                    :class="{
                      'is-danger':
                        ($v.id_card.$invalid && id_card != null) ||
                        id_cardError,
                    }"
                  />
                  <span class="icon is-small is-left">
                    <font-awesome-icon icon="fa-solid fa-id-card" />
                  </span>
                </div>
                <template v-if="($v.id_card.$invalid && id_card != null) || id_cardError">
                  <p class="help is-danger" v-if="!$v.id_card.required">
                    *กรุณากรอกรหัสบัตรประชาชน
                  </p>
                  <p class="help is-danger" v-if="!$v.id_card.id_card">
                    *รหัสบัตรประชาชนไม่ถูกต้อง
                  </p>
                  <p class="help is-danger" v-if="id_cardError">
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
                    v-model="$v.agency.$model"
                    :options="allAgency.skk"
                    label="title"
                  >
                  </v-select>
                  <v-select
                    class="agencyDropdown"
                    v-if="agencyType == 'ธพ'"
                    placeholder="สังกัดหน่วยงาน(พิมพ์ค้นหาได้)"
                    v-model="$v.agency.$model"
                    :class="{ 'is-danger': $v.agency.$invalid }"
                    :options="allAgency.tnp"
                    label="title"
                  >
                  </v-select>
                  <template v-if="$v.agency.$invalid">
                    <p class="help is-danger" v-if="!$v.agency.required">
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
                    v-model="$v.job_title.$model"
                    type="text"
                    placeholder="ตำแหน่งงาน"
                    class="input"
                    :class="{
                      'is-danger': ($v.job_title.$invalid && job_title != null)
                    }"
                  />
                  <span class="icon is-small is-left">
                  </span>
                </div>
                <template v-if="($v.job_title.$invalid && job_title != null)">
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
                    v-model="$v.mobile.$model"
                    type="text"
                    maxlength="10"
                    placeholder="Ex.08X-XXX-XXXX"
                    class="input pr-0"
                    @focus="mobileError = false"
                    :class="{
                      'is-danger':
                        ($v.mobile.$invalid && mobile != null) || mobileError,
                    }"
                  />
                  <span class="icon is-small is-left">
                    <font-awesome-icon icon="fa-solid fa-mobile-button" />
                  </span>
                  <button
                    id="sent"
                    class="button is-right is-info"
                    @click="sentOtp()"
                    :disabled="otpSending || $v.mobile.$invalid"
                  >
                    <span id="countdowntimer" v-show="otpSending"></span>
                    <span v-if="!otpSending && firstCount"
                      ><font-awesome-icon icon="fa-solid fa-arrow-right"
                    /></span>
                    <span v-show="!otpSending && !firstCount"
                      ><font-awesome-icon icon="fa-solid fa-arrow-rotate-right"
                    /></span>
                  </button>
                </div>
                <template v-if="($v.mobile.$invalid && mobile != null) || mobileError">
                  <p class="help is-danger" v-if="!$v.mobile.required">
                    *กรุณากรอกเบอร์โทรศัพท์
                  </p>
                  <p class="help is-danger" v-else-if="!$v.mobile.mobile">
                    *เบอร์โทรศัพท์ไม่ถูกต้อง
                  </p>
                  <p class="help is-danger" v-else-if="mobileError">
                    *เบอร์โทรศัพท์นี้เคยลงทะเบียนแล้ว
                  </p>
                </template>
              </div>
              <!-- OTP -->
              <div class="field">
                <label for="" class="label">รหัส OTP</label>
                <div class="control has-icons-left">
                  <input
                    v-model="$v.otp.$model"
                    type="text"
                    maxlength="6"
                    placeholder="ตัวอย่าง: 123456"
                    class="input"
                    @focus="otpError = false"
                    :class="{
                      'is-danger': ($v.otp.$invalid && otp != null) || otpError
                    }"
                  />
                  <span class="icon is-small is-left">
                    <font-awesome-icon icon="fa-solid fa-paper-plane" />
                  </span>
                </div>
                <template v-if="($v.otp.$invalid && otp != null) || otpError">
                  <p class="help is-danger" v-if="!$v.otp.required">
                    *กรุณากรอกรหัส OTP
                  </p>
                  <p class="help is-danger" v-else-if="!$v.otp.otp || otpError">
                    *รหัส OTP ไม่ถูกต้อง
                  </p>
                </template>
              </div>

              <div class="field">
                <button
                  class="button is-success"
                  :disabled="$v.$invalid"
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
import { required, helpers } from "vuelidate/lib/validators";

const mobile = (value) => {
  return !helpers.req(value) || !!value.match(/0[6,8,9]{1}[0-9]{8}/);
};
const id_card = (value) => {
  return !helpers.req(value) || !!value.match(/[0-9]{13}/);
};
const otp = (value) => {
  return !helpers.req(value) || !!value.match(/[0-9]{6}/);
};

export default {
  data() {
    return {
      first_name: null,
      last_name: null,
      id_card: null,
      agency: null,
      job_title:null,
      mobile: null,
      otp: null,
      agencyType: "สกก",
      allAgency: myJson,
      otpSending: false,
      firstCount: true,
      modalAlert: false,
      mAlertText: "",
      // Error
      intervalid1: null,
      id_cardError: false,
      mobileError: false,
      otpError: false,
    };
  },
  methods: {
    cooldownTimer() {
      var timeleft = 60;
      this.intervalid1 = setInterval(() => {
        if (timeleft <= 0) {
          document.getElementById("countdowntimer").textContent =
            timeleft + "s";
          clearInterval(this.intervalid1);
          this.firstCount = false;
          this.otpSending = false;
        } else {
          document.getElementById("countdowntimer").textContent =
            timeleft + "s";
        }
        timeleft -= 1;
      }, 1000);
    },
    sentOtp() {
      if (!this.$v.mobile.$invalid) {
        this.$parent.$data.isLoading = true;
        document.getElementById("countdowntimer").textContent = 60 + "s";
        this.cooldownTimer();
        this.otpSending = true;
        const data = {
          mobile: this.mobile,
        };
        axios
          .post("http://localhost:3000/sentotp", data)
          .then((res) => {
            this.mAlertText = res.data.msg;
            this.$parent.$data.isLoading = false;
            this.modalAlert = true;
          })
          .catch((err) => {
            this.mAlertText = err.response.data;
            this.checkError(err.response.data);
            this.$parent.$data.isLoading = false;
            this.modalAlert = true;
            clearInterval(this.intervalid1);
            this.firstCount = false;
            this.otpSending = false;
          });
      }
    },
    submit() {
      if (!this.$v.$invalid) {
        this.$parent.$data.isLoading = true;
        const data = {
          first_name: this.first_name,
          last_name: this.last_name,
          id_card: this.id_card,
          agency: this.agency.title,
          job_title: this.job_title,
          agencyType: this.agencyType,
          mobile: this.mobile,
          otp: this.otp,
        };
        axios
          .post("http://localhost:3000/signup", data)
          .then((res) => {
            this.$parent.$data.isLoading = false;
            clearInterval(this.intervalid1);
            alert(res.data.msg);
            this.$router.push({ path: "/signin" });
          })
          .catch((err) => {
            this.mAlertText = err.response.data;
            this.checkError(err.response.data);
            this.$parent.$data.isLoading = false;
            this.modalAlert = true;
          });
      }
    },
    checkError(error) {
      if(error == "ValidationError: รหัสบัตรประชาชนนี้เคยลงทะเบียนแล้ว (id_card)"){
        this.id_cardError = true;
      }
      if (
        error == "ValidationError: หมายเลขโทรศัพท์นี้เคยลงทะเบียนแล้ว (mobile)"
      ) {
        this.mobileError = true;
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
    id_card: {
      required: required,
      id_card: id_card,
    },
    agency: {
      required: required,
    },
    job_title:{
      required: required,
    },
    mobile: {
      required: required,
      mobile: mobile,
    },
    otp: {
      required: required,
      otp: otp,
    },
  },
};
</script>

<style>
@import "vue-select/dist/vue-select.css";
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
