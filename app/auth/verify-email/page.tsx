"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Mail, ArrowLeft, RefreshCw } from "lucide-react"

export default function VerifyEmailPage() {
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error' | 'expired'>('pending')
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    if (token) {
      verifyEmail(token)
    } else {
      setVerificationStatus('error')
    }
  }, [token])

  const verifyEmail = async (verificationToken: string) => {
    try {
      // In a real app, this would call the Better Auth verification endpoint
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      })

      if (response.ok) {
        setVerificationStatus('success')
        // Auto-redirect to sign-in after 3 seconds
        setTimeout(() => {
          router.push('/auth/signin?message=Email verified successfully')
        }, 3000)
      } else {
        const data = await response.json()
        if (data.error === 'expired') {
          setVerificationStatus('expired')
        } else {
          setVerificationStatus('error')
        }
      }
    } catch (error) {
      console.error('Email verification error:', error)
      setVerificationStatus('error')
    }
  }

  const handleResendVerification = async () => {
    if (!email) {
      setResendMessage('Email address not found. Please sign up again.')
      return
    }

    setIsResending(true)
    setResendMessage('')

    try {
      // In a real app, this would call the Better Auth resend verification endpoint
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setResendMessage('Verification email sent! Please check your inbox.')
      } else {
        setResendMessage('Failed to resend verification email. Please try again.')
      }
    } catch (error) {
      console.error('Resend verification error:', error)
      setResendMessage('Failed to resend verification email. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  const renderContent = () => {
    switch (verificationStatus) {
      case 'pending':
        return (
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <RefreshCw className="h-6 w-6 text-blue-600 animate-spin" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Verifying Email</CardTitle>
              <CardDescription>
                Please wait while we verify your email address...
              </CardDescription>
            </CardHeader>
          </Card>
        )

      case 'success':
        return (
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Email Verified!</CardTitle>
              <CardDescription>
                Your email has been successfully verified. You'll be redirected to sign in shortly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push('/auth/signin')}
                className="w-full"
              >
                Continue to Sign In
              </Button>
            </CardContent>
          </Card>
        )

      case 'expired':
        return (
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Link Expired</CardTitle>
              <CardDescription>
                This verification link has expired. Please request a new one.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {resendMessage && (
                <div className={`text-sm p-3 rounded-md ${
                  resendMessage.includes('sent') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {resendMessage}
                </div>
              )}
              
              <Button
                onClick={handleResendVerification}
                disabled={isResending}
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                {isResending ? "Sending..." : "Resend Verification Email"}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => router.push('/auth/signup')}
                className="w-full"
              >
                Sign Up Again
              </Button>
            </CardContent>
          </Card>
        )

      case 'error':
      default:
        return (
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Verification Failed</CardTitle>
              <CardDescription>
                We couldn't verify your email address. The link may be invalid or expired.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {resendMessage && (
                <div className={`text-sm p-3 rounded-md ${
                  resendMessage.includes('sent') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {resendMessage}
                </div>
              )}
              
              <Button
                onClick={handleResendVerification}
                disabled={isResending || !email}
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                {isResending ? "Sending..." : "Resend Verification Email"}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => router.push('/auth/signup')}
                className="w-full"
              >
                Sign Up Again
              </Button>
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Back to Home Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {renderContent()}
      </div>
    </div>
  )
}
