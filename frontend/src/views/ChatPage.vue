<template>
  <div>
    <div style="height: 100vh">
      <PrettyChatWindow
        v-if="isLoggedIn"
        :projectId="projectId"
        :username="username"
        :secret="secret"
      />
      <div v-else>
        <h1>Please log in to access this page</h1>
        <router-link to="/">Log in</router-link>
      </div>
    </div>
  </div>
</template>
<style>
.ce-new-chat-button {
  width: 32px;
  position: relative;
  bottom: 22px;
}
</style>
<script>
import { PrettyChatWindow } from "react-chat-engine-pretty";
import { applyReactInVue } from "veaury";

export default {
  name: "ChatPage",
  data() {
    return {
      projectId: "634202dd-06f3-4865-b702-ca0c6afe6519",
    };
  },

  components: {
    PrettyChatWindow: applyReactInVue(PrettyChatWindow),
  },
  computed: {
    isLoggedIn() {
      const userData = JSON.parse(localStorage.getItem("user"));
      return userData !== null;
    },
    username() {
      const userData = JSON.parse(localStorage.getItem("user"));
      return userData ? userData.username : "";
    },
    secret() {
      const userData = JSON.parse(localStorage.getItem("user"));
      return userData ? userData.secret : "";
    },
  },
};
</script>