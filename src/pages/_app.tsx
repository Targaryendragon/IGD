import React, { ErrorInfo } from 'react'
import { AppProps } from 'next/app'
import '../app/globals.css'

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('全局错误捕获:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">系统错误</h2>
            <p className="text-gray-700 mb-4">
              抱歉，网站发生了错误。请尝试刷新页面或稍后再试。
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              重试
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <Component {...pageProps} />
    </ErrorBoundary>
  )
}

export default MyApp 