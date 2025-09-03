'use client'

// Global error handler for unhandled promise rejections and global errors
export function setupGlobalErrorHandlers() {
  if (typeof window !== 'undefined') {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason)
      
      // Prevent the default handler from running
      event.preventDefault()
      
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Promise rejection details:', {
          promise: event.promise,
          reason: event.reason,
          stack: event.reason?.stack
        })
      }
      
      // You could send this to an error tracking service in production
      // Example: Sentry.captureException(event.reason)
    })

    // Handle global errors
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error)
      
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error details:', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error
        })
      }
    })
  }
}