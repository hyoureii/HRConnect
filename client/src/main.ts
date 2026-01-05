import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import Modals from './components/dialogModals.vue';

const app = createApp(App);
const pinia = createPinia();

const modals = document.createElement('div');
document.body.appendChild(modals);
createApp(Modals).mount(modals);
app.use(router);

app.use(pinia);
app.mount('#app');
