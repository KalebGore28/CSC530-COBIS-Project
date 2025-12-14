import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute(
    '/_authenticated/_layout/instructors/$mnumber/',
)({
    beforeLoad: (context) => {
        throw redirect({
            to: '/instructors/$mnumber/current-term',
            params: context.params,
        })
    },
})
