import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link' // Add this line here

<div className="mt-8 space-x-4">
  <Link 
    href="/students" 
    className="inline-block px-4 py-2 text-white bg-slate-800 rounded hover:bg-slate-900">
    Manage Students
  </Link>
</div>

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch the user's school membership
  const { data: membership } = await supabase
    .from('school_memberships')
    .select('*, schools(*)')
    .eq('user_id', user.id)
    .single()

  // If they don't belong to a school, force them to onboarding
  if (!membership) {
    redirect('/onboarding')
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900">
        Dashboard: {membership.schools?.name}
      </h1>
      <p className="mt-2 text-gray-600">Logged in as: {user.email}</p>
      <p className="mt-1 text-sm text-gray-500">Role: <span className="font-semibold uppercase">{membership.role}</span></p>
      
      <form action={async () => {
        'use server'
        const supabase = await createClient()
        await supabase.auth.signOut()
        redirect('/login')
      }}>
        <button type="submit" className="px-4 py-2 mt-6 text-white bg-red-600 rounded hover:bg-red-700">
          Sign Out
        </button>
      </form>
    </div>
  )
}