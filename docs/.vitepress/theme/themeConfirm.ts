import {Modal} from 'eco-vue-js/dist/utils/Modal'
import {SemanticType} from 'eco-vue-js/dist/utils/SemanticType'

import {deleteAllThemes, savedThemes} from './docsTheme'

export const confirmDeleteAllThemes = () => {
  Modal.addConfirm({
    title: `Delete all ${ savedThemes.value.length } saved themes?`,
    description: 'The site keeps showing the theme in use until you pick another one, but none of them stay saved.',
    acceptText: 'Delete all',
    acceptSemanticType: SemanticType.NEGATIVE,
    onAccept: deleteAllThemes,
  })
}
