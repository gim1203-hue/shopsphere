import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function EmptyState({ icon, title, text, action = 'Explore the collection', to = '/shop' }) {
  return <div className="empty-state"><div className="empty-icon">{icon}</div><h2>{title}</h2><p>{text}</p><Link className="button dark" to={to}>{action}<ArrowRight size={17} /></Link></div>
}
