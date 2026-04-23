// See https://svelte.dev/docs/kit/types#app.d.ts

import type { ErrorDTO } from '@ems/domain-shared-schema'
import type { HttpClient } from '@ems/http'

// for information about these interfaces
declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            http: HttpClient<ErrorDTO>
        }
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
    }
}

export {}
