import { ArrowRight, Check } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export default function OrderSuccess() {
  const { state } = useLocation()
  return <section className="success-page container"><div className="success-mark"><Check /></div><span className="eyebrow">Order received</span><h1>Thank you.<br /><em>It’s on its way.</em></h1><p>We’ve received your order{state?.order ? ` ${state.order}` : ''}. A confirmation has been sent{state?.email ? ` to ${state.email}` : ' to your email'}.</p><Link className="button dark" to="/shop">Keep exploring <ArrowRight size={17} /></Link></section>
}
