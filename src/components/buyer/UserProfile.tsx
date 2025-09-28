'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { 
  User, 
  Camera, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  Globe, 
  Edit3, 
  Save, 
  X, 
  Plus,
  Trash2,
  Star,
  Award,
  ShoppingBag,
  Clock,
  FileText,
  Settings
} from 'lucide-react'
import { useState, useEffect } from 'react'

interface UserProfileProps {
  user: any
  profile: any
  setProfile: (profile: any) => void
  editingProfile: boolean
  setEditingProfile: (editing: boolean) => void
  profileLoading: boolean
  saveProfile: () => Promise<void>
  indianStates: string[]
}

export default function UserProfile({ 
  user, 
  profile, 
  setProfile, 
  editingProfile, 
  setEditingProfile, 
  profileLoading, 
  saveProfile, 
  indianStates 
}: UserProfileProps) {
  const [activeProfileTab, setActiveProfileTab] = useState('personal')
  const [addresses, setAddresses] = useState<any[]>([])
  const [newAddress, setNewAddress] = useState({
    title: '',
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    isDefault: false
  })
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [profileImageUploading, setProfileImageUploading] = useState(false)

  // Load addresses when component mounts
  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/addresses', {
        credentials: 'include' // Include authentication cookies
      })
      if (response.ok) {
        const data = await response.json()
        setAddresses(data.addresses || [])
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
    }
  }

  useEffect(() => {
    fetchAddresses()
  }, [])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setProfileImageUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'profile')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setProfile((prev: any) => ({ ...prev, profileImage: data.url }))
      }
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setProfileImageUploading(false)
    }
  }

  const addAddress = async () => {
    try {
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include authentication cookies
        body: JSON.stringify(newAddress)
      })
      if (response.ok) {
        const address = await response.json()
        setAddresses(prev => [...prev, address])
        setNewAddress({
          title: '',
          fullName: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'India',
          isDefault: false
        })
        setShowAddAddress(false)
        await fetchAddresses() // Refresh the list
      }
    } catch (error) {
      console.error('Error adding address:', error)
    }
  }

  const deleteAddress = async (addressId: string) => {
    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: 'DELETE',
        credentials: 'include' // Include authentication cookies
      })
      if (response.ok) {
        setAddresses(prev => prev.filter(addr => addr.id !== addressId))
        await fetchAddresses() // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting address:', error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Profile
          </CardTitle>
          <CardDescription>Manage your personal information and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeProfileTab} onValueChange={setActiveProfileTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6 mt-6">
              {/* Profile Image Section */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                    {profile.profileImage ? (
                      <img 
                        src={profile.profileImage} 
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      profile.name?.charAt(0) || user?.email?.charAt(0) || 'U'
                    )}
                  </div>
                  <label htmlFor="profile-image" className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <Camera className="h-4 w-4 text-gray-600" />
                    <input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      aria-label="Upload profile image"
                    />
                  </label>
                </div>
                {profileImageUploading && (
                  <div className="text-sm text-gray-500">Uploading image...</div>
                )}
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      value={profile.name || ''}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      disabled={!editingProfile}
                      className="pl-10"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={profile.email || ''}
                      disabled
                      className="pl-10 bg-gray-50"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.phone || ''}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      disabled={!editingProfile}
                      className="pl-10"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={profile.dateOfBirth || ''}
                      onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                      disabled={!editingProfile}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    aria-label="Gender selection"
                    value={profile.gender || ''}
                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                    disabled={!editingProfile}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredLanguage">Preferred Language</Label>
                  <select
                    id="preferredLanguage"
                    aria-label="Preferred language selection"
                    value={profile.preferredLanguage || 'English'}
                    onChange={(e) => setProfile({ ...profile, preferredLanguage: e.target.value })}
                    disabled={!editingProfile}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Bengali">Bengali</option>
                    <option value="Marathi">Marathi</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  disabled={!editingProfile}
                  className="h-20"
                  placeholder="Tell us a little about yourself..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                {editingProfile ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setEditingProfile(false)}
                      disabled={profileLoading}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={saveProfile}
                      disabled={profileLoading}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {profileLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setEditingProfile(true)}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="addresses" className="space-y-6 mt-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Saved Addresses</h3>
                <Button onClick={() => setShowAddAddress(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Address
                </Button>
              </div>

              {/* Address List */}
              <div className="grid gap-4">
                {addresses.map((address) => (
                  <Card key={address.id} className="relative">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={address.isDefault ? "default" : "outline"}>
                              {address.title}
                            </Badge>
                            {address.isDefault && (
                              <Badge variant="secondary">Default</Badge>
                            )}
                          </div>
                          <div className="text-sm space-y-1">
                            <p className="font-semibold">{address.fullName}</p>
                            <p>{address.address}</p>
                            <p>{address.city}, {address.state} {address.zipCode}</p>
                            <p>{address.phone}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteAddress(address.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Add Address Form */}
              {showAddAddress && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Add New Address</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Address Title</Label>
                        <Input
                          value={newAddress.title}
                          onChange={(e) => setNewAddress({...newAddress, title: e.target.value})}
                          placeholder="Home, Office, etc."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input
                          value={newAddress.fullName}
                          onChange={(e) => setNewAddress({...newAddress, fullName: e.target.value})}
                          placeholder="Recipient name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>City</Label>
                        <Input
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                          placeholder="City name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="addressState">State</Label>
                        <select
                          id="addressState"
                          aria-label="State selection"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select State</option>
                          {indianStates.map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>ZIP Code</Label>
                        <Input
                          value={newAddress.zipCode}
                          onChange={(e) => setNewAddress({...newAddress, zipCode: e.target.value})}
                          placeholder="123456"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Complete Address</Label>
                      <Textarea
                        value={newAddress.address}
                        onChange={(e) => setNewAddress({...newAddress, address: e.target.value})}
                        placeholder="House/Flat number, Street, Landmark..."
                        className="h-20"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={newAddress.isDefault}
                        onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})}
                        className="rounded"
                        aria-label="Set as default address"
                      />
                      <Label htmlFor="isDefault">Set as default address</Label>
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={addAddress}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Address
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddAddress(false)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6 mt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Email Notifications</h4>
                        <p className="text-sm text-gray-500">Receive order updates and important information via email</p>
                      </div>
                      <label htmlFor="emailNotifications" className="cursor-pointer">
                        <input
                          id="emailNotifications"
                          type="checkbox"
                          checked={profile.emailNotifications}
                          onChange={(e) => setProfile({...profile, emailNotifications: e.target.checked})}
                          className="rounded"
                          aria-label="Enable email notifications"
                        />
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">SMS Notifications</h4>
                        <p className="text-sm text-gray-500">Get SMS alerts for order status updates</p>
                      </div>
                      <label htmlFor="smsNotifications" className="cursor-pointer">
                        <input
                          id="smsNotifications"
                          type="checkbox"
                          checked={profile.smsNotifications}
                          onChange={(e) => setProfile({...profile, smsNotifications: e.target.checked})}
                          className="rounded"
                          aria-label="Enable SMS notifications"
                        />
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Marketing Emails</h4>
                        <p className="text-sm text-gray-500">Receive promotional offers and deals</p>
                      </div>
                      <label htmlFor="marketingEmails" className="cursor-pointer">
                        <input
                          id="marketingEmails"
                          type="checkbox"
                          checked={profile.marketingEmails}
                          onChange={(e) => setProfile({...profile, marketingEmails: e.target.checked})}
                          className="rounded"
                          aria-label="Enable marketing emails"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Profile Visibility</h4>
                        <p className="text-sm text-gray-500">Make your profile visible to other users</p>
                      </div>
                      <label htmlFor="profileVisibility" className="cursor-pointer">
                        <input
                          id="profileVisibility"
                          type="checkbox"
                          defaultChecked={true}
                          className="rounded"
                          aria-label="Enable profile visibility"
                        />
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Activity Status</h4>
                        <p className="text-sm text-gray-500">Show when you're online</p>
                      </div>
                      <label htmlFor="activityStatus" className="cursor-pointer">
                        <input
                          id="activityStatus"
                          type="checkbox"
                          defaultChecked={false}
                          className="rounded"
                          aria-label="Show activity status"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <ShoppingBag className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="text-2xl font-bold text-blue-600">
                      {profile.orders?.length || 0}
                    </h3>
                    <p className="text-sm text-gray-500">Total Orders</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <h3 className="text-2xl font-bold text-yellow-600">-</h3>
                    <p className="text-sm text-gray-500">Average Rating</p>
                    <p className="text-xs text-gray-400 mt-1">No reviews yet</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h3 className="text-2xl font-bold text-green-600">New</h3>
                    <p className="text-sm text-gray-500">Membership Status</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-lg">No recent activity</p>
                    <p className="text-sm text-gray-400 mt-1">Your activity will appear here as you use the platform</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
