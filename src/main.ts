import type {App} from 'vue'

import WButton from '@/components/Button/WButton.vue'
import WButtonAction from '@/components/Button/WButtonAction.vue'

import WCounter from '@/components/Counter/WCounter.vue'

import WFieldWrapper from '@/components/FieldWrapper/WFieldWrapper.vue'

import WInput from '@/components/Input/WInput.vue'
import WInputAsync from '@/components/Input/WInputAsync.vue'

import WSkeleton from '@/components/Skeleton/WSkeleton.vue'

import WSpinner from '@/components/Spinner/WSpinner.vue'

export default {
  install: (app: App | any) => {
    app.component('WButton', WButton)
    app.component('WButtonAction', WButtonAction)

    app.component('WCounter', WCounter)

    app.component('WFieldWrapper', WFieldWrapper)

    app.component('WInput', WInput)
    app.component('WInputAsync', WInputAsync)

    app.component('WSkeleton', WSkeleton)

    app.component('WSpinner', WSpinner)
  }
}

export {
  WButton,
  WFieldWrapper,
  WInput,
  WInputAsync,
  WSkeleton,
  WSpinner,
}
