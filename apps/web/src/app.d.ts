// See https://svelte.dev/docs/kit/types#app.d.ts

import type { HttpClient } from '@ems/types-shared-api'

// for information about these interfaces
declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            http: HttpClient
        }
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
    }
}

export {}
