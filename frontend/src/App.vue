<template>
  <div class="wrapper">
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
            :class="activeSidebarClass('ChatView')"
            disabled
            @click="$router.push('/chat')"
            >หน้าสนทนา</a
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
  name:"AppData",
  data() {
    return {
      token: localStorage.getItem("ts-token"),
      user: null,
      sideBarActive: false,
      darkMode: false,
      dropDownAlert: false,
      arrAlert: [],
    };
  },
  mounted() {
    this.onAuthChange();
  },
  methods: {
    onAuthChange() {
      const token = this.token;
      if (token) {
        this.getUser();
      }
    },
    getUser() {
      axios
        .get("/user")
        .then((res) => {
          this.user = res.data;
          localStorage.setItem("ts-user", JSON.stringify(res.data));
          axios.get("https://api.chatengine.io/users/me/", {
            headers: {
              "Project-ID": "634202dd-06f3-4865-b702-ca0c6afe6519",
              "User-Name": this.user.user_id,
              "User-Secret": localStorage.getItem("ts-token"),
            }
          })
          .then((response) => {
            const userData = { ...response.data, secret: localStorage.getItem("ts-token") };
            localStorage.setItem("user", JSON.stringify(userData));
            this.$emit("onAuth", userData);
          })
        })
        .catch((err) => {
          console.log(err.response.data);
        });
    },
    logOut() {
      this.$router.push({ path: "/signin" });
      localStorage.removeItem("ts-token");
      localStorage.removeItem("ts-user");
      this.user = null;
    },
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
