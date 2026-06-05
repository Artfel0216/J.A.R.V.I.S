import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/LoginForm'

export default async function LoginPage() {
  const session = await auth()
  if (session?.user) {
    redirect('/')
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  )
}
