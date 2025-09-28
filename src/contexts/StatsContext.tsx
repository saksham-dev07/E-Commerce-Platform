'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface StatsContextType {
  totalProducts: number
  totalSellers: number
  totalOrders: number
  loading: boolean
  refreshStats: () => void
}

const StatsContext = createContext<StatsContextType | undefined>(undefined)

export function StatsProvider({ children }: { children: React.ReactNode }) {
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalSellers, setTotalSellers] = useState(0)
  const [totalOrders, setTotalOrders] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const [productsRes, usersRes, ordersRes] = await Promise.all([
        fetch('/api/stats/products'),
        fetch('/api/stats/users'),
        fetch('/api/stats/orders')
      ])

      if (productsRes.ok) {
        const data = await productsRes.json()
        setTotalProducts(data.count || 0)
      }

      if (usersRes.ok) {
        const data = await usersRes.json()
        setTotalSellers(data.sellersCount || 0)
      }

      if (ordersRes.ok) {
        const data = await ordersRes.json()
        setTotalOrders(data.count || 0)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      // Set to 0 if there's an error
      setTotalProducts(0)
      setTotalSellers(0)
      setTotalOrders(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const refreshStats = () => {
    fetchStats()
  }

  return (
    <StatsContext.Provider value={{
      totalProducts,
      totalSellers,
      totalOrders,
      loading,
      refreshStats
    }}>
      {children}
    </StatsContext.Provider>
  )
}

export function useStats() {
  const context = useContext(StatsContext)
  if (context === undefined) {
    throw new Error('useStats must be used within a StatsProvider')
  }
  return context
}
