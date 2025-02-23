'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'

export default function Login() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error)
      }

      toast.success('Login berhasil!')
      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="flex h-screen w-full items-center justify-center bg-gray-900 bg-cover bg-no-repeat" 
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1499123785106-343e69e68db1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1748&q=80')"
      }}
    >
      <div className="rounded-xl bg-gray-800 bg-opacity-50 px-16 py-10 shadow-lg backdrop-blur-md max-sm:px-8">
        <div className="text-white">
          <div className="mb-8 flex flex-col items-center">
            <Image 
              src="/images/logo-toko.jpeg" 
              width={150} 
              height={150} 
              alt="Logo" 
              className="mb-4 rounded-full border-4 border-yellow-400 shadow-lg"
            />
            <h1 className="mb-2 text-2xl font-bold">Warung Alinaldi</h1>
            <span className="text-gray-300">Masukkan detail login</span>
          </div>
          <form onSubmit={handleLogin}>
            <div className="mb-4 text-lg relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="text-gray-400" />
              </div>
              <input
                className="rounded-xl border-2 border-yellow-400 bg-gray-700 bg-opacity-50 pl-10 pr-4 py-2 w-full text-white placeholder-gray-300 shadow-lg outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 transition-all duration-300"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="mb-4 text-lg relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400" />
              </div>
              <input
                className="rounded-xl border-2 border-yellow-400 bg-gray-700 bg-opacity-50 pl-10 pr-12 py-2 w-full text-white placeholder-gray-300 shadow-lg outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 transition-all duration-300"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-yellow-400 transition-colors duration-300"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className="mt-8 flex justify-center text-lg">
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-yellow-400 px-10 py-2 text-white font-semibold shadow-xl transition-all duration-300 hover:bg-yellow-500 hover:scale-105 focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? 'Loading...' : 'Login'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}