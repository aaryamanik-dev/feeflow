import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user already belongs to a school
  const { data: memberships } = await supabase
    .from('school_memberships')
    .select('school_id')
    .eq('user_id', user.id)

  // If they already have a school, send them directly to the dashboard
  if (memberships && memberships.length > 0) {
    redirect('/dashboard')
  }

  const createSchool = async (formData: FormData) => {
    'use server'
    const name = formData.get('name') as string
    const contact_details = formData.get('contact_details') as string
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    // 1. Create the school workspace
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .insert({ 
        name, 
        contact_details,
        status: 'active'
      })
      .select()
      .single()

    if (schoolError || !school) {
      console.error('Failed to create school:', schoolError)
      return
    }

    // 2. Grant the creator the 'owner' role
    const { error: membershipError } = await supabase
      .from('school_memberships')
      .insert({
        school_id: school.id,
        user_id: user.id,
        role: 'owner',
        status: 'active'
      })

    if (membershipError) {
      console.error('Failed to assign membership:', membershipError)
      return
    }

    // 3. Proceed to the main dashboard
    redirect('/dashboard')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900">Welcome to FeeFlow</h2>
          <p className="mt-2 text-sm text-gray-600">Let's set up your school workspace.</p>
        </div>
        
        <form action={createSchool} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">School Name</label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Sunrise Public School"
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Details (Phone/Email)</label>
            <textarea
              name="contact_details"
              required
              rows={3}
              placeholder="Office phone and email"
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-teal-600 rounded-md hover:bg-teal-700"
          >
            Create School
          </button>
        </form>
      </div>
    </div>
  )
}