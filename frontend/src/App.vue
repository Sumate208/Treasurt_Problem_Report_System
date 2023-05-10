<template>
  <div class="wrapper">
  <loading-overlay :active="isLoading" :is-full-page="true" :loader="'spinner'" />
    <!-- Sidebar  -->
    <nav
      v-if="user"
      id="sidebar"
      :class="[
        { active: sideBarActive },
        darkMode ? 'has-background-grey-dark' : 'has-background-link-light',
      ]"
    >
      <div
        class="sidebar-header"
        :class="[ darkMode ? 'has-background-grey-darker' : 'has-background-link']"
      >
        <p v-if="user" class="is-size-5">
          ระบบแจ้งปัญหา
        </p>
      </div>
      <ul v-if="user" class="list-unstyled components">
        <li>
          <a
            class="sidebar-link"
            :class="activeSidebarClass('HomePage')"
            disabled
            @click="$router.push('/')"
            >หน้าหลัก</a
          >
        </li>
        <li v-if="user.user_type == 'member'">
          <a
            class="sidebar-link"
            :class="activeSidebarClass('SentProblem')"
            @click="$router.push('/sent-problem')"
            >แจ้งปัญหา</a
          >
        </li>
        <li>
          <a
            class="sidebar-link"
            :class="activeSidebarClass('ProblemHistory')"
            disabled
            @click="$router.push('/history')"
            >ค้นหากระแจ้งปัญหา</a
          >
        </li>
        <li>
          <a
            class="sidebar-link"
            :class="activeSidebarClass('ProfilePage')"
            @click="$router.push('/profile')"
            >เปลี่ยนรหัสผ่าน</a
          >
        </li>
      </ul>

      <hr v-if="user" style="border-bottom: 1px solid #47748b; width: 100%" />

      <ul class="list-unstyled CTAs">
        <li v-if="!user">
          <a class="button is-light" @click="$router.push('/signin')">
            เข้าสู่ระบบ
          </a>
        </li>
        <li v-if="!user">
          <a class="button is-info" @click="$router.push('/signup')">
            <strong>สมัครสมาชิก</strong>
          </a>
        </li>
        <li v-if="user">
          <p class="has-text-centered" :class="{'has-text-black' : !darkMode}">
            {{ user.first_name }} {{ user.last_name }}
          </p>
        </li>
        <li>
          <a
            v-if="user"
            :class="[darkMode ? 'button is-light' : 'button is-link']"
            @click="logOut()"
            >ออกจากระบบ</a
          >
        </li>
      </ul>
    </nav>

    <!-- Page Content  -->
    <div id="content" :class="{ 'has-background-grey': darkMode }">
      <nav
        class="navbar is-desktop"
        :class="[darkMode ? 'is-dark' : 'has-background-link']"
        role="navigation"
        aria-label="main navigation"
      >
        <div class="navbar-start">
          <a
            v-if="user"
            class="navbar-item has-text-white"
            @click="sideBarActive = !sideBarActive"
          >
            <font-awesome-icon icon="fa-solid fa-sliders" size="2x" />
          </a>
          <button
            v-if="!user"
            class="button   mx-2"
            :class="[ darkMode ? 'is-success is-light' : 'is-dark' ]"
            @click="$router.push('/signin')"
          >
            เข้าสู่ระบบ
          </button>
          <button
            v-if="!user"
            class="button   mx-2"
            :class="[ darkMode ? 'is-info is-light' : 'is-dark' ]"
            @click="$router.push('/signup')"
          >
            สมัครสมาชิก
          </button>
        </div>

        <div class="navbar-end">
          <div class="dropdown is-right is-hoverable navbar-item" :class="{'is-active':dropDownAlert}">
            <!-- <div class="dropdown-trigger">
              <a @click="dropDownAlert = !dropDownAlert" ria-haspopup="true" aria-controls="dropdown-menu">
                <font-awesome-icon 
                class="has-text-white"
                icon="fa-solid fa-bell" 
                size="2x"
                />
              </a>
            </div> -->
            <div class="dropdown-menu" id="dropdown-alert" role="menu">
              <div class="dropdown-content mr-4">
                <span style="align-self: center;">ต้องดำเนินการ</span>
                <a v-for="(alert, index) in arrAlert" 
                  :key="index" class="dropdown-item"
                  @click="$router.push(`/report/${alert.problem_id}`)"
                >
                <span>{{ (index+1)+".ระบบ: "+alert.systen_name }}</span>
                <span>{{ "เวลา: "+alert.write_date }}</span>
                </a>
              </div>
            </div>
          </div>
          <a class="navbar-item" @click="darkMode = !darkMode">
            <font-awesome-icon
              v-show="darkMode"
              class="has-text-white"
              icon="fa-solid fa-sun"
              size="2x"
            />
            <font-awesome-icon
              v-show="!darkMode"
              class="has-text-white"
              icon="fa-solid fa-moon"
              size="2x"
            />
          </a>
        </div>
      </nav>
      <router-view :key="$route.fullPath" @auth-change="onAuthChange" />
    </div>
  </div>
</template>
<script>
import axios from "@/plugins/axios";
export default {
  data() {
    return {
      user: null,
      sideBarActive: false,
      darkMode: false,
      isLoading: false,
      dropDownAlert: false,
      arrAlert: [],
    };
  },
  mounted() {
    this.onAuthChange();
  },
  methods: {
    onAuthChange() {
      const token = localStorage.getItem("ts-token");
      if (token) {
        this.getUser();
      }
    },
    getUser() {
      this.isLoading = true;
      axios
        .get("/user")
        .then((res) => {
          this.user = res.data;
          this.isLoading = false
        })
        .catch((err) => {
          console.log(err.response.data);
        });
    },
    logOut() {
      this.$router.push({ path: "/signin" });
      localStorage.removeItem("ts-token");
      this.user = null;
    },
    // getAlert() {
    //   axios
    //     .get("/alert")
    //     .then((res) => {
    //       this.arrAlert = res.data;
    //       this.$parent.$data.isLoading = false;
    //     })
    //     .catch((e) => {
    //       console.log(e.response.data);
    //       this.$parent.$data.isLoading = false;
    //     });
    // },
    sidebarClass(path){
      if(this.$router.$Root.name == path){
        return true
      }else{
        return false
      }
    },
    activeSidebarClass(linkName){
      if(this.$route.name == linkName){
        if(this.darkMode){return "has-text-white sidebar-active-dark"}
        else{return "sidebar-active"}
      }
      else{
        if(this.darkMode){return "has-text-white"}
        else{return ""}
      }
    }
  },
};
</script>

<style>
@import '@/css/side-bar.css';
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  overflow-y: hidden;
  color: #2c3e50;
  background: #eee;
}
body {
  font-family: "Poppins", sans-serif;
  background: #fafafa;

}
body::-webkit-scrollbar{
  display: none;
}
.sidebar-active {
  color: white;
  background:#485fc7;
  pointer-events: none;
  transition: all 0.3s;
}
.sidebar-active-dark {
  color: white;
  background:#363636;
  pointer-events: none;
  transition: all 0.3s;
}
/* ---------------------------------------------------
    NAVBAR
----------------------------------------------------- */

#content .navbar {
  padding-right: 30px;
  display: flex;
  box-shadow: 2px 0px 5px 0px #000000;
  z-index: 8;
  position:sticky;
  top: 0;
  width: 100%;
}
.navbar-start button {
  margin-top: auto;
  margin-bottom: auto;
}
</style>
