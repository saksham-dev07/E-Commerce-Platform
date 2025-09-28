import Link from 'next/link'
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">E</span>
              </div>
              <span className="text-2xl font-bold">E-Commerce</span>
            </Link>
            <p className="text-gray-300 max-w-md mb-6 leading-relaxed">
              Your one-stop destination for quality products from trusted sellers. 
              Shop with confidence and enjoy a seamless shopping experience with fast delivery and excellent customer service.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-300">
                <Mail className="w-5 h-5" />
                <span>support@ecommerce.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Phone className="w-5 h-5" />
                <span>+91  123-4567-890</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <MapPin className="w-5 h-5" />
                <span>123 </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center hover:translate-x-1">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center hover:translate-x-1">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center hover:translate-x-1">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center hover:translate-x-1">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center hover:translate-x-1">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center hover:translate-x-1">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-white">Categories</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/category/electronics" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center hover:translate-x-1">
                  Electronics
                </Link>
              </li>
              <li>
                <Link href="/category/fashion" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center hover:translate-x-1">
                  Fashion
                </Link>
              </li>
              <li>
                <Link href="/category/home" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center hover:translate-x-1">
                  Home & Garden
                </Link>
              </li>
              <li>
                <Link href="/category/health" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center hover:translate-x-1">
                  Health & Beauty
                </Link>
              </li>
              <li>
                <Link href="/category/sports" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center hover:translate-x-1">
                  Sports
                </Link>
              </li>
              <li>
                <Link href="/category/books" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center hover:translate-x-1">
                  Books
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media & Bottom Bar */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6 mb-4 md:mb-0">
              <Link href="#" className="text-gray-300 hover:text-white transition-colors duration-200 hover:scale-110">
                <Facebook className="w-6 h-6" />
              </Link>
              <Link href="#" className="text-gray-300 hover:text-white transition-colors duration-200 hover:scale-110">
                <Twitter className="w-6 h-6" />
              </Link>
              <Link href="#" className="text-gray-300 hover:text-white transition-colors duration-200 hover:scale-110">
                <Instagram className="w-6 h-6" />
              </Link>
            </div>
            <p className="text-gray-300 text-center">
              © {new Date().getFullYear()} E-Commerce. All rights reserved. Made with ❤️ for amazing customers.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
