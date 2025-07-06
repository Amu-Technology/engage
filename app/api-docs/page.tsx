// app/api-docs/page.tsx
'use client'
import { RedocStandalone } from 'redoc'

export default function ApiDocsPage() {
  return (
    <div style={{ height: '100vh' }}>
      <RedocStandalone
        specUrl="/openapi.json"
        options={{
          nativeScrollbars: true,
          theme: { colors: { primary: { main: '#1976d2' } } }
        }}
      />
    </div>
  )
}