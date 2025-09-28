'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Label } from '../../../components/ui/label'
import { Mail, Lock, User, Store, AlertCircle, Eye, EyeOff, Check, X } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'

export default function SellerAuth() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [validations, setValidations] = useState({
    email: false,
    password: false,
    passwordMatch: false,
    name: false
  })

  const { login, register } = useAuth()

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Password validation
  const validatePassword = (password: string) => {
    return password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)
  }

  // Handle input changes with validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Real-time validation
    if (name === 'email') {
      setValidations(prev => ({ ...prev, email: validateEmail(value) }))
    } else if (name === 'password') {
      setValidations(prev => ({ 
        ...prev, 
        password: validatePassword(value),
        passwordMatch: !isLogin ? value === formData.confirmPassword : true
      }))
    } else if (name === 'confirmPassword') {
      setValidations(prev => ({ ...prev, passwordMatch: value === formData.password }))
    } else if (name === 'name') {
      setValidations(prev => ({ ...prev, name: value.trim().length >= 2 }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate form before submission
    if (!isLogin) {
      if (!validations.name) {
        setError('Please enter a valid business/store name (at least 2 characters)')
        setLoading(false)
        return
      }
      if (!validations.email) {
        setError('Please enter a valid email address')
        setLoading(false)
        return
      }
      if (!validations.password) {
        setError('Password must be at least 8 characters with uppercase, lowercase, and number')
        setLoading(false)
        return
      }
      if (!validations.passwordMatch) {
        setError('Passwords do not match')
        setLoading(false)
        return
      }
    } else {
      if (!validateEmail(formData.email)) {
        setError('Please enter a valid email address')
        setLoading(false)
        return
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters')
        setLoading(false)
        return
      }
    }

    try {
      if (isLogin) {
        const success = await login(formData.email, formData.password, 'SELLER')
        if (success) {
          // Use window.location.replace to immediately navigate without React router interference
          window.location.replace('/seller')
          return // Prevent further execution
        } else {
          setError('Invalid email or password')
        }
      } else {
        const success = await register(formData.email, formData.password, formData.name, 'SELLER')
        if (success) {
          // Use window.location.replace to immediately navigate without React router interference
          window.location.replace('/seller')
          return // Prevent further execution
        } else {
          setError('Registration failed. Email may already be in use.')
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Store className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Seller Portal' : 'Start Selling Today'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin ? "Don't have a seller account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-medium text-primary hover:text-primary/80"
            >
              {isLogin ? 'Register' : 'Sign in'}
            </button>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isLogin ? 'Welcome Back' : 'Join Our Marketplace'}</CardTitle>
            <CardDescription>
              {isLogin 
                ? 'Access your seller dashboard' 
                : 'Create your seller account and start earning'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="pl-10"
                      required={!isLogin}
                    />
                  </div>
                </>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>

              {!isLogin && (
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10"
                    required={!isLogin}
                  />
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Seller Account')}
              </Button>
            </form>

            {isLogin && (
              <div className="mt-4 text-center">
                <Link href="/auth/forgot-password" className="text-sm text-primary hover:text-primary/80">
                  Forgot your password?
                </Link>
              </div>
            )}

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Want to shop?</span>
                </div>
              </div>
              <div className="mt-4">
                <Link href="/auth/buyer">
                  <Button variant="outline" className="w-full">
                    Shop as Buyer
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
