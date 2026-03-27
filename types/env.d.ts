declare namespace NodeJS {
    interface ProcessEnv {
        /** Injected at build time from `.env.*` via webpack DefinePlugin. */
        NS_CURRENT_ENV?: string;
        /** Scancode API base URL for the current environment (e.g. `http://192.168.1.100:80`). */
        SCANCODE_API_URL?: string;
    }
}
