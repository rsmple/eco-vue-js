import {ref} from 'vue'

import type {NotifyPosition} from 'eco-vue-js/dist/components/Notify/types'

/** Position of the site's `WNotify`. The notify position playground changes it and puts it back when it unmounts. */
export const notifyPosition = ref<NotifyPosition>('bottom-right')
