import { Link, useParams } from 'react-router-dom'
import PageIntro from '../components/PageIntro'

const pages = {
  privacy: { title: 'Privacy policy', eyebrow: 'Your information', intro: 'How AskKhan handles account, order, payment, and support information.', sections: [
    ['Information we collect', 'We collect information you provide when creating an account, placing an order, saving an address, or contacting support. Product searches and basic technical error information may also be processed to operate and improve the marketplace.'],
    ['How information is used', 'Information is used to authenticate accounts, fulfill orders, provide invoices and shipping updates, prevent fraud, answer support requests, and maintain the service.'],
    ['Service providers', 'Firebase provides authentication and database services, Stripe processes payments, Vercel hosts the application, and configured email and product-search providers support communications and catalog discovery. Each provider processes information under its own terms.'],
    ['Your choices', 'You may update saved addresses, request order support, and ask for account or data assistance through Merchant Support. Payment card numbers are handled by Stripe and are not stored by AskKhan.'],
  ] },
  terms: { title: 'Terms of use', eyebrow: 'Marketplace terms', intro: 'Rules for accessing listings, accounts, purchases, vehicles, and merchant services.', sections: [
    ['Marketplace listings', 'Inventory, prices, availability, delivery estimates, and seller information may change. A listing is not a guarantee until payment and order confirmation are complete.'],
    ['Vehicles and regulated goods', 'Buyers must independently verify seller identity, ownership, title, VIN, condition, inspection results, taxes, registration, insurance, transport, and local legal requirements before completing a vehicle transaction.'],
    ['Orders and cancellations', 'Submit cancellation, return, refund, or delivery requests through Merchant Support. A request is not complete until confirmed by the merchant.'],
    ['Acceptable use', 'Do not misuse accounts, attempt unauthorized access, bypass network or security controls, submit fraudulent payments, scrape restricted services, or list unlawful goods.'],
  ] },
  accessibility: { title: 'Accessibility', eyebrow: 'Access for everyone', intro: 'AskKhan is designed for keyboard, touch, screen-reader, mobile, tablet, and desktop access.', sections: [
    ['Our approach', 'The storefront uses semantic controls, visible labels, responsive layouts, keyboard-accessible navigation, text alternatives for meaningful images, and scalable browser text.'],
    ['Compatibility', 'We aim to support current versions of Chrome, Edge, Firefox, and Safari on major desktop and mobile operating systems. Organization-managed browsers may have restrictions outside our control.'],
    ['Get assistance', 'If any page or action is difficult to use, contact Merchant Support and describe the page, device, browser, and assistance you need.'],
  ] },
  returns: { title: 'Returns and cancellations', eyebrow: 'Order assistance', intro: 'How to request a cancellation, return, refund, or delivery review.', sections: [
    ['Before shipment', 'Request cancellation as soon as possible from the order invoice or Merchant Support. Submission does not guarantee cancellation if fulfillment has already begun.'],
    ['After delivery', 'Use Merchant Support to explain the issue and include the order number. Keep the item, packaging, and shipment documentation until the merchant responds.'],
    ['Vehicles and local pickup', 'Vehicle, powersports, oversized, personalized, and local-pickup transactions may have listing-specific inspection, deposit, transport, and return terms.'],
  ] },
}

export default function Legal() {
  const { document } = useParams()
  const page = pages[document] || pages.terms
  return <><PageIntro eyebrow={page.eyebrow} title={`${page.title}.`} text={page.intro} /><section className="container legal-page">{page.sections.map(([heading, text]) => <article key={heading}><h2>{heading}</h2><p>{text}</p></article>)}<aside><strong>Need help with a specific order?</strong><Link className="button dark" to="/support">Contact merchant support</Link></aside></section></>
}
