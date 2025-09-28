'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Label } from '../../../components/ui/label'
import { Mail, Lock, User, ShoppingBag, AlertCircle, Eye, EyeOff, Check, X } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'

export default function BuyerAuth() {
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
  const router = useRouter()

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
        setError('Please enter a valid name (at least 2 characters)')
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
        const success = await login(formData.email, formData.password, 'BUYER')
        if (success) {
          // Use hard redirect to avoid React router interference
          window.location.replace('/')
        } else {
          setError('Invalid email or password')
        }
      } else {
        const success = await register(formData.email, formData.password, formData.name, 'BUYER')
        if (success) {
          // Use hard redirect to avoid React router interference
          window.location.replace('/')
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
          <ShoppingBag className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Sign in to your account' : 'Create your buyer account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-medium text-primary hover:text-primary/80"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isLogin ? 'Welcome Back' : 'Join Us'}</CardTitle>
            <CardDescription>
              {isLogin 
                ? 'Enter your credentials to access your account' 
                : 'Create an account to start shopping'
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
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="name"
                      type="text"
                      name="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`pl-10 ${validations.name ? 'border-green-500' : formData.name ? 'border-red-500' : ''}`}
                      required={!isLogin}
                    />
                    {formData.name && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {validations.name ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <X className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {formData.name && !validations.name && (
                    <p className="text-sm text-red-600">Name must be at least 2 characters long</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`pl-10 ${validations.email ? 'border-green-500' : formData.email ? 'border-red-500' : ''}`}
                    required
                  />
                  {formData.email && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {validations.email ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {formData.email && !validations.email && (
                  <p className="text-sm text-red-600">Please enter a valid email address</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`pl-10 pr-10 ${validations.password ? 'border-green-500' : formData.password ? 'border-red-500' : ''}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {!isLogin && (
                  <div className="text-sm text-gray-600">
                    <p>Password must contain:</p>
                    <ul className="mt-1 space-y-1">
                      <li className={`flex items-center ${formData.password.length >= 8 ? 'text-green-600' : 'text-red-600'}`}>
                        {formData.password.length >= 8 ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                        At least 8 characters
                      </li>
                      <li className={`flex items-center ${/(?=.*[a-z])/.test(formData.password) ? 'text-green-600' : 'text-red-600'}`}>
                        {/(?=.*[a-z])/.test(formData.password) ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                        One lowercase letter
                      </li>
                      <li className={`flex items-center ${/(?=.*[A-Z])/.test(formData.password) ? 'text-green-600' : 'text-red-600'}`}>
                        {/(?=.*[A-Z])/.test(formData.password) ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                        One uppercase letter
                      </li>
                      <li className={`flex items-center ${/(?=.*\d)/.test(formData.password) ? 'text-green-600' : 'text-red-600'}`}>
                        {/(?=.*\d)/.test(formData.password) ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                        One number
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`pl-10 pr-10 ${validations.passwordMatch && formData.confirmPassword ? 'border-green-500' : formData.confirmPassword ? 'border-red-500' : ''}`}
                      required={!isLogin}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {formData.confirmPassword && !validations.passwordMatch && (
                    <p className="text-sm text-red-600">Passwords do not match</p>
                  )}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || (isLogin ? false : (!validations.name || !validations.email || !validations.password || !validations.passwordMatch))}
              >
                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
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
                  <span className="px-2 bg-white text-gray-500">Want to sell?</span>
                </div>
              </div>
              <div className="mt-4">
                <Link href="/auth/seller">
                  <Button variant="outline" className="w-full">
                    Register as Seller
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
