<template>
  <svg
    class="square-[var(--w-spinner-size,2rem)] animate-spin"
    width="20"
    height="20"
    viewBox="25 25 50 50"
  >
    <circle
      class="animate-spinner-dash"
      cx="50"
      cy="50"
      r="20"
      fill="none"
      stroke="currentColor"
      stroke-width="10%"
      stroke-miterlimit="8"
      stroke-dasharray="1, 100"
      stroke-dashoffset="0"
    />
  </svg>
</template>
