<script setup lang="ts">
import { ClientApiError } from "@shopware-pwa/types";
import SwCategoryNavigation from "../../../SwCategoryNavigation.vue";
import { Category } from "@shopware-pwa/types";
const { category: activeCategory } = useCategory();
const { loadNavigationElements, navigationElements } = useNavigation();
const navigations = computed(() => {
  const navigation: Category[] = JSON.parse(
    JSON.stringify(navigationElements.value)
  );
  return navigation?.map((navigationElement) => {
    navigationElement.children =
      activeCategory.value?.id === navigationElement.id
        ? navigationElement.children
        : [];
    return navigationElement;
  });
});

onMounted(async () => {
  try {
    await loadNavigationElements({ depth: 2 });
  } catch (e) {
    const err = e as ClientApiError;
    console.error("[SwBottomMenu]", err.messages);
  }
});
</script>
<template>
  <div
    v-if="navigations && navigations.length"
    class="cms-element-category-navigation max-w-screen-xl mx-auto"
  >
    <SwCategoryNavigation
      :level="0"
      :elements="navigations"
      :activeCategory="activeCategory"
    />
  </div>
</template>
