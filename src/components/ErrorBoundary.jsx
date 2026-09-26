import { Component } from 'react'
import { reportClientError } from '../services/errorReporting'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    reportClientError(error, 'react-render')
  }

  render() {
    if (this.state.hasError) {
      return <main className="container admin-denied"><h1>Something went wrong.</h1><p>The error was reported. Reload the page to try again.</p><button type="button" className="button dark" onClick={() => window.location.reload()}>Reload page</button></main>
    }
    return this.props.children
  }
}