import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from './Button'
import { Card } from './Card'

export function ProductionOAuthDebug() {
  const { signInWithGoogle, error, loading } = useAuth()
  const [debugInfo, setDebugInfo] = useState<any>({})

  const handleGoogleSignIn = async () => {
    try {
      console.log('=== PRODUCTION GOOGLE OAUTH DEBUG ===')
      console.log('Current URL:', window.location.href)
      console.log('Origin:', window.location.origin)
      console.log('Protocol:', window.location.protocol)
      console.log('Hostname:', window.location.hostname)
      console.log('Environment:', import.meta.env.MODE)
      console.log('Is HTTPS:', window.location.protocol === 'https:')
      
      setDebugInfo({
        currentUrl: window.location.href,
        origin: window.location.origin,
        protocol: window.location.protocol,
        hostname: window.location.hostname,
        environment: import.meta.env.MODE,
        isHttps: window.location.protocol === 'https:',
        timestamp: new Date().toISOString()
      })
      
      await signInWithGoogle()
    } catch (err) {
      console.error('Production Google OAuth debug error:', err)
      setDebugInfo(prev => ({ ...prev, error: err }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center py-8">
      <Card className="p-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Production Google OAuth Debug</h2>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Current URL:</strong></p>
              <p className="text-gray-600 break-all">{window.location.href}</p>
            </div>
            <div>
              <p><strong>Origin:</strong></p>
              <p className="text-gray-600">{window.location.origin}</p>
            </div>
            <div>
              <p><strong>Protocol:</strong></p>
              <p className="text-gray-600">{window.location.protocol}</p>
            </div>
            <div>
              <p><strong>Hostname:</strong></p>
              <p className="text-gray-600">{window.location.hostname}</p>
            </div>
            <div>
              <p><strong>Environment:</strong></p>
              <p className="text-gray-600">{import.meta.env.MODE}</p>
            </div>
            <div>
              <p><strong>Is HTTPS:</strong></p>
              <p className="text-gray-600">{window.location.protocol === 'https:' ? 'Yes' : 'No'}</p>
            </div>
          </div>
          
          <Button 
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Testing Production Google OAuth...' : 'Test Production Google OAuth'}
          </Button>
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">Error:</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          
          {Object.keys(debugInfo).length > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 font-medium">Debug Info:</p>
              <pre className="text-blue-600 text-xs mt-2 overflow-auto max-h-64">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-yellow-800 font-medium mb-2">Configuration Checklist:</h3>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>✓ Google Cloud Console: Add redirect URI for your production domain</li>
              <li>✓ Supabase: Update Site URL to production domain</li>
              <li>✓ Supabase: Add production callback URL to redirect URLs</li>
              <li>✓ Ensure HTTPS is enabled (required for production OAuth)</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
} 