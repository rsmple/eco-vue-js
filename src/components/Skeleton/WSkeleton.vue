<template>
  <div
    class="
      relative bg-primary-light dark:bg-primary-darkest bg-opacity-90 dark:bg-opacity-50 cursor-progress overflow-hidden w-[var(--skeleton-width,70%)] rounded-[var(--skeleton-rounded,0.5rem)]
      before:absolute before:top-0 before:w-full before:h-full
      before:bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.3),rgba(255,255,255,0))]
      before:dark:bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.01),rgba(255,255,255,0))]
      before:animate-ticker
    "
    :style="{'--skeleton-width': (Math.round(Math.random() * 40) + 40) + '%'}"
  >
    &nbsp;
  </div>
</template>
