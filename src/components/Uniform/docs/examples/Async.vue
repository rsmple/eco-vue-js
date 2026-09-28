<template>
  <WUniform
    :init-data="initData"
    :api-method="save"
    tag="div"
    class="grid max-w-md"
    async
  >
    <template #default="scope">
      <WUniform
        v-bind="scope"
        field="notifications"
        title="Email notifications"
        :confim-getter="confirmDisable"
      >
        <template #field="scopeField">
          <WToggle
            v-bind="scopeField"
            class="mb-4"
          />
        </template>
      </WUniform>

      <WUniform
        v-bind="scope"
        field="theme"
        title="Theme"
      >
        <template #field="scopeField">
          <WButtonGroup
            v-bind="scopeField"
            :list="['light', 'dark', 'system']"
          >
            <template #option="{option}">
              {{ option }}
            </template>
          </WButtonGroup>
        </template>
      </WUniform>
    </template>
  </WUniform>
</template>

<script lang="ts" setup>
import WButtonGroup from 'eco-vue-js/dist/components/Button/WButtonGroup.vue'
import WToggle from 'eco-vue-js/dist/components/Toggle/WToggle.vue'
import WUniform from 'eco-vue-js/dist/components/Uniform/WUniform.vue'

type Settings = {notifications: boolean, theme: string}

let stored: Settings = {notifications: true, theme: 'system'}

const initData = (): Settings => ({...stored})

// Stands in for an API call.
const save = (payload: Partial<Settings>) => new Promise<Settings>(resolve => {
  setTimeout(() => {
    stored = {...stored, ...payload}
    resolve(stored)
  }, 800)
})

const confirmDisable = (value: boolean): ConfirmProps | undefined => value ? undefined : {
  title: 'Turn off notifications?',
  description: 'You will stop getting emails about new comments.',
  acceptText: 'Turn off',
}
</script>
