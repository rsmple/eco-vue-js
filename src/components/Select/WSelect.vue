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
        :disabled="disabled"
        :has-changes="hasChanges"
        :class="{
          'cursor-pointer': !disabled,
          'cursor-not-allowed': disabled,
        }"
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
            class="relative flex overflow-hidden items-center max-w-[calc(100%-2.75rem)]"
            :class="{
              'cursor-pointer': !disabled,
              'cursor-not-allowed': disabled,
            }"
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
            v-if="!disabled"
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
          v-if="!options.length"
          class="p-4 select-none cursor-default"
        >
          {{ emptyStub ?? 'No match' }}
        </div>

        <SelectOption
          v-for="(option, index) in options"
          ref="selectOption"
          :key="option"
          :is-selected="modelValue.includes(option)"
          :is-cursor="index === cursor"
          :loading="loadingOptionIndex === index && loading"
          class="relative"
          :class="{
            'cursor-progress': loading,
            'w-ripple': !loading,
          }"
          @select="select(option); setLoadingOptionIndex(index)"
          @unselect="unselect(option); setLoadingOptionIndex(index)"
          @mouseenter="setCursor(index)"
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
          :is-cursor="cursor === options.length"
          :loading="loadingOptionIndex === options.length && loading"
          class="relative"
          :class="{
            'cursor-progress': loading,
            'w-ripple': !loading,
          }"
          @select="createOption(search)"
          @mouseenter="setCursor(options.length)"
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
import {debounce} from '@/utils/utils'

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
  disabled?: boolean
  skeleton?: boolean
  searchSize?: number
  allowCreate?: boolean
  errorMessage?: string
  required?: boolean
  hasChanges?: boolean
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
const isCursorLocked = ref(false)
const hasCreateButton = computed(() => props.allowCreate && props.search.length && !props.options.includes(props.search))
const lastIndex = computed(() => hasCreateButton.value ? props.options.length : props.options.length - 1)
const isMobile = getIsMobile()
const focused = ref(false)
const selectOption = ref<InstanceType<typeof SelectOption>[]>([])
const loadingOptionIndex = ref<number | null>(null)

const isDisabled = computed(() => props.loading || props.readonly || props.disabled)

const setLoadingOptionIndex = (value: number) => {
  if (isDisabled.value) return

  loadingOptionIndex.value = value
}

const unlockCursor = debounce(() => {
  isCursorLocked.value = false
}, 50)

const lockCursor = () => {
  isCursorLocked.value = true

  unlockCursor()
}

const setCursor = (value: number): void => {
  if (isCursorLocked.value) return

  cursor.value = value
}

const cursorUp = () => {
  if (isDisabled.value) return

  lockCursor()

  cursor.value = !props.options.length
    ? 0
    : cursor.value < 1
      ? lastIndex.value
      : cursor.value - 1

  selectOption.value[cursor.value]?.scrollIntoView()
}

const cursorDown = () => {
  if (isDisabled.value) return

  lockCursor()

  cursor.value = !props.options.length
    ? 0
    : cursor.value >= lastIndex.value
      ? 0
      : cursor.value + 1

  selectOption.value[cursor.value]?.scrollIntoView()
}

const selectCursor = () => {
  if (isDisabled.value) return

  const value = cursor.value !== -1 ? props.options[cursor.value] : undefined

  if (value) {
    setLoadingOptionIndex(cursor.value)

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
  if (isDisabled.value) return

  emit('select', item)
}

const unselect = (item: string): void => {
  if (isDisabled.value) return

  emit('unselect', item)
}

const createOption = (item: string): void => {
  if (isDisabled.value) return
  if (!props.allowCreate) return

  setLoadingOptionIndex(props.options.length)

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
