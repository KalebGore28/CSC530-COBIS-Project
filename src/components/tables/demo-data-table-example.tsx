import type { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { EditableDataTable } from './editable-data-table'

// Sample data type
export type Product = {
    id: string
    name: string
    category: string
    price: number
    stock: number
    status: 'active' | 'inactive' | 'pending'
}

// Sample data
const sampleData: Product[] = [
    {
        id: 'P001',
        name: 'Wireless Mouse',
        category: 'Electronics',
        price: 29.99,
        stock: 145,
        status: 'active',
    },
    {
        id: 'P002',
        name: 'Mechanical Keyboard',
        category: 'Electronics',
        price: 89.99,
        stock: 67,
        status: 'active',
    },
    {
        id: 'P003',
        name: 'USB-C Cable',
        category: 'Accessories',
        price: 12.99,
        stock: 234,
        status: 'active',
    },
    {
        id: 'P004',
        name: 'Laptop Stand',
        category: 'Accessories',
        price: 45.99,
        stock: 89,
        status: 'pending',
    },
    {
        id: 'P005',
        name: 'Webcam HD',
        category: 'Electronics',
        price: 79.99,
        stock: 23,
        status: 'active',
    },
    {
        id: 'P006',
        name: 'Desk Lamp',
        category: 'Furniture',
        price: 34.99,
        stock: 0,
        status: 'inactive',
    },
    {
        id: 'P007',
        name: 'Monitor Arm',
        category: 'Accessories',
        price: 129.99,
        stock: 45,
        status: 'active',
    },
    {
        id: 'P008',
        name: 'Ergonomic Chair',
        category: 'Furniture',
        price: 299.99,
        stock: 12,
        status: 'pending',
    },
    {
        id: 'P009',
        name: 'Headphone Stand',
        category: 'Accessories',
        price: 19.99,
        stock: 156,
        status: 'active',
    },
    {
        id: 'P010',
        name: 'Drawing Tablet',
        category: 'Electronics',
        price: 199.99,
        stock: 34,
        status: 'active',
    },
]

// Column definitions
export const columns: ColumnDef<Product>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
                className="translate-y-0.5"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="translate-y-0.5"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => (
            <div className="font-mono text-sm">{row.getValue('id')}</div>
        ),
    },
    {
        accessorKey: 'name',
        header: 'Product Name',
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue('name')}</div>
        ),
    },
    {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => <div>{row.getValue('category')}</div>,
    },
    {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ row }) => {
            const price = Number.parseFloat(row.getValue('price'))
            const formatted = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            }).format(price)
            return <div className="font-medium">{formatted}</div>
        },
    },
    {
        accessorKey: 'stock',
        header: 'Stock',
        cell: ({ row }) => {
            const stock = row.getValue('stock') as number
            return (
                <div
                    className={
                        stock === 0
                            ? 'text-red-600'
                            : stock < 50
                              ? 'text-yellow-600'
                              : 'text-green-600'
                    }
                >
                    {stock}
                </div>
            )
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.getValue('status') as string
            return (
                <div
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                    }`}
                >
                    {status}
                </div>
            )
        },
    },
]

export function DemoDataTableExample() {
    return <EditableDataTable columns={columns} data={sampleData} />
}
