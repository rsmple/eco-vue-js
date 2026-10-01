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
              title="Security review"
              big
            />

            <span class="text-2xl text-gray-400">Acme web app</span>
          </div>
        </WPage>

        <WPage
          title="Summary"
          eyebrow="Overview"
          :date="date"
          watermark="Draft"
        >
          <template #meta>
            Scope: acme.example<br>
            Reviewer: J. Doe
          </template>

          <div class="grid gap-4 text-lg">
            <p>{{ findings.length }} findings, 4 of them high.</p>

            <p>
              <WPageTitle title="Method" />
            </p>

            <p>Manual review of the web app and its API, with automated scans of the dependencies.</p>
          </div>
        </WPage>

        <WPage
          title="Findings"
          :date="date"
          watermark="Draft"
        >
          <template #header>
            <div class="grid grid-cols-[4rem_1fr_6rem] border-b border-solid border-gray-200 py-2 font-semibold">
              <span>#</span><span>Finding</span><span>Severity</span>
            </div>
          </template>

          <!-- Rows of a `w-page-inner` element move one by one, so the table continues on the next page. -->
          <div class="w-page-inner">
            <div
              v-for="(item, index) in findings"
              :key="index"
              class="border-b border-solid border-gray-100 py-3 text-lg"
            >
              <!-- One element inside, so the row moves whole. -->
              <div class="grid grid-cols-[4rem_1fr_6rem]">
                <span class="text-gray-400">{{ index + 1 }}</span>
                <span>{{ item.title }}</span>
                <span>{{ item.severity }}</span>
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

const TITLES = ['SQL injection in search', 'Stored XSS in comments', 'Missing rate limit on login', 'Outdated TLS configuration', 'Verbose error pages', 'Session cookie without Secure']
const SEVERITIES = ['High', 'High', 'Medium', 'Low', 'Low', 'Medium']

const findings = Array.from({length: 36}, (_, index) => ({title: TITLES[index % TITLES.length]!, severity: SEVERITIES[index % SEVERITIES.length]!}))
</script>
