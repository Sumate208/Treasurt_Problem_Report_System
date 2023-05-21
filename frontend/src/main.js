import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { useVuelidate } from '@vuelidate/core'
import { useDropzone } from 'vue3-dropzone';

import 'vue-select/dist/vue-select.css';
import vSelect from 'vue-select';

import 'bulma/css/bulma.css';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';


library.add(fas, far, fab);
const app = createApp(App);

app.use(router);
app.use(useVuelidate);
app.component('font-awesome-icon', FontAwesomeIcon);
app.component('vueDropzone', useDropzone);
app.component('v-select', vSelect);
app.mount('#app');