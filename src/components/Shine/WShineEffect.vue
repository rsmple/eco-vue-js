<template>
  <svg
    v-if="!isMobile"
    width="100%"
    height="100%"
    class="pointer-events-none fixed top-0 print:hidden"
  >
    <defs>
      <linearGradient
        id="w-shine-gradient"
        x1="0%"
        y1="0%"
        x2="100%"
        y2="0%"
        gradientTransform="rotate(10)"
      >
        <stop
          offset="0%"
          stop-color="rgba(255, 255, 255, 0)"
        />
        <stop
          offset="45%"
          stop-color="rgba(255, 255, 255, 0)"
        />
        <stop
          offset="49%"
          stop-color="rgba(255, 255, 255, 0.4)"
        />
        <stop
          offset="50%"
          stop-color="rgba(255, 255, 255, 1)"
        />
        <stop
          offset="51%"
          stop-color="rgba(255, 255, 255, 0.4)"
        />
        <stop
          offset="55%"
          stop-color="rgba(255, 255, 255, 0)"
        />
        <stop
          offset="100%"
          stop-color="rgba(255, 255, 255, 0)"
        />
      </linearGradient>

      <mask
        :id="id"
        maskUnits="userSpaceOnUse"
      >
        <rect
          width="100%"
          height="100%"
          fill="url(#w-shine-gradient)"
        >
          <animate
            attributeName="x"
            values="-100%;-100%;100%;100%"
            keyTimes="0;0.35;0.65;1"
            dur="10s"
            repeatCount="indefinite"
          />
        </rect>
      </mask>
    </defs>
  </svg>
</template>

<script setup lang="ts">
import {useIsMobile} from '@/utils/mobile'

import {useShine} from './use/useShine'

const {id} = useShine()

const {isMobile} = useIsMobile()
</script>