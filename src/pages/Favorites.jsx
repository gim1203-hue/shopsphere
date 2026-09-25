import { Heart } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import PageIntro from '../components/PageIntro'
import ProductCard from '../components/ProductCard'
import { useStore } from '../context/StoreContext'

export default function Favorites() {
  const { favoriteProducts } = useStore()
  return <><PageIntro eyebrow="Saved for later" title="Your favorites." text="A little corner for everything that caught your eye." /><section className="container account-page">{favoriteProducts.length ? <div className="product-grid">{favoriteProducts.map((product) => <ProductCard product={product} key={product.id} />)}</div> : <EmptyState icon={<Heart />} title="Nothing saved just yet" text="Tap the heart on any object you love and it will wait for you here." />}</section></>
}
