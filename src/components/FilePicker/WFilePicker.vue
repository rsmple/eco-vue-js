<template>
  <div class="relative mb-6">
    <div
      class="relative h-64 min-w-[15rem] mb-1"
      @dragenter.prevent="setIsActive(true)"
      @dragover.prevent="setIsActive(true)"
      @dragleave.prevent="setIsActive(false)"
      @dragend.prevent="setIsActive(false)"
      @drop.prevent="onDrop"
    >
      <label
        class="absolute top-0 left-0 w-full h-full"
        :class="{'active': isActive, 'has-error': !!errorMessage}"
      >
        <input
          ref="input"
          type="file"
          class="hidden"
          :multiple="multiple"
          :accept="accept"
          @change="updateModelValue"
        >

        <svg
          class="absolute top-0 left-0 w-full h-full text-primary-default dark:text-primary-dark rounded-xl opacity-50 group/border"
          :class="{
            'opacity-100 border-active': isActive,
            'text-negative dark:text-negative-dark': !!errorMessage,
          }"
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            width="100%"
            height="100%"
            fill="none"
            rx="12"
            ry="12"
            stroke="currentColor"
            stroke-width="4"
            stroke-dasharray="5% 3%"
            stroke-dashoffset="0"
            stroke-linecap="square"
            class="group-[.border-active]/border:animate-border-rotate"
          />
        </svg>

        <div class="w-full h-full flex flex-col items-center text-base text-accent">
          <template v-if="!modelValue">
            <div class="font-semibold mt-16">
              Drag and drop files here
            </div>

            <div class="font-normal mt-4">
              or
            </div>

            <WButton
              :semantic-type="SemanticType.PRIMARY"
              class="mt-4"
              @click.stop.prevent="input?.click()"
            >
              Browse file
            </WButton>
          </template>

          <div v-else>
            <div
              v-for="(file, index) in (modelValue as unknown as File[])"
              :key="index"
              class="flex flex-col items-center"
            >
              <div
                :style="{backgroundImage: `url(${createUrl(file)})`}"
                class="square-44 rounded-full mt-6 mb-3 mx-3 bg-cover bg-no-repeat"
              />

              <div class="text-base text-accent font-normal truncate max-w-[15rem]">
                {{ file.name }}
              </div>
            </div>
          </div>
        </div>
      </label>
    </div>

    <Transition
      enter-active-class="fade-enter-active"
      leave-active-class="fade-leave-active"
      enter-from-class="fade-enter-from"
      leave-to-class="fade-leave-to"
    >
      <div
        v-if="errorMessage"
        class="absolute right-0 text-xs text-negative dark:text-negative-dark font-normal"
      >
        {{ errorMessage }}
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, onUnmounted, ref} from 'vue'
import WButton from '@whitespots/ui-kit/dist/components/Button/WButton.vue'
import {SemanticType} from '@/utils/SemanticType'

defineProps<{
  modelValue: FileList | undefined
  multiple?: boolean
  accept?: string
  errorMessage?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: FileList | undefined): void
}>()

const input = ref<HTMLInputElement>()
const isActive = ref(false)

const updateModelValue = (): void => {
  emit('update:modelValue', input.value?.files?.length ? input.value.files : undefined)
}

const setIsActive = (value: boolean): void => {
  isActive.value = value
}

const onDrop = (event: DragEvent): void => {
  setIsActive(false)

  emit('update:modelValue', event.dataTransfer?.files?.length ? event.dataTransfer.files : undefined)
}

const createUrl = (file: File): string => {
  return URL.createObjectURL(file)
}

const preventDefaults = (e: Event) => {
  e.preventDefault()
}

const events = ['dragenter', 'dragover', 'dragleave', 'drop']

onMounted(() => {
  events.forEach((eventName) => {
    document.body.addEventListener(eventName, preventDefaults)
  })
})

onUnmounted(() => {
  events.forEach((eventName) => {
    document.body.removeEventListener(eventName, preventDefaults)
  })
})

</script>
