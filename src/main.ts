import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

// PrimeVue
import PrimeVue from 'primevue/config'
import Tooltip from 'primevue/tooltip'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'
import Aura from '@primeuix/themes/aura'
import { definePreset } from '@primeuix/themes'

import 'primeicons/primeicons.css'
// PrimeVue Components
import Select from 'primevue/select'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Menu from 'primevue/menu'
import FileUpload from 'primevue/fileupload'
import Message from 'primevue/message'
import Toast from 'primevue/toast'

// Custom purple theme preset
const PurplePreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{violet.50}',
            100: '{violet.100}',
            200: '{violet.200}',
            300: '{violet.300}',
            400: '{violet.400}',
            500: '{violet.500}',
            600: '{violet.600}',
            700: '{violet.700}',
            800: '{violet.800}',
            900: '{violet.900}',
            950: '{violet.950}',
        },
    },
})

const app = createApp(App)

app.use(ConfirmationService)
app.use(ToastService)

// Configure PrimeVue
app.use(PrimeVue, {
    theme: {
        preset: PurplePreset,
    },
})

// Register global components
app.component('Select', Select)
app.component('Button', Button)
app.component('Dialog', Dialog)
app.component('InputText', InputText)
app.component('Menu', Menu)
app.component('FileUpload', FileUpload)
app.component('Message', Message)
app.component('Toast', Toast)

// Register directives
app.directive('tooltip', Tooltip)

app.mount('#app')
