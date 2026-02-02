import { TreeStore } from '@/store/TreeStore'
import type { Item, TreeId } from '@/types/index.types'
import { describe, expect, it } from 'vitest'

const baseItems: Item[] = [
  { id: 1, parent: null, label: 'Айтем 1' },
  { id: '91064cee', parent: 1, label: 'Айтем 2' },
  { id: 3, parent: 1, label: 'Айтем 3' },
  { id: 4, parent: '91064cee', label: 'Айтем 4' },
  { id: 5, parent: '91064cee', label: 'Айтем 5' },
  { id: 6, parent: '91064cee', label: 'Айтем 6' },
  { id: 7, parent: 4, label: 'Айтем 7' },
  { id: 8, parent: 4, label: 'Айтем 8' },
]

function createStore(items: Item[] = baseItems) {
  // Клонируем, чтобы каждый тест работал с независимой коллекцией
  return new TreeStore<Item>(items.map((it) => ({ ...it })))
}

describe('TreeStore', () => {
  it('getAll возвращает текущий массив элементов', () => {
    const store = createStore()
    const all = store.getAll()

    expect(all).toHaveLength(baseItems.length)
    expect(all[0]).toMatchObject({ id: 1, parent: null })
  })

  it('getItem возвращает элемент по id', () => {
    const store = createStore()

    expect(store.getItem(1)).toMatchObject({ id: 1 })
    expect(store.getItem('91064cee')).toMatchObject({ id: '91064cee' })
    expect(store.getItem(999 as TreeId)).toBeUndefined()
  })

  it('getChildren возвращает только прямых детей', () => {
    const store = createStore()

    const childrenOf1 = store.getChildren(1)
    expect(childrenOf1.map((i) => i.id)).toEqual(['91064cee', 3])

    const childrenOf9106 = store.getChildren('91064cee')
    expect(childrenOf9106.map((i) => i.id)).toEqual([4, 5, 6])

    const childrenOf7 = store.getChildren(7)
    expect(childrenOf7).toEqual([])
  })

  it('getAllChildren возвращает всех потомков (включая глубокие уровни)', () => {
    const store = createStore()

    const allChildrenOf1 = store.getAllChildren(1)
    const ids1 = allChildrenOf1.map((i) => i.id).sort()
    expect(ids1).toEqual(['91064cee', 3, 4, 5, 6, 7, 8].sort())

    const allChildrenOf9106 = store.getAllChildren('91064cee')
    const ids9106 = allChildrenOf9106.map((i) => i.id).sort()
    expect(ids9106).toEqual([4, 5, 6, 7, 8].sort())

    const allChildrenOf4 = store.getAllChildren(4)
    const ids4 = allChildrenOf4.map((i) => i.id).sort()
    expect(ids4).toEqual([7, 8].sort())
  })

  it('getAllParents возвращает цепочку от элемента до корня в правильном порядке', () => {
    const store = createStore()

    const parentsOf7 = store.getAllParents(7)
    expect(parentsOf7.map((i) => i.id)).toEqual([7, 4, '91064cee', 1])

    const parentsOfRoot = store.getAllParents(1)
    expect(parentsOfRoot.map((i) => i.id)).toEqual([1])
  })

  it('addItem добавляет новый элемент и учитывает его во всех методах', () => {
    const store = createStore()

    store.addItem({ id: 100, parent: 3, label: 'Новый' })

    expect(store.getItem(100)).toMatchObject({ id: 100, parent: 3 })
    expect(store.getChildren(3).map((i) => i.id)).toEqual([100])
    expect(store.getAllChildren(1).some((i) => i.id === 100)).toBe(true)
  })

  it('removeItem удаляет элемент и все его поддерево', () => {
    const store = createStore()

    // Удаляем поддерево '91064cee' (сам элемент и всех его потомков)
    store.removeItem('91064cee')

    const all = store.getAll()
    const remainingIds = all.map((i) => i.id).sort()
    // Должны остаться только 1 и 3
    expect(remainingIds).toEqual([1, 3])

    expect(store.getItem('91064cee')).toBeUndefined()
    expect(store.getItem(4)).toBeUndefined()
    expect(store.getItem(5)).toBeUndefined()
    expect(store.getItem(6)).toBeUndefined()
    expect(store.getItem(7)).toBeUndefined()
    expect(store.getItem(8)).toBeUndefined()
  })

  it('updateItem обновляет данные элемента', () => {
    const store = createStore()

    store.updateItem({ id: 3, parent: 1, label: 'Айтем 3 (обновлен)' })

    const item = store.getItem(3)
    expect(item).toMatchObject({ id: 3, label: 'Айтем 3 (обновлен)' })
  })

  it('updateItem может менять родителя элемента', () => {
    const store = createStore()

    // Переместим 3 из-под 1 под 4
    store.updateItem({ id: 3, parent: 4, label: 'Айтем 3' })

    expect(store.getChildren(1).map((i) => i.id)).toEqual(['91064cee'])
    expect(store.getChildren(4).map((i) => i.id).sort()).toEqual([3, 7, 8].sort())
  })

  it('addItem не позволяет добавить элемент с уже существующим id', () => {
    const store = createStore()
    expect(() => store.addItem({ id: 1, parent: null, label: 'дубликат' })).toThrowError()
  })

  it('updateItem кидает ошибку, если элемента не существует', () => {
    const store = createStore()
    expect(() => store.updateItem({ id: 999, parent: null, label: 'нет такого' })).toThrowError()
  })
})
