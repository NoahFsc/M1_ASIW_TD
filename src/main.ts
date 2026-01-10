import './assets/main.css';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import vSelect from 'vue-select';

const app = createApp(App).component('v-select', vSelect);

app.use(router);

app.mount('#app');
