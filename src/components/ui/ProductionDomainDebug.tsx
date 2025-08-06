import React from 'react'
import { Card } from './Card'

export function ProductionDomainDebug() {
  const currentUrl = window.location.href
  const origin = window.location.origin
  const hostname = window.location.hostname
  const protocol = window.location.protocol
  const isHttps = protocol === 'https:'
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'
  const isNetlify = hostname.includes('netlify.app')
  const environment = import.meta.env.MODE

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center py-8">
      <Card className="p-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Production Domain Debug</h2>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Current URL:</strong></p>
              <p className="text-gray-600 break-all">{currentUrl}</p>
            </div>
            <div>
              <p><strong>Origin:</strong></p>
              <p className="text-gray-600">{origin}</p>
            </div>
            <div>
              <p><strong>Hostname:</strong></p>
              <p className="text-gray-600">{hostname}</p>
            </div>
            <div>
              <p><strong>Protocol:</strong></p>
              <p className="text-gray-600">{protocol}</p>
            </div>
            <div>
              <p><strong>Environment:</strong></p>
              <p className="text-gray-600">{environment}</p>
            </div>
            <div>
              <p><strong>Is HTTPS:</strong></p>
              <p className="text-gray-600">{isHttps ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p><strong>Is Localhost:</strong></p>
              <p className="text-gray-600">{isLocalhost ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p><strong>Is Netlify:</strong></p>
              <p className="text-gray-600">{isNetlify ? 'Yes' : 'No'}</p>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-blue-800 font-medium mb-2">Google OAuth Configuration Needed:</h3>
            <div className="text-blue-700 text-sm space-y-2">
              <p><strong>Add this redirect URI to Google Cloud Console:</strong></p>
              <code className="bg-blue-100 px-2 py-1 rounded text-xs block">
                {origin}/auth/callback
              </code>
                             <p className="mt-2"><strong>Add this to Supabase Authentication URL Configuration:</strong></p>
              <code className="bg-blue-100 px-2 py-1 rounded text-xs block">
                Site URL: {origin}
              </code>
              <code className="bg-blue-100 px-2 py-1 rounded text-xs block">
                Redirect URLs: {origin}/auth/callback
              </code>
            </div>
          </div>
          
          {!isHttps && !isLocalhost && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-red-800 font-medium mb-2">⚠️ Warning:</h3>
              <p className="text-red-700 text-sm">
                Your site is not using HTTPS. Google OAuth requires HTTPS for production sites.
              </p>
            </div>
          )}
          
          {isLocalhost && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-green-800 font-medium mb-2">✅ Local Development:</h3>
              <p className="text-green-700 text-sm">
                You're running in localhost. Google OAuth should work here if configured properly.
              </p>
            </div>
          )}
          
          {isNetlify && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="text-purple-800 font-medium mb-2">🌐 Netlify Detected:</h3>
              <p className="text-purple-700 text-sm">
                You're on Netlify. Make sure your environment variables are set in Netlify dashboard.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
} 