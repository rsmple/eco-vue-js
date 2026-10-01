import {defineAsyncComponent, markRaw} from 'vue'

import {Modal} from 'eco-vue-js/dist/utils/Modal'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import {deleteAllThemes, findPreset, getUniqueThemeName, hasCustomTokens, saveThemeAs, savedThemes, themeConfig} from './docsTheme'

const ThemeNameModal = defineAsyncComponent(() => import('./components/ThemeNameModal.vue'))

export const openSaveTheme = () => {
  Modal.add(markRaw(ThemeNameModal), {
    title: 'Save theme',
    name: getUniqueThemeName(hasCustomTokens.value ? 'My theme' : findPreset(themeConfig.value.preset ?? 'default')?.name ?? 'My theme'),
    onSave: saveThemeAs,
  })
}

export const confirmDeleteAllThemes = () => {
  Modal.addConfirm({
    title: `Delete all ${ savedThemes.value.length } saved themes?`,
    description: 'The site keeps showing the theme in use until you pick another one, but none of them stay saved.',
    acceptText: 'Delete all',
    acceptSemanticType: SemanticType.NEGATIVE,
    onAccept: deleteAllThemes,
  })
}
