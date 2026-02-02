export type TreeId = string | number

export type TreeItemBase = {
  id: TreeId
  parent: TreeId | null
}

export type Item = TreeItemBase & {
  label: string
}

export type Row = Item & {
  category: 'Группа' | 'Элемент'
  path: string[]
}


