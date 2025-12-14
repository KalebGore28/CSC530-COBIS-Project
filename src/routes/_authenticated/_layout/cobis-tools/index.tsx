import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/_layout/cobis-tools/')({
    beforeLoad: ({ params }) => {
        throw redirect({ to: '/cobis-tools/import', params })
    },
})
