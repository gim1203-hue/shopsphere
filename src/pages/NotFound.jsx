import { Compass } from 'lucide-react'
import EmptyState from '../components/EmptyState'

export default function NotFound({ compact = false }) {
  return <section className={`container not-found ${compact ? 'compact' : ''}`}><EmptyState icon={<Compass />} title="This page wandered off" text="The page or product you’re looking for doesn’t exist, but there’s plenty more to discover." action="Back to the shop" /></section>
}
