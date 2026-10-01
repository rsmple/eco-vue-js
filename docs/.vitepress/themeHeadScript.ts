export const THEME_STORAGE_KEY = 'eco-vue-docs-theme'
export const THEME_STYLE_ID = 'docs-theme'

/**
 * Inlined in the page head: applies the stored theme before the first paint, so a customized site doesn't flash the
 * default one while the app loads.
 */
export const THEME_HEAD_SCRIPT = `try{var t=JSON.parse(localStorage.getItem('${ THEME_STORAGE_KEY }')||'null');if(t&&t.css){var s=document.createElement('style');s.id='${ THEME_STYLE_ID }';s.textContent=t.css;document.head.appendChild(s)}}catch(e){}`
