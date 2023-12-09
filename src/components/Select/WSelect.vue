<template>
  <WInputSuggest
    ref="input"
    :title="title"
    :mobile-title="mobileTitle"
    :description="description"
    :model-value="search"
    :max-length="maxSearchLength"
    :loading="loading"
    :hide-input="modelValue.length === 0 ? false : isMobile ? !focused : !isOpen"
    :readonly="readonly"
    :skeleton="skeleton"
    :size="searchSize"
    :error-message="errorMessage"
    :required="required"
    :disabled="disabled"
    :has-changes="hasChanges"
    :placeholder="placeholder"
    :no-margin="noMargin"
    :icon="icon"
    @update:model-value="!loading && $emit('update:search', $event as string ?? '')"

    @keypress:enter.stop.prevent="selectCursor"
    @keypress:up.prevent="cursorUp"
    @keypress:down.prevent="cursorDown"
    @keypress:delete="captureDoubleDelete"

    @open="isOpen = true"
    @close="close(); $emit('update:search', '')"
    @focus="focused = true"
    @blur="focused = false"
  >
    <template #prefix="{unclickable}">
      <template v-if="hidePrefix ? isMobile ? (unclickable || !focused) : !isOpen : true">
        <div
          v-for="option in modelValue"
          :key="option"
          class="relative flex overflow-hidden items-center text-description group/model"
          :class="{
            'cursor-pointer': !disabled,
            'cursor-not-allowed opacity-50': disabled,
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
                :option="option"
                :selected="true"
                :model="true"
              >
                <button
                  v-if="!disableClear"
                  class="relative flex square-5 rounded-full -my-1 -mr-2 ml-1 items-center justify-center outline-none"
                  :class="{
                    'cursor-not-allowed': disabled,
                    'cursor-progress': loading,
                    'cursor-pointer w-ripple w-ripple-hover ': !loading && !disabled,
                  }"
                  @mousedown.stop.prevent=""
                  @click.stop.prevent="!loading && unselect(option)"
                >
                  <IconCancel class="square-3" />
                </button>
              </component>
            </template>
          </slot>

          <button
            v-if="!optionComponent && !disableClear"
            class="relative flex square-5 rounded-full items-center justify-center outline-none"
            :class="{
              'cursor-not-allowed': disabled,
              'cursor-progress': loading,
              'cursor-pointer w-ripple w-ripple-hover ': !loading && !disabled,
            }"
            @mousedown.stop.prevent=""
            @click.stop.prevent="!loading && unselect(option)"
          >
            <IconCancel class="square-3" />
          </button>
        </div>
      </template>
    </template>

    <template
      v-if="$slots.right?.()?.length"
      #right
    >
      <slot name="right" />
    </template>

    <template #content>
      <div
        v-if="!options.length"
        class="py-2 px-[1.0625rem] first:pt-4 last:pb-4"
      >
        <div
          class="select-none cursor-default w-select-field sm-not:px-3"
        >
          {{ emptyStub ?? 'No match' }}
        </div>
      </div>

      <SelectOption
        v-for="(option, index) in options"
        :key="option"
        :is-selected="modelValue.includes(option)"
        :is-cursor="index === cursor"
        :loading="loadingOptionIndex === index && loading"
        :scroll="isCursorLocked"
        class="first:pt-4 last:pb-4"
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
              :option="option"
              :selected="selected"
              :model="false"
            />
          </slot>
        </template>
      </SelectOption>

      <SelectOption
        v-if="allowCreate && search !== ''"
        :is-selected="false"
        :is-cursor="cursor === options.length"
        :loading="loadingOptionIndex === options.length && loading"
        :scroll="isCursorLocked"
        class="first:pt-4 last:pb-4"
        @select="createOption(search)"
        @mouseenter="setCursor(options.length)"
      >
        <span class="w-select-field pr-2 sm-not:px-3">
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
            :option="search"
            :selected="false"
            :model="false"
          />
        </slot>
      </SelectOption>
    </template>
  </WInputSuggest>
</template>

<script lang="ts" setup generic="Item extends string | number = string">
import {ref, watch, toRef, nextTick, computed, type Component} from 'vue'
import SelectOption from './components/SelectOption.vue'
import IconCancel from '@/assets/icons/default/IconCancel.svg?component'
import {getIsMobile} from '@/utils/mobile'
import {debounce} from '@/utils/utils'
import WInputSuggest from '@/components/Input/WInputSuggest.vue'

const props = defineProps<{
  modelValue: Item[]
  search: string
  options: Item[]
  title?: string
  mobileTitle?: string
  description?: string
  loading?: boolean
  emptyStub?: string
  maxSearchLength?: number
  optionComponent?: Component<{option: Item, selected?: boolean, model?: boolean}>
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
  placeholder?: string
  noMargin?: boolean
  icon?: SVGComponent
}>()

const emit = defineEmits<{
  (e: 'select', item: string | number): void
  (e: 'unselect', item: string | number): void
  (e: 'update:search', value: string): void
  (e: 'create:option', value: string): void
}>()

const isOpen = ref(false)
const input = ref<ComponentInstance<typeof WInputSuggest> | undefined>()
const cursor = ref<number>(-1)
const isCursorLocked = ref(false)
const lastIndex = computed(() => props.allowCreate ? props.options.length : props.options.length - 1)
const isMobile = getIsMobile()
const focused = ref(false)
const loadingOptionIndex = ref<number | null>(null)

const isDisabled = computed(() => props.loading || props.readonly || props.disabled)

const close = () => {
  isOpen.value = false
  focused.value = false
}

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
}

const cursorDown = () => {
  if (isDisabled.value) return

  lockCursor()

  cursor.value = !props.options.length
    ? 0
    : cursor.value >= lastIndex.value
      ? 0
      : cursor.value + 1
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

const select = (item: Item): void => {
  if (isDisabled.value) return

  emit('select', item)
}

const unselect = (item: Item): void => {
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

  input.value?.updateDropdown()
})

defineExpose({
  focus,
  blur,
})

</script>
