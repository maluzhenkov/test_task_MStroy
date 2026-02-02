<script setup lang="ts">
import DataTable from '@/components/DataTable.vue'
import { TreeStore } from '@/store/TreeStore'
import type { Item, Row } from '@/types/index.types'
import { computed } from 'vue'

const rawData: Item[] = [
  { id: 1, parent: null, label: 'Айтем 1' },
  { id: '91064cee', parent: 1, label: 'Айтем 2' },
  { id: 3, parent: 1, label: 'Айтем 3' },
  { id: 4, parent: '91064cee', label: 'Айтем 4' },
  { id: 5, parent: '91064cee', label: 'Айтем 5' },
  { id: 6, parent: '91064cee', label: 'Айтем 6' },
  { id: 7, parent: 4, label: 'Айтем 7' },
  { id: 8, parent: 4, label: 'Айтем 8' },
  { id: 9, parent: null, label: 'Айтем 9' },
  { id: 10, parent: 9, label: 'Айтем 10' },
  { id: 11, parent: 9, label: 'Айтем 11' },
  { id: 12, parent: 10, label: 'Айтем 12' },
  { id: 13, parent: 10, label: 'Айтем 13' },
  { id: 14, parent: 3, label: 'Айтем 14' },
  { id: 15, parent: 3, label: 'Айтем 15' },
]

const tree = new TreeStore<Item>(rawData)

// Преобразуем элементы в формат, удобный для tree data AgGrid
const items = computed<Row[]>(() => {
  return tree.getAll().map((item) => {
    const children = tree.getChildren(item.id)
    const parentsChain = tree.getAllParents(item.id).slice().reverse()
    const path = parentsChain.map((i) => i.label)

    return {
      ...item,
      category: children.length > 0 ? 'Группа' : 'Элемент',
      path,
    }
  })
})
</script>

<template>
  <main class="wrap">
    <DataTable :row-data="items" />
  </main>
</template>

<style scoped>
.wrap {
  max-width: 1200px;
  margin: 36px auto;
  padding: 0 16px;
}
</style>
