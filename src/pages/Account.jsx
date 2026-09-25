import { Heart, LogOut, MapPin, Package, Save, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../context/StoreContext'

export default function Account() {
  const { user, profile, signOut, updateProfile } = useAuth()
  const { favoriteProducts, cartCount } = useStore()
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({ first_name: profile?.first_name || user?.user_metadata?.first_name || '', last_name: profile?.last_name || user?.user_metadata?.last_name || '' })
  const save = async (event) => {
    event.preventDefault(); setSaved(false)
    const { error } = await updateProfile(form)
    if (!error) { setEditing(false); setSaved(true) }
  }
  const name = [profile?.first_name || user?.user_metadata?.first_name, profile?.last_name || user?.user_metadata?.last_name].filter(Boolean).join(' ') || 'ShopSphere member'
  return <><section className="account-hero"><div className="container"><span className="eyebrow light">Your space</span><h1>Welcome, <em>{name.split(' ')[0]}</em>.</h1><p>Everything you love, all in one considered place.</p></div></section><section className="container account-dashboard"><aside className="account-nav"><a href="#profile" className="active"><UserRound /> Profile</a><Link to="/favorites"><Heart /> Favorites <span>{favoriteProducts.length}</span></Link><a href="#orders"><Package /> Orders</a><a href="#addresses"><MapPin /> Addresses</a><button onClick={signOut}><LogOut /> Sign out</button></aside><div className="account-content"><section id="profile" className="account-card"><div className="account-card-head"><div><span className="eyebrow">Personal details</span><h2>Your profile</h2></div>{!editing && <button onClick={() => setEditing(true)}>Edit</button>}</div>{editing ? <form className="profile-form" onSubmit={save}><div className="form-row"><label><span>First name</span><input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required /></label><label><span>Last name</span><input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required /></label></div><label><span>Email address</span><input value={user.email} disabled /></label><div className="profile-actions"><button type="button" onClick={() => setEditing(false)}>Cancel</button><button className="button dark"><Save size={15} /> Save changes</button></div></form> : <div className="profile-details"><div><span>Name</span><strong>{name}</strong></div><div><span>Email</span><strong>{user.email}</strong></div><div><span>Member since</span><strong>{new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</strong></div>{saved && <p className="auth-success">Your profile has been updated.</p>}</div>}</section><div className="account-stats"><Link to="/favorites"><Heart /><span><strong>{favoriteProducts.length}</strong>Saved favorites</span></Link><Link to="/cart"><Package /><span><strong>{cartCount}</strong>Items in your bag</span></Link></div><section id="orders" className="account-card empty-account-card"><Package /><h2>Your orders will appear here</h2><p>Once checkout is connected to a payment provider, completed orders will be saved to your account.</p><Link className="text-link" to="/shop">Browse the collection</Link></section></div></section></>
}
