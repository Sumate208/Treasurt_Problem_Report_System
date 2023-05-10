import Vue from 'vue'
import App from './App.vue'
import router from './router'
import 'bulma/css/bulma.css'
import Vuelidate from 'vuelidate'
import vSelect from "vue-select";
import VueDatepickerUi from 'vue-datepicker-ui'
import 'vue-datepicker-ui/lib/vuedatepickerui.css';
import VueLoading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';


library.add(fas,far,fab)

Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.component('DatePicker', VueDatepickerUi)
Vue.component("v-select", vSelect);
Vue.component("loading-overlay", VueLoading);
Vue.use(Vuelidate)


Vue.config.productionTip = false
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
