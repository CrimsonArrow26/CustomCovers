import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Card } from '../../components/ui/Card'
import toast from 'react-hot-toast'

export function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          toast.error('Authentication failed')
          navigate('/login')
          return
        }

        if (data.session?.user) {
          // Check if user exists in our users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.session.user.id)
            .single()

          if (userError && userError.code !== 'PGRST116') {
            // User doesn't exist in our table, create them
            const { error: insertError } = await supabase
              .from('users')
              .insert([
                {
                  id: data.session.user.id,
                  email: data.session.user.email!,
                  full_name: data.session.user.user_metadata?.full_name || data.session.user.email?.split('@')[0] || 'User',
                  role: 'user'
                }
              ])

            if (insertError) {
              console.error('Error creating user record:', insertError)
            }
          }

          toast.success('Successfully signed in!')
          navigate('/')
        } else {
          navigate('/login')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        toast.error('Authentication failed')
        navigate('/login')
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center">
      <Card className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Completing Sign In</h2>
        <p className="text-gray-600">Please wait while we complete your authentication...</p>
      </Card>
    </div>
  )
} 