import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from './Button'
import { Card } from './Card'

export function GoogleOAuthDebug() {
  const { signInWithGoogle, error, loading } = useAuth()
  const [debugInfo, setDebugInfo] = useState<any>({})

  const handleGoogleSignIn = async () => {
    try {
      console.log('Starting Google OAuth debug...')
      console.log('Current URL:', window.location.href)
      console.log('Origin:', window.location.origin)
      console.log('Environment:', import.meta.env.MODE)
      
      setDebugInfo({
        currentUrl: window.location.href,
        origin: window.location.origin,
        environment: import.meta.env.MODE,
        timestamp: new Date().toISOString()
      })
      
      await signInWithGoogle()
    } catch (err) {
      console.error('Google OAuth debug error:', err)
      setDebugInfo(prev => ({ ...prev, error: err }))
    }
  }

  return (
    <Card className="p-6 max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4">Google OAuth Debug</h3>
      
      <div className="space-y-4">
        <Button 
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Testing Google OAuth...' : 'Test Google OAuth'}
        </Button>
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">Error:</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        
        {Object.keys(debugInfo).length > 0 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 font-medium">Debug Info:</p>
            <pre className="text-blue-600 text-xs mt-2 overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="text-sm text-gray-600">
          <p><strong>Current URL:</strong> {window.location.href}</p>
          <p><strong>Origin:</strong> {window.location.origin}</p>
          <p><strong>Environment:</strong> {import.meta.env.MODE}</p>
        </div>
      </div>
    </Card>
  )
} 