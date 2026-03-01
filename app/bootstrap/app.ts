import './app.css';

import { createApp, registerElement } from 'nativescript-vue';

import App from './App.vue';
import { i18n } from '../configs/i18n';

registerElement('DrawingPad', () => require('@nativescript-community/drawingpad').DrawingPad);

createApp(App).use(i18n).start();
