import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/test-route')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/test-route"!</div>
}
