import './assets/main.css';

import { createApp } from 'vue';
import App from './App.vue';

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import "bootstrap";

import VXETable from 'vxe-table';
import 'vxe-table/lib/style.css';

createApp(App).use(VXETable).mount('#app');

