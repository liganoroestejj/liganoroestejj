import { TextEncoder, TextDecoder } from "util"

// jsdom não expõe TextEncoder/TextDecoder, exigidos pelo react-router v7.
Object.assign(global, { TextEncoder, TextDecoder })

import "@testing-library/jest-dom"
