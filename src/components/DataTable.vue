<script setup lang="ts">
import type { Item, Row } from '@/types/index.types';
import { themeQuartz, type ColDef, type GridOptions } from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';
import { ref } from 'vue';

const theme = themeQuartz

const props = defineProps<{
  rowData: Item[]
}>()

const columnDefs = ref<ColDef[]>([
  {
    headerName: 'Наименование',
    field: 'label',
    flex: 1,
  }
])

// Настройка колонки, которая будет отображать иерархию (названия из path/label)
const autoGroupColumnDef = ref<ColDef>({
  headerName: 'Категория',
  field: 'category',
  flex: 1,
  cellRendererParams: {
    suppressCount: true,
  },
})

const gridOptions: GridOptions<Row> = {
  treeData: true,
  animateRows: true,
  groupDefaultExpanded: 0,
  getDataPath: (data) => data.path,
}
</script>

<template>
  <div class="tree-grid">
    <ag-grid-vue
      class="tree-grid__table"
      :theme="theme"
      :columnDefs="columnDefs"
      :autoGroupColumnDef="autoGroupColumnDef"
      :rowData="rowData"
      :gridOptions="gridOptions"
      :row-numbers="{
        headerTooltip: '№ п/п',
      }"
    />
  </div>
</template>

<style scoped>
.tree-grid {
  width: 100%;
  height: 100%;
}

.tree-grid__table {
  width: 100%;
  height: 600px;
}
</style>

