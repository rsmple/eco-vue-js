<template>
  <div
    class="bg-primary-light dark:bg-primary-darkest w-skeleton w-skeleton-opacity-50 dark:w-skeleton-opacity-5 before:animate-ticker w-option-has-bg"
    :style="{'--skeleton-width-internal': (Math.round(Math.random() * 40) + 40) + '%'}"
  >
    <slot />
  </div>
</template>
