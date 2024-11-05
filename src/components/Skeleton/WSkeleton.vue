<template>
  <div
    class="bg-primary-light dark:bg-primary-darkest w-skeleton before:animate-ticker"
    :style="{'--skeleton-width-internal': (Math.round(Math.random() * 40) + 40) + '%'}"
  >
    &nbsp;
  </div>
</template>
