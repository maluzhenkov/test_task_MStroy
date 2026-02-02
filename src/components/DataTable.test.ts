import type { Row } from '@/types/index.types'
import { mount } from '@vue/test-utils'
import { themeQuartz } from 'ag-grid-community'
import { describe, expect, it } from 'vitest'
import DataTable from './DataTable.vue'

const makeRows = (): Row[] => {
  const rows: Row[] = [
    {
      id: 1,
      parent: null,
      label: 'Айтем 1',
      category: 'Группа',
      path: ['Айтем 1'],
    },
    {
      id: 2,
      parent: 1,
      label: 'Айтем 2',
      category: 'Элемент',
      path: ['Айтем 1', 'Айтем 2'],
    },
  ]

  return rows
}

// Простая заглушка для AgGridVue, чтобы не тянуть реальный грид в тесты
const AgGridStub = {
  name: 'AgGridVue',
  props: ['theme', 'columnDefs', 'autoGroupColumnDef', 'rowData', 'gridOptions', 'rowNumbers'],
  template: '<div class="ag-grid-mock"></div>',
}

describe('DataTable', () => {
  it('монтируется и прокидывает данные в AgGridVue', () => {
    const rows = makeRows()

    const wrapper = mount(DataTable, {
      props: {
        rowData: rows,
      },
      global: {
        stubs: {
          AgGridVue: AgGridStub,
        },
      },
    })

    const grid = wrapper.findComponent(AgGridStub)
    expect(grid.exists()).toBe(true)

    // Проверяем, что данные передаются как есть
    expect(grid.props('rowData')).toEqual(rows)
    // Проверяем, что используется тема themeQuartz
    expect(grid.props('theme')).toBe(themeQuartz)
  })

  it('использует treeData и getDataPath на основе поля path', () => {
    const rows = makeRows()

    const wrapper = mount(DataTable, {
      props: {
        rowData: rows,
      },
      global: {
        stubs: {
          AgGridVue: AgGridStub,
        },
      },
    })

    const grid = wrapper.findComponent(AgGridStub)
    const gridOptions = grid.props('gridOptions')

    expect(gridOptions.treeData).toBe(true)
    expect(typeof gridOptions.getDataPath).toBe('function')

    // getDataPath должен возвращать path для строки
    expect(gridOptions.getDataPath(rows[0]!)).toEqual(rows[0]!.path)
    expect(gridOptions.getDataPath(rows[1]!)).toEqual(rows[1]!.path)
  })
})

