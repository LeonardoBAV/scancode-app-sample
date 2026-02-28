import { createApp, registerElement } from 'nativescript-vue'

import App from './App.vue'

registerElement('DrawingPad', () => require('@nativescript-community/drawingpad').DrawingPad)

createApp(App).start()
