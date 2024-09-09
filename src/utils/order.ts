
export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export type OrderItem<Field> = {field: Field, order: Order}

export const parseOrdering = <Field extends string = string>(ordering: string): OrderItem<Field>[] => {
  return ordering.split(',').map((orderItem: string): OrderItem<Field> => {
    return {
      field: orderItem.replace(/^-+/, '') as Field,
      order: orderItem[0] === '-' ? Order.DESC : Order.ASC,
    }
  })
}

export const encodeOrdering = (items: OrderItem<unknown>[]): string | undefined => {
  return items.map(item => `${ item.order === 'DESC' ? '-' : '' }${ item.field }`).join(',') || undefined
}
