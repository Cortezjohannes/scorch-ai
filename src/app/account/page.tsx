'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useFirebase } from '@/context/FirebaseContext'
import { useRouter } from 'next/navigation'
import { 
  UserCircle, 
  Mail, 
  LogOut, 
  Cloud, 
  Database, 
  CloudOff, 
  Loader2,
  Shield
} from 'lucide-react'

export default function AccountPage() {
  const { isAuthenticated, signOut, user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  const handleLogout = async () => {
    setIsLoading(true)
    
    try {
      // Sign out from Firebase first
      if (user) {
        await signOut()
      }
      
      // Then from our legacy auth system
      // await logout() // This line was removed as per the new_code, as the logout function is no longer directly available.
      
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center" style={{ fontFamily: 'League Spartan, sans-serif' }}>
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-16 h-16 ember-shadow rounded-xl flex items-center justify-center mx-auto mb-6 animate-emberFloat"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span className="text-4xl">🔥</span>
          </motion.div>
          <motion.div 
            className="w-12 h-12 border-4 border-t-[#00FF99] border-r-[#00FF9950] border-b-[#00FF9930] border-l-[#00FF9920] rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-white/90 text-lg elegant-fire">Loading your empire...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div 
      className="px-4 py-8 md:p-8 max-w-4xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      style={{ fontFamily: 'League Spartan, sans-serif' }}
    >
      {/* Revolutionary Header */}
      <motion.div 
        className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <div className="text-center md:text-left">
          {/* Fire Icon */}
          <motion.div
            className="w-16 h-16 ember-shadow rounded-xl flex items-center justify-center mx-auto md:mx-0 mb-4 animate-emberFloat"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span className="text-4xl">👑</span>
          </motion.div>
          
          {/* Revolutionary Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black elegant-fire fire-gradient animate-flameFlicker mb-2">
            EMPIRE COMMAND CENTER
          </h1>
          <p className="text-white/80 text-lg elegant-fire">
            Manage your <span className="text-[#00FF99] font-bold">production workspace</span>
          </p>
        </div>
        
        {/* Revolutionary Logout Button */}
        <motion.button
          onClick={handleLogout}
          disabled={isLoading}
          className="px-6 py-3 bg-gradient-to-r from-[#00FF99] to-[#00CC7A] text-black font-bold rounded-xl flex items-center space-x-2 transition-all disabled:opacity-50 hover:shadow-lg"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="elegant-fire">SIGNING OUT...</span>
            </>
          ) : (
            <>
              <LogOut className="h-5 w-5" />
              <span className="elegant-fire">Log Out</span>
            </>
          )}
        </motion.button>
      </motion.div>
      
      <div className="space-y-8">
        {/* Revolutionary Profile Information */}
        <motion.div 
          className="rebellious-card p-8 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#00FF99]/10 via-transparent to-[#00CC7A]/10 opacity-50"></div>
          
          <div className="relative z-10">
            <h2 className="text-2xl font-black text-[#00FF99] mb-6 flex items-center elegant-fire">
              <UserCircle className="h-8 w-8 mr-3 text-[#00FF99]" />
              Account
            </h2>
            
            <div className="space-y-6">
              <motion.div 
                className="flex flex-col md:flex-row md:items-center p-4 bg-gradient-to-r from-[#00FF99]/10 to-[#00CC7A]/10 border border-[#00FF99]/30 rounded-xl"
                whileHover={{ scale: 1.02 }}
              >
                <span className="text-[#00FF99] font-bold w-32 elegant-fire">Email</span>
                <div className="flex items-center mt-2 md:mt-0">
                  <Mail className="h-5 w-5 text-[#00FF99] mr-3" />
                  <span className="text-white/90 elegant-fire">{user.email}</span>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex flex-col md:flex-row md:items-center p-4 bg-gradient-to-r from-[#00FF99]/10 to-[#00CC7A]/10 border border-[#00FF99]/30 rounded-xl"
                whileHover={{ scale: 1.02 }}
              >
                <span className="text-[#00FF99] font-bold w-32 elegant-fire">User ID</span>
                <span className="font-mono text-sm text-white bg-gradient-to-r from-[#00FF99]/20 to-[#00CC7A]/20 px-3 py-2 rounded-lg mt-2 md:mt-0 border border-[#00FF99]/40">
                {user.id}
              </span>
              </motion.div>
            
            {user.displayName && (
                <motion.div 
                  className="flex flex-col md:flex-row md:items-center p-4 bg-gradient-to-r from-[#00FF99]/10 to-[#00CC7A]/10 border border-[#00FF99]/30 rounded-xl"
                  whileHover={{ scale: 1.02 }}
                >
                  <span className="text-[#00FF99] font-bold w-32 elegant-fire">Display Name</span>
                  <span className="text-white/90 mt-2 md:mt-0 elegant-fire">{user.displayName}</span>
                </motion.div>
            )}
          </div>
        </div>
        </motion.div>
        
        
        {/* Revolutionary Cloud Fortress */}
        <motion.div 
          className="rebellious-card p-8 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#00FF99]/10 via-transparent to-[#00CC7A]/10 opacity-50"></div>
          
          <div className="relative z-10">
            <h2 className="text-2xl font-black text-[#00FF99] mb-6 flex items-center elegant-fire">
              <Cloud className="h-8 w-8 mr-3 text-[#00FF99]" />
              Cloud Status
            </h2>
            
            <motion.div 
              className="flex items-center mb-6 p-4 bg-gradient-to-r from-[#228B22]/20 to-[#32CD32]/20 border border-[#32CD32]/40 rounded-xl"
              whileHover={{ scale: 1.02 }}
            >
              <div className="h-4 w-4 rounded-full bg-[#32CD32] mr-3 animate-pulse"></div>
              <span className="text-[#32CD32] font-bold elegant-fire">🔗 SECURED CONNECTION TO FIREBASE</span>
            </motion.div>
            
            <p className="text-white/90 mb-8 text-lg elegant-fire">
              Your <span className="text-[#00FF99] font-bold">project data</span> is securely stored in Google Cloud and synchronized across devices.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                className="bg-gradient-to-br from-[#00FF99]/10 to-[#00CC7A]/10 border border-[#00FF99]/40 rounded-xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden"
                whileHover={{ scale: 1.05, y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <Database className="h-12 w-12 text-[#00FF99] mb-4" />
                <h3 className="font-black text-white mb-2 elegant-fire">🏛️ PROJECTS</h3>
                <p className="text-white/70 text-sm elegant-fire">Empire Archives</p>
              </motion.div>
              
              <motion.div 
                className="bg-gradient-to-br from-[#00FF99]/10 to-[#00CC7A]/10 border border-[#00FF99]/40 rounded-xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden"
                whileHover={{ scale: 1.05, y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
              >
                <Shield className="h-12 w-12 text-[#00FF99] mb-4" />
                <h3 className="font-black text-white mb-2 elegant-fire">🛡️ SECURITY</h3>
                <p className="text-white/70 text-sm elegant-fire">Imperial Guard</p>
              </motion.div>
              
              <motion.div 
                className="bg-gradient-to-br from-[#D62828]/20 to-[#FF6B00]/20 border border-[#e2c376]/40 rounded-xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden"
                whileHover={{ scale: 1.05, y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
              >
                <CloudOff className="h-12 w-12 text-[#FF6B00] mb-4" />
                <h3 className="font-black text-white mb-2 elegant-fire">⚡ OFFLINE</h3>
                <p className="text-[#FF6B00]/80 text-sm elegant-fire">Coming Soon</p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
} 