import './app.css';

import { Application } from '@nativescript/core';
import { createApp, registerElement } from 'nativescript-vue';

import App from './App.vue';
import { i18n } from '../configs/i18n';
import { EventsComposable } from '../composables/event-composable';
import { getAuth } from '../persistence/auth-session';

registerElement('DrawingPad', () => require('@nativescript-community/drawingpad').DrawingPad);

Application.on(Application.launchEvent, () => {
    if (getAuth()) {
        void EventsComposable.refresh();
    }
});

createApp(App).use(i18n).start();
