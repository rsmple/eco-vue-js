<template>
  <WInputSuggest
    ref="input"
    v-bind="{
      ...props,
      modelValue: search,
      loading: loading || isFetchingPrefix || loadingCreate,
      hideInput: isMobile ? !focused : !isOpen,
    }"
    :class="$attrs.class"
    @update:model-value="!loading && !isFetchingPrefix && (search = $event as string ?? '')"

    @keypress:enter.stop.prevent="list?.selectCursor()"
    @keypress:up.prevent="list?.cursorUp()"
    @keypress:down.prevent="list?.cursorDown()"
    @keypress:delete="captureDoubleDelete"

    @open="isOpen = true"
    @close="close(); search = ''"
    @focus="focused = true"
    @blur="focused = false"
  >
    <template
      v-if="$slots.title"
      #title
    >
      <slot name="title" />
    </template>

    <template
      v-if="$slots.subtitle"
      #subtitle
    >
      <slot name="subtitle" />
    </template>

    <template #prefix="{unclickable}">
      <SelectAsyncPrefix
        v-if="hidePrefix ? isMobile ? (unclickable || !focused) : !isOpen : true"
        :use-query-fn="useQueryFnPrefix ?? useQueryFnOptions"
        :model-value="modelValue"
        :disabled="disabled"
        :loading="loading || isFetchingPrefix"
        :option-component="(optionComponent as SelectOptionComponent<Data>)"
        :option-component-props="(optionComponentProps as SelectOptionComponentProps<Data, OptionComponent>)"
        :disable-clear="disableClear"
        :preview-data="previewData"
        :created-data="createdData"
        :value-getter="valueGetter"
        :value-query-key="valueQueryKey"
        @unselect="unselect"
        @update:fetching="!$event && updateDropdown(); isFetchingPrefix = $event"
        @update:model-value="updateSelected"
      >
        <template #default="{option, skeleton: skeletonPrefix, index}">
          <slot
            name="option"
            :option="option"
            :index="index"
            :selected="true"
            :model="true"
            :skeleton="skeletonPrefix"
          />
        </template>
      </SelectAsyncPrefix>
    </template>

    <template
      v-if="$slots.right?.()?.length"
      #right
    >
      <slot name="right" />
    </template>

    <template #content>
      <SelectAsyncList
        ref="list"
        :model-value="modelValue"
        :use-query-fn="useQueryFnOptions"
        :query-params="({...queryParamsOptions, [searchField ?? 'search']: search} as QueryParams)"
        :is-invalid-page="isInvalidPage"
        :loading="loading || isFetchingPrefix"
        :disabled="isDisabled"
        :empty-stub="emptyStub"
        :allow-create="createOption && search !== ''"
        :hide-option-icon="hideOptionIcon"
        :value-getter="valueGetter"
        :loading-create="loadingCreate"
        @select="select"
        @unselect="unselect"
        @create:option="create"
        @update:model-value="updateSelected"
      >
        <template #default="{option, selected, skeleton: skeletonList}">
          <slot
            name="option"
            :option="option"
            :selected="selected"
            :skeleton="skeletonList"
            :model="false"
            :search="search"
          >
            <component
              v-bind="(optionComponentProps as SelectOptionComponentProps<Data, OptionComponent>)"
              :is="optionComponent"
              :option="option"
              :selected="selected"
              :skeleton="skeletonList"
              :model="false"
              :search="search"
            />
          </slot>
        </template>
      </SelectAsyncList>
    </template>
  </WInputSuggest>
</template>

<script lang="ts" setup generic="Model extends number | string, Data extends DefaultData, QueryParams, OptionComponent extends SelectOptionComponent<Data>">
import {ref, nextTick, computed, watch} from 'vue'
import {getIsMobile} from '@/utils/mobile'
import WInputSuggest from '@/components/Input/WInputSuggest.vue'
import SelectAsyncPrefix from './components/SelectAsyncPrefix.vue'
import SelectAsyncList from './components/SelectAsyncList.vue'
import type {SelectAsyncProps, SelectOptionComponent, SelectOptionComponentProps} from './types'

defineOptions({inheritAttrs: false})

const props = withDefaults(
  defineProps<SelectAsyncProps<Model, Data, QueryParams, OptionComponent>>(),
  {
    emptyStub: 'No match',
    valueGetter: (data: Data) => (data.id as Model),
    valueQueryKey: 'id__in',
  },
)

const emit = defineEmits<{
  (e: 'select', item: Model): void
  (e: 'unselect', item: Model): void
  (e: 'update:modelValue', value: Model[]): void
}>()

const isOpen = ref(false)
const input = ref<ComponentInstance<typeof WInputSuggest<'text'>> | undefined>()
const list = ref<ComponentInstance<typeof SelectAsyncList<Model, Data, QueryParams>> | undefined>()
const isMobile = getIsMobile()
const focused = ref(false)
const isFetchingPrefix = ref(false)
const search = ref('')
const loadingCreate = ref(false)

const isDisabled = computed(() => props.loading || props.readonly || props.disabled)
const enabled = computed(() => !props.disabled)

const close = () => {
  isOpen.value = false
  focused.value = false
}

let deletePressTimeout: NodeJS.Timeout | null = null

const captureDoubleDelete = () => {
  if (!props.modelValue.length || search.value.length) return

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

const select = (item: Model): void => {
  if (isDisabled.value) return

  emit('select', item)

  search.value = ''
}

const unselect = (item: Model): void => {
  if (isDisabled.value) return

  emit('unselect', item)

  search.value = ''
}

const create = async () => {
  if (isDisabled.value) return
  if (!props.createOption) return

  loadingCreate.value = true

  const option = await props.createOption(search.value)

  if (option) {
    select(props.valueGetter(option))

    search.value = ''
  }

  loadingCreate.value = false
}

const updateSelected = (value: Model[]): void => {
  if (isDisabled.value) return

  emit('update:modelValue', value)

  search.value = ''
}

const focus = () => {
  input.value?.focus()
}

const blur = () => {
  input.value?.blur()
}

const updateDropdown = async () => {
  await nextTick()

  input.value?.updateDropdown()
}

if (props.useQueryFnDefault) {
  const {data: defaultData} = props.useQueryFnDefault({enabled})

  watch(defaultData, value => {
    if (value && props.modelValue.length === 0) select(props.valueGetter(value))
  }, {immediate: true})
}

defineExpose({
  focus,
  blur,
})

defineSlots<{
  title?: () => void
  subtitle?: () => void
  right?: (props: Record<string, never>) => void
  option?: (props: {option: Data | null, index?: number, selected: boolean, skeleton: boolean, model: boolean, search?: string}) => void
}>()

</script>
