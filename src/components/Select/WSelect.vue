<template>
  <component
    :is="isMobile ? WBottomSheet : WDropdownMenu"
    ref="dropdownMenu"
    v-bind="isMobile ? {isOpen, onClose: close} : {isOpen, maxHeight: 320, maxWidth: 480, horizontalAlign: HorizontalAlign.FILL, updateAlign: true}"
  >
    <template #toggle="{unclickable}">
      <WInput
        ref="input"
        :title="title"
        :description="description"
        :model-value="search"
        :max-length="maxSearchLength"
        :loading="loading"
        :hide-input="isMobile ? !focused : !isOpen"
        :readonly="(readonly || unclickable)"
        :skeleton="skeleton"
        :size="searchSize"
        :error-message="errorMessage"
        :required="required"
        stop-mouse-down
        class="cursor-pointer"
        @update:model-value="!loading && $emit('update:search', $event as string ?? '')"
        @keypress:enter.stop.prevent="selectCursor"
        @keypress:up.prevent="cursorUp"
        @keypress:down.prevent="cursorDown"
        @keypress:delete="captureDoubleDelete"
        @focus="open(); focused = true"
        @blur="!isMobile && close(); focused = false"
        @click:internal="isMobile && unclickable && open()"
      >
        <template
          v-if="hidePrefix ? isMobile ? !focused : !isOpen : true"
          #prefix
        >
          <div
            v-for="option in modelValue"
            :key="option"
            class="relative flex cursor-pointer overflow-hidden items-center"
          >
            <slot
              name="option"
              :option="option"
              :selected="true"
              :model="true"
            >
              <template v-if="optionComponent">
                <component
                  :is="optionComponent"
                  :model-value="option"
                  :is-selected="true"
                >
                  <div
                    v-if="!disableClear"
                    class="w-ripple relative flex square-5 rounded-full -my-1 -mr-2 ml-1 items-center justify-center hover:bg-opacity-5 hover:bg-black-default"
                    :class="{'cursor-progress': loading}"
                    @mousedown.stop.prevent=""
                    @click.stop.prevent="!loading && unselect(option)"
                  >
                    <IconCancel class="square-3 text-description" />
                  </div>
                </component>
              </template>
            </slot>

            <div
              v-if="!optionComponent && !disableClear"
              class="w-ripple relative flex square-5 rounded-full items-center justify-center hover:bg-opacity-5 hover:bg-black-default"
              :class="{'cursor-progress': loading}"
              @mousedown.stop.prevent=""
              @click.stop.prevent="!loading && unselect(option)"
            >
              <IconCancel class="square-3 text-description" />
            </div>
          </div>
        </template>

        <template #suffix>
          <IconArrow
            class="square-3 text-gray-400 dark:text-gray-600 transition-transform"
            :class="{'rotate-180': isOpen}"
          />
        </template>

        <template #right>
          <slot name="right" />
        </template>
      </WInput>
    </template>

    <template #content>
      <div
        class="bg-default dark:bg-default-dark"
        :class="{
          'max-h-full': isMobile,
          'rounded-xl shadow-md max-h-72 overflow-x-hidden overflow-y-overlay overscroll-contain mt-4 mb-1 dark:border dark:border-solid dark:border-gray-800': !isMobile,
        }"
      >
        <div
          v-if="!options.length && search"
          class="p-4 select-none cursor-default"
        >
          {{ emptyStub ?? 'No match' }}
        </div>

        <SelectOption
          v-for="(option, index) in options"
          :key="option"
          :is-selected="modelValue.includes(option)"
          :is-cursor="index === cursor"
          class="relative"
          :class="{
            'cursor-progress': loading,
            'w-ripple': !loading,
          }"
          @select="select(option)"
          @unselect="unselect(option)"
        >
          <template #default="{selected}">
            <slot
              name="option"
              :option="option"
              :selected="selected"
              :model="false"
            >
              <component
                :is="optionComponent"
                :model-value="option"
                :is-selected="selected"
              />
            </slot>
          </template>
        </SelectOption>

        <SelectOption
          v-if="hasCreateButton"
          :class="{'cursor-progress': loading}"
          :is-cursor="options.length === cursor"
          @select="createOption(search)"
        >
          <span class="pr-2">
            Create:
          </span>

          <slot
            name="option"
            :option="search"
            :selected="false"
            :model="false"
          >
            <component
              :is="optionComponent"
              :model-value="search"
              :is-selected="false"
            />
          </slot>
        </SelectOption>
      </div>
    </template>
  </component>
</template>

<script lang="ts" setup>
import {ref, watch, toRef, nextTick, computed} from 'vue'
import WDropdownMenu from '@/components/DropdownMenu/WDropdownMenu.vue'
import WBottomSheet from '@/components/BottomSheet/WBottomSheet.vue'
import SelectOption from './components/SelectOption.vue'
import {HorizontalAlign} from '@/utils/HorizontalAlign'
import WInput from '@/components/Input/WInput.vue'
import IconCancel from '@/assets/icons/default/IconCancel.svg?component'
import IconArrow from '@/assets/icons/default/IconArrow.svg?component'
import {getIsMobile} from '@/utils/mobile'

const props = defineProps<{
  modelValue: string[]
  search: string
  options: string[]
  title?: string
  description?: string
  loading?: boolean
  emptyStub?: string
  maxSearchLength?: number
  optionComponent?: VueComponent
  disableClear?: boolean
  hidePrefix?: boolean
  readonly?: boolean
  skeleton?: boolean
  searchSize?: number
  allowCreate?: boolean
  errorMessage?: string
  required?: boolean
}>()

const emit = defineEmits<{
  (e: 'select', item: string): void
  (e: 'unselect', item: string): void
  (e: 'update:search', value: string): void
  (e: 'create:option', value: string): void
}>()

const isOpen = ref(false)
const dropdownMenu = ref<InstanceType<typeof WDropdownMenu> | undefined>()
const input = ref<InstanceType<typeof WInput> | undefined>()
const cursor = ref<number>(-1)
const hasCreateButton = computed(() => props.allowCreate && props.search.length && !props.options.includes(props.search))
const lastIndex = computed(() => hasCreateButton.value ? props.options.length : props.options.length - 1)
const isMobile = getIsMobile()
const focused = ref(false)

const cursorUp = () => {
  if (!props.options.length) {
    cursor.value = -1
    return
  }

  if (cursor.value < 1) cursor.value = lastIndex.value
  else cursor.value--
}

const cursorDown = () => {
  if (!props.options.length) {
    cursor.value = -1
    return
  }

  if (cursor.value >= lastIndex.value) cursor.value = 0
  else cursor.value++
}

const selectCursor = () => {
  const value = cursor.value !== -1 ? props.options[cursor.value] : undefined

  if (value) {
    if (props.modelValue.includes(value)) unselect(value)
    else select(value)
  } else {
    if (props.search) createOption(props.search)
  }
}

let deletePressTimeout: NodeJS.Timeout | null = null

const captureDoubleDelete = () => {
  if (!props.modelValue.length || props.search.length) return

  if (deletePressTimeout) {
    unselect(props.modelValue[props.modelValue.length - 1])

    clearTimeout(deletePressTimeout)
    deletePressTimeout = null
  } else {
    deletePressTimeout = setTimeout(() => {
      deletePressTimeout = null
    }, 500)
  }
}

const open = () => {
  isOpen.value = true
}

const close = () => {
  isOpen.value = false

  emit('update:search', '')
}

const select = (item: string): void => {
  if (props.loading || props.readonly) return

  emit('select', item)
}

const unselect = (item: string): void => {
  if (props.loading || props.readonly) return

  emit('unselect', item)
}

const createOption = (item: string): void => {
  if (!props.allowCreate || props.loading || props.readonly) return

  emit('create:option', item)
}

const focus = () => {
  input.value?.focus()
}

const blur = () => {
  input.value?.blur()
}

watch(toRef(props, 'modelValue'), async () => {
  await nextTick()

  dropdownMenu.value?.updateDropdown?.()
})

defineExpose({
  focus,
  blur,
})

</script>
