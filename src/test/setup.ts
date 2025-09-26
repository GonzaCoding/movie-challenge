import '@testing-library/jest-dom';
// @ts-ignore
import { TextDecoder, TextEncoder } from 'util';

if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder;
}

if (typeof globalThis.TextDecoder === 'undefined') {
  globalThis.TextDecoder = TextDecoder as unknown as typeof globalThis.TextDecoder;
}
