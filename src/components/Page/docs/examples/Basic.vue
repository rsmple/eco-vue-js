<template>
  <div class="grid gap-4">
    <WPageBreadcrumbs />

    <div class="h-[40rem] overflow-auto rounded-xl bg-surface-muted p-4">
      <WPageNumerator class="grid justify-center gap-4 [zoom:0.5]">
        <WPage
          :date="date"
          watermark="Draft"
          empty
        >
          <div class="grid h-full content-center gap-4">
            <WPageTitle
              title="Greenhouse survey"
              big
            />

            <span class="text-2xl text-subtle">Riverside community garden</span>
          </div>
        </WPage>

        <WPage
          title="Summary"
          eyebrow="Overview"
          :date="date"
          watermark="Draft"
        >
          <template #meta>
            Site: greenhouse 2<br>
            Surveyor: J. Doe
          </template>

          <div class="grid gap-4 text-lg">
            <p>{{ observations.length }} observations, a third of them high priority.</p>

            <p>
              <WPageTitle title="Method" />
            </p>

            <p>A walk along every bench, checking the leaves, roots and soil, with readings from the moisture sensors.</p>
          </div>
        </WPage>

        <WPage
          title="Observations"
          :date="date"
          watermark="Draft"
        >
          <template #header>
            <div class="grid grid-cols-[4rem_1fr_6rem] border-b border-solid border-line-subtle py-2 font-semibold">
              <span>#</span><span>Observation</span><span>Priority</span>
            </div>
          </template>

          <!-- Rows of a `w-page-inner` element move one by one, so the table continues on the next page. -->
          <div class="w-page-inner">
            <div
              v-for="(item, index) in observations"
              :key="index"
              class="border-b border-solid border-line-raised py-3 text-lg"
            >
              <!-- One element inside, so the row moves whole. -->
              <div class="grid grid-cols-[4rem_1fr_6rem]">
                <span class="text-subtle">{{ index + 1 }}</span>
                <span>{{ item.title }}</span>
                <span>{{ item.priority }}</span>
              </div>
            </div>
          </div>
        </WPage>
      </WPageNumerator>
    </div>
  </div>
</template>

<script lang="ts" setup>
import WPage from 'eco-vue-js/dist/components/Page/WPage.vue'
import WPageBreadcrumbs from 'eco-vue-js/dist/components/Page/WPageBreadcrumbs.vue'
import WPageNumerator from 'eco-vue-js/dist/components/Page/WPageNumerator.vue'
import WPageTitle from 'eco-vue-js/dist/components/Page/WPageTitle.vue'

const date = new Date(2026, 8, 30)

const TITLES = ['Root rot in the aloe', 'Spider mites on the monstera', 'Powdery mildew on the courgettes', 'Leggy basil seedlings', 'Yellow tips on the fern', 'Aphids on the roses']
const PRIORITIES = ['High', 'High', 'Medium', 'Low', 'Low', 'Medium']

const observations = Array.from({length: 36}, (_, index) => ({title: TITLES[index % TITLES.length]!, priority: PRIORITIES[index % PRIORITIES.length]!}))
</script>
