import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

export function DebugAuth() {
  const { user, loading } = useAuth()
  const [supabaseStatus, setSupabaseStatus] = useState<string>('Checking...')
  const [allUsers, setAllUsers] = useState<any[]>([])

  useEffect(() => {
    // Test Supabase connection
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.from('users').select('count').limit(1)
        if (error) {
          setSupabaseStatus(`Error: ${error.message}`)
        } else {
          setSupabaseStatus('Connected')
        }
      } catch (error) {
        setSupabaseStatus(`Connection failed: ${error}`)
      }
    }

    // Fetch all users for debugging
    const fetchAllUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error('Error fetching users:', error)
        } else {
          setAllUsers(data || [])
        }
      } catch (error) {
        console.error('Error in fetchAllUsers:', error)
      }
    }

    testConnection()
    fetchAllUsers()
  }, [])

  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg text-sm max-w-xs max-h-96 overflow-y-auto">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div className="space-y-1">
        <div>Loading: {loading ? 'Yes' : 'No'}</div>
        <div>User: {user ? `${user.email} (${user.role})` : 'None'}</div>
        <div>Supabase: {supabaseStatus}</div>
        <div>Environment: {import.meta.env.DEV ? 'Development' : 'Production'}</div>
        
        <div className="mt-4 border-t border-gray-600 pt-2">
          <div className="font-semibold mb-1">Users in Database ({allUsers.length}):</div>
          {allUsers.map((u, index) => (
            <div key={u.id} className="text-xs text-gray-300 mb-1">
              {index + 1}. {u.email} ({u.role})
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 