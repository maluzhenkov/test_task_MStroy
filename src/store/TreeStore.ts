export type TreeId = string | number

export type TreeItemBase = {
  id: TreeId
  parent: TreeId | null
}

/**
 * TreeStore хранит плоский массив элементов и предоставляет удобные методы
 * для навигации по дереву через поля `id` и `parent`.
 *
 * ВАЖНО: `id` может быть строкой или числом; сравнение идет по строгому равенству.
 */
export class TreeStore<TItem extends TreeItemBase = TreeItemBase> {
  private items: TItem[]
  private idToItem = new Map<TreeId, TItem>()
  private parentToChildrenIds = new Map<TreeId | null, TreeId[]>()

  constructor(items: TItem[]) {
    this.items = items
    this.rebuildIndexes()
  }

  /** Возвращает изначальный массив элементов (текущую коллекцию хранилища). */
  getAll(): TItem[] {
    return this.items
  }

  /** Возвращает элемент по id, либо `undefined`, если элемент не найден. */
  getItem(id: TreeId): TItem | undefined {
    return this.idToItem.get(id)
  }

  /** Возвращает массив прямых дочерних элементов. */
  getChildren(id: TreeId): TItem[] {
    const childIds = this.parentToChildrenIds.get(id)
    if (!childIds || childIds.length === 0) return []
    return childIds.map((childId) => this.idToItem.get(childId)).filter(isDefined)
  }

  /**
   * Возвращает всех потомков элемента: прямых детей + детей детей и т.д.
   * Результат — плоский массив.
   */
  getAllChildren(id: TreeId): TItem[] {
    const result: TItem[] = []
    const stack: TreeId[] = [...(this.parentToChildrenIds.get(id) ?? [])]
    const visited = new Set<TreeId>()

    while (stack.length) {
      const currentId = stack.pop()!
      if (visited.has(currentId)) continue
      visited.add(currentId)

      const item = this.idToItem.get(currentId)
      if (item) result.push(item)

      const next = this.parentToChildrenIds.get(currentId)
      if (next && next.length) stack.push(...next)
    }

    return result
  }

  /**
   * Возвращает цепочку родителей, начиная с самого элемента `id` и до корня.
   * Порядок важен: [сам элемент, его родитель, ..., корневой]
   */
  getAllParents(id: TreeId): TItem[] {
    const result: TItem[] = []
    const visited = new Set<TreeId>()

    let current = this.idToItem.get(id)
    while (current) {
      // защита от циклов
      if (visited.has(current.id)) break
      visited.add(current.id)

      result.push(current)
      if (current.parent === null) break
      current = this.idToItem.get(current.parent)
    }

    return result
  }

  /** Добавляет новый элемент в хранилище. */
  addItem(item: TItem): void {
    if (this.idToItem.has(item.id)) {
      throw new Error(`TreeStore.addItem: item with id "${String(item.id)}" already exists`)
    }
    this.items.push(item)
    this.rebuildIndexes()
  }

  /**
   * Удаляет элемент и всех его потомков из хранилища.
   * Если id не найден — ничего не делает.
   */
  removeItem(id: TreeId): void {
    if (!this.idToItem.has(id)) return

    const toRemove = new Set<TreeId>()
    toRemove.add(id)
    for (const child of this.getAllChildren(id)) toRemove.add(child.id)

    // Удаляем in-place, чтобы ссылка на исходный массив сохранялась (важно для getAll()).
    for (let i = this.items.length - 1; i >= 0; i--) {
      if (toRemove.has(this.items[i]!.id)) this.items.splice(i, 1)
    }
    this.rebuildIndexes()
  }

  /**
   * Обновляет существующий элемент (по `id`).
   * Если элемента нет — кидает ошибку.
   */
  updateItem(item: TItem): void {
    if (!this.idToItem.has(item.id)) {
      throw new Error(`TreeStore.updateItem: item with id "${String(item.id)}" does not exist`)
    }

    const idx = this.items.findIndex((it) => it.id === item.id)
    if (idx === -1) {
      // защитный случай: индексы рассинхронизированы, но в карте id есть элемент
      this.rebuildIndexes()
      throw new Error(`TreeStore.updateItem: internal index mismatch for id "${String(item.id)}"`)
    }

    this.items[idx] = item
    this.rebuildIndexes()
  }

  private rebuildIndexes(): void {
    this.idToItem.clear()
    this.parentToChildrenIds.clear()

    // 1) id -> item
    for (const item of this.items) {
      this.idToItem.set(item.id, item)
    }

    // 2) parent -> children ids (порядок детей = порядок элементов в this.items)
    for (const item of this.items) {
      const parent = item.parent
      const list = this.parentToChildrenIds.get(parent)
      if (list) list.push(item.id)
      else this.parentToChildrenIds.set(parent, [item.id])
    }
  }
}

function isDefined<T>(v: T | undefined | null): v is T {
  return v !== undefined && v !== null
}

