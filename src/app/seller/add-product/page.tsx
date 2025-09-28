'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { Badge } from '../../../components/ui/badge'
import { 
  Package, 
  Upload,
  Plus,
  CheckCircle,
  AlertCircle,
  ImageIcon,
  Star,
  DollarSign,
  Tag,
  Truck,
  Info,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  FileText,
  Hash,
  Weight,
  Layers,
  Globe,
  Camera,
  Save,
  X,
  RefreshCw,
  Eye,
  ShoppingBag,
  Settings,
  BarChart3,
  Users,
  Heart
} from 'lucide-react'

interface FormData {
  name: string
  description: string
  price: string
  category: string
  condition: string
  brand: string
  model: string
  sku: string
  quantity: string
  weight: string
  dimensions: string
  color: string
  material: string
  tags: string
  imageUrl: string
  features: string
  warranty: string
  origin: string
}

interface ValidationState {
  name: boolean
  description: boolean
  price: boolean
  category: boolean
  imageUrl: boolean
  quantity: boolean
  brand: boolean
}

export default function AddProductPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    category: '',
    condition: 'New',
    brand: '',
    model: '',
    sku: '',
    quantity: '',
    weight: '',
    dimensions: '',
    color: '',
    material: '',
    tags: '',
    imageUrl: '',
    features: '',
    warranty: '',
    origin: ''
  })

  const [validations, setValidations] = useState<ValidationState>({
    name: false,
    description: false,
    price: false,
    category: false,
    imageUrl: false,
    quantity: false,
    brand: false
  })

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/auth/seller')
      return
    }
    
    if (user.role !== 'SELLER') {
      router.push('/')
      return
    }
  }, [user, router])

  const categories = [
    'Electronics', 'Clothing & Accessories', 'Home & Garden', 'Books & Education',
    'Sports & Fitness', 'Beauty & Personal Care', 'Food & Beverages', 'Toys & Games',
    'Automotive', 'Health & Wellness', 'Art & Crafts', 'Music & Instruments',
    'Pet Supplies', 'Office Supplies', 'Tools & Hardware', 'Travel & Luggage'
  ]

  const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor']

  // Enhanced validation functions
  const validateName = (name: string) => name.trim().length >= 3 && name.trim().length <= 100
  const validateDescription = (description: string) => description.trim().length >= 10 && description.trim().length <= 1000
  const validatePrice = (price: string) => {
    const numPrice = parseFloat(price)
    return !isNaN(numPrice) && numPrice > 0 && numPrice <= 999999
  }
  const validateCategory = (category: string) => categories.includes(category)
  const validateQuantity = (quantity: string) => {
    const numQuantity = parseInt(quantity)
    return !isNaN(numQuantity) && numQuantity >= 1 && numQuantity <= 999999
  }
  const validateBrand = (brand: string) => brand.trim().length >= 2 && brand.trim().length <= 50

  const validateImageUrl = (url: string) => {
    if (!url) return false
    
    // Check if it's a local upload path (starts with /uploads/)
    if (url.startsWith('/uploads/')) {
      return /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
    }
    
    // Check if it's a valid URL for external images
    try {
      new URL(url)
      return /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
    } catch {
      return false
    }
  }

  // Handle input changes with real-time validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const safeValue = value || '' // Ensure value is always a string
    setFormData(prev => ({ ...prev, [name]: safeValue }))
    
    // Real-time validation
    if (name === 'name') {
      setValidations(prev => ({ ...prev, name: validateName(safeValue) }))
    } else if (name === 'description') {
      setValidations(prev => ({ ...prev, description: validateDescription(safeValue) }))
    } else if (name === 'price') {
      setValidations(prev => ({ ...prev, price: validatePrice(safeValue) }))
    } else if (name === 'quantity') {
      setValidations(prev => ({ ...prev, quantity: validateQuantity(safeValue) }))
    } else if (name === 'brand') {
      setValidations(prev => ({ ...prev, brand: validateBrand(safeValue) }))
    } else if (name === 'imageUrl') {
      setValidations(prev => ({ ...prev, imageUrl: validateImageUrl(safeValue) }))
    }
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    const safeValue = value || '' // Ensure value is always a string
    setFormData(prev => ({ ...prev, [name]: safeValue }))
    if (name === 'category') {
      setValidations(prev => ({ ...prev, category: validateCategory(safeValue) }))
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    setUploading(true)
    setError('')

    const formDataUpload = new FormData()
    formDataUpload.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload
      })
      
      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, imageUrl: data.imageUrl }))
        setValidations(prev => ({ ...prev, imageUrl: true }))
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }
    } catch (error) {
      setError('Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    // Final validation
    const isValid = validateName(formData.name) &&
                   validateDescription(formData.description) &&
                   validatePrice(formData.price) &&
                   validateCategory(formData.category) &&
                   validateImageUrl(formData.imageUrl) &&
                   validateQuantity(formData.quantity) &&
                   validateBrand(formData.brand)

    if (!isValid) {
      setError('Please fill in all required fields correctly')
      setLoading(false)
      return
    }

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })

      if (response.ok) {
        setSuccess(true)
        // Reset form
        setFormData({
          name: '', description: '', price: '', category: '', condition: 'New',
          brand: '', model: '', sku: '', quantity: '', weight: '', dimensions: '',
          color: '', material: '', tags: '', imageUrl: '', features: '', warranty: '', origin: ''
        })
        setValidations({
          name: false, description: false, price: false, category: false, imageUrl: false, quantity: false, brand: false
        })
        
        // Redirect after success
        setTimeout(() => {
          router.push('/seller/dashboard')
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to add product')
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const getValidationIcon = (isValid: boolean) => {
    return isValid ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <AlertCircle className="w-5 h-5 text-red-500" />
    )
  }

  const allRequiredValid = validations.name && validations.description && 
                          validations.price && validations.category && validations.imageUrl &&
                          validations.quantity && validations.brand

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold text-gray-700">Loading...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center py-8 gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Plus className="w-8 h-8" />
                </div>
                <h1 className="text-4xl font-bold">Add New Product</h1>
                <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 mr-1" />
                  Creator
                </Badge>
              </div>
              <p className="text-emerald-100 text-lg">
                Create compelling product listings that attract customers and drive sales.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline" 
                className="border-2 border-white bg-white/10 text-white hover:bg-white hover:text-emerald-600 backdrop-blur-sm font-semibold transition-all duration-200 shadow-lg"
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye className="w-5 h-5 mr-2" />
                {previewMode ? 'Edit Mode' : 'Preview'}
              </Button>
              
              <Button 
                variant="outline" 
                className="border-2 border-white bg-white/10 text-white hover:bg-white hover:text-emerald-600 backdrop-blur-sm font-semibold transition-all duration-200 shadow-lg"
                onClick={() => router.push('/seller/dashboard')}
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                View Products
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {success && (
          <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 border-2 -mt-12 relative z-10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="text-xl font-semibold text-green-800">Product Added Successfully! 🎉</h3>
                  <p className="text-green-700">Your product has been added to your store. Redirecting to dashboard...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="mb-8 bg-gradient-to-r from-red-50 to-pink-50 border-red-200 border-2 -mt-12 relative z-10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-red-600" />
                <div>
                  <h3 className="text-xl font-semibold text-red-800">Error</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Indicator */}
        <Card className="mb-8 border-0 shadow-lg -mt-12 relative z-10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                Product Creation Progress
              </h3>
              <Badge className={`${allRequiredValid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {Object.values(validations).filter(Boolean).length}/7 Required Fields
              </Badge>
            </div>
            
            <div className="grid grid-cols-5 gap-2 mb-4">
              {Object.entries(validations).map(([field, isValid], index) => (
                <div
                  key={field}
                  className={`h-2 rounded-full transition-colors duration-300 ${
                    isValid ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {Object.entries(validations).map(([field, isValid]) => (
                <Badge
                  key={field}
                  variant="outline"
                  className={`${isValid ? 'border-green-300 text-green-700' : 'border-gray-300 text-gray-600'}`}
                >
                  {getValidationIcon(isValid)}
                  <span className="ml-1 capitalize">{field}</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Basic Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Product Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Package className="w-6 h-6 text-indigo-600" />
                  📝 Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Product Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Product Name *
                    {formData.name && getValidationIcon(validations.name)}
                  </label>
                  <Input
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    placeholder="Enter a compelling product name..."
                    maxLength={100}
                    className={`${validations.name ? 'border-green-300 focus:border-green-500' : 
                               formData.name ? 'border-red-300 focus:border-red-500' : 'border-gray-300'}`}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">
                      {formData.name.length}/100 characters
                    </span>
                    {formData.name && !validations.name && (
                      <span className="text-xs text-red-500">Must be 3-100 characters</span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <FileText className="w-4 h-4 text-purple-600" />
                    Product Description *
                    {formData.description && getValidationIcon(validations.description)}
                  </label>
                  <Textarea
                    name="description"
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    placeholder="Describe your product in detail. Include features, benefits, and specifications..."
                    rows={6}
                    maxLength={1000}
                    className={`${validations.description ? 'border-green-300 focus:border-green-500' : 
                               formData.description ? 'border-red-300 focus:border-red-500' : 'border-gray-300'}`}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">
                      {formData.description.length}/1000 characters
                    </span>
                    {formData.description && !validations.description && (
                      <span className="text-xs text-red-500">Must be 10-1000 characters</span>
                    )}
                  </div>
                </div>

                {/* Price and Category Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      Price (₹) *
                      {formData.price && getValidationIcon(validations.price)}
                    </label>
                    <Input
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      max="999999"
                      value={formData.price || ''}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className={`${validations.price ? 'border-green-300 focus:border-green-500' : 
                                 formData.price ? 'border-red-300 focus:border-red-500' : 'border-gray-300'}`}
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-2">
                      <Layers className="w-4 h-4 text-orange-600" />
                      Category *
                      {formData.category && getValidationIcon(validations.category)}
                    </label>
                    <select 
                      name="category"
                      value={formData.category || ''}
                      onChange={handleSelectChange}
                      aria-label="Select product category"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${validations.category ? 'border-green-300 focus:border-green-500 focus:ring-green-500' : 
                                                 formData.category ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'} bg-white text-gray-900`}
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Details */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Settings className="w-6 h-6 text-purple-600" />
                  🔧 Product Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-2">
                      <Star className="w-4 h-4 text-yellow-600" />
                      Condition
                    </label>
                    <select 
                      name="condition"
                      value={formData.condition || ''}
                      onChange={handleSelectChange}
                      aria-label="Select product condition"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                    >
                      {conditions.map(condition => (
                        <option key={condition} value={condition}>{condition}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-2">
                      <Tag className="w-4 h-4 text-blue-600" />
                      Brand *
                      {formData.brand && getValidationIcon(validations.brand)}
                    </label>
                    <Input
                      name="brand"
                      value={formData.brand || ''}
                      onChange={handleInputChange}
                      placeholder="Product brand"
                      required
                      className={`${validations.brand ? 'border-green-300 focus:border-green-500' : 
                                 formData.brand ? 'border-red-300 focus:border-red-500' : 'border-gray-300'}`}
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-2">
                      <Hash className="w-4 h-4 text-indigo-600" />
                      Model <span className="text-gray-500 text-xs">(Optional)</span>
                    </label>
                    <Input
                      name="model"
                      value={formData.model || ''}
                      onChange={handleInputChange}
                      placeholder="Product model"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-2">
                      <Package className="w-4 h-4 text-gray-600" />
                      SKU
                    </label>
                    <Input
                      name="sku"
                      value={formData.sku || ''}
                      onChange={handleInputChange}
                      placeholder="Stock keeping unit"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-2">
                      <Hash className="w-4 h-4 text-green-600" />
                      Quantity *
                      {formData.quantity && getValidationIcon(validations.quantity)}
                    </label>
                    <Input
                      name="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity || ''}
                      onChange={handleInputChange}
                      placeholder="Available quantity"
                      required
                      className={`${validations.quantity ? 'border-green-300 focus:border-green-500' : 
                                 formData.quantity ? 'border-red-300 focus:border-red-500' : 'border-gray-300'}`}
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-2">
                      <Weight className="w-4 h-4 text-red-600" />
                      Weight (kg)
                    </label>
                    <Input
                      name="weight"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.weight || ''}
                      onChange={handleInputChange}
                      placeholder="Product weight"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Tag className="w-4 h-4 text-pink-600" />
                    Tags
                  </label>
                  <Input
                    name="tags"
                    value={formData.tags || ''}
                    onChange={handleInputChange}
                    placeholder="Enter tags separated by commas (e.g., electronics, smartphone, android)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate multiple tags with commas. Tags help customers find your product.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Image Upload & Additional Info */}
          <div className="space-y-6">
            {/* Image Upload */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Camera className="w-6 h-6 text-pink-600" />
                  📸 Product Image
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* File Upload */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    Upload Image *
                    {formData.imageUrl && getValidationIcon(validations.imageUrl)}
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="imageUpload"
                      disabled={uploading}
                    />
                    <label htmlFor="imageUpload" className="cursor-pointer">
                      {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
                          <span className="text-sm text-gray-600">Uploading...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="w-12 h-12 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">Click to upload image</span>
                          <span className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* OR Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="text-sm text-gray-500 bg-white px-2">OR</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>

                {/* URL Input */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    Image URL
                  </label>
                  <Input
                    name="imageUrl"
                    value={formData.imageUrl || ''}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    className={`${validations.imageUrl ? 'border-green-300 focus:border-green-500' : 
                               formData.imageUrl ? 'border-red-300 focus:border-red-500' : 'border-gray-300'}`}
                  />
                </div>

                {/* Image Preview */}
                {formData.imageUrl && validations.imageUrl && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">Image Preview</label>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={formData.imageUrl}
                        alt="Product preview"
                        className="w-full h-48 object-cover"
                        onError={() => setValidations(prev => ({ ...prev, imageUrl: false }))}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Info className="w-6 h-6 text-cyan-600" />
                  ℹ️ Additional Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Features</label>
                  <Textarea
                    name="features"
                    value={formData.features || ''}
                    onChange={handleInputChange}
                    placeholder="List key features..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Warranty</label>
                  <Input
                    name="warranty"
                    value={formData.warranty || ''}
                    onChange={handleInputChange}
                    placeholder="e.g., 1 year manufacturer warranty"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Origin</label>
                  <Input
                    name="origin"
                    value={formData.origin || ''}
                    onChange={handleInputChange}
                    placeholder="Made in..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-50 to-teal-50">
              <CardContent className="p-6">
                <Button
                  type="submit"
                  disabled={loading || !allRequiredValid}
                  className={`w-full py-4 text-lg font-semibold ${
                    allRequiredValid 
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Creating Product...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-5 h-5" />
                      Add Product to Store
                    </div>
                  )}
                </Button>
                
                {!allRequiredValid && (
                  <p className="text-sm text-gray-600 text-center mt-2">
                    Complete all required fields to add your product
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  )
}
