import { auth } from '@/lib/auth'
import { JarvisDashboard } from '@/components/JarvisDashboard'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }
  
  return <JarvisDashboard session={session} />
}
