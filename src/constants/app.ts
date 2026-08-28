declare const __APP_VERSION__: string | undefined
declare const __APP_NAME__: string | undefined

export const APP_VERSION: string = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.2.3'
export const APP_NAME: string = typeof __APP_NAME__ !== 'undefined' ? __APP_NAME__ : 'Cekcok IDE'
export const APP_TITLE = 'Cekcok IDE'
