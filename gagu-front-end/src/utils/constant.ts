const { protocol, host } = window.location
export const BASE_URL = process.env.REACT_APP_BASE_URL || `${protocol}//${host}`
export const DOCUMENT_TITLE = 'gagu'
export const INVALID_NAME_CHAR_LIST = ['/', '|', '\\', '?', ':', '"', '<', '>', '*']
export const GAGU_AUTH_CODE_KEY = 'GAGU_AUTH_CODE_KEY'
