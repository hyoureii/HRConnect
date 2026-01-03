import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Modals from './components/modals.vue'

const app = createApp(App)

const modals = document.createElement('div')
document.body.appendChild(modals)
createApp(Modals).mount(modals)
app.use(router)

app.mount('#app')
