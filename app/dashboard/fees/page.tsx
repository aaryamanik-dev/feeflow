import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'

export default async function FeeCategoriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('school_memberships')
    .select('school_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/onboarding')

  // Fetch existing fee categories for this school
  const { data: categories } = await supabase
    .from('fee_categories')
    .select('*')
    .eq('school_id', membership.school_id)
    .order('created_at', { ascending: false })

  // Server Action to add a new category
  const addCategory = async (formData: FormData) => {
    'use server'
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: activeMembership } = await supabase
      .from('school_memberships')
      .select('school_id')
      .eq('user_id', user.id)
      .single()

    if (activeMembership) {
      await supabase.from('fee_categories').insert({
        school_id: activeMembership.school_id,
        name,
        description,
        status: 'active'
      })
      revalidatePath('/fees')
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Fee Categories</h1>
        <Link href="/dashboard" className="text-sm font-medium text-teal-600 hover:underline">
          &larr; Back to Dashboard
        </Link>
      </div>

      {/* Add Category Form */}
      <div className="p-6 bg-white rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Create New Fee Type</h2>
        <form action={addCategory} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Category Name</label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Annual Tuition Fee"
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
            <input
              type="text"
              name="description"
              placeholder="e.g. Payable in 4 instalments"
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 text-white bg-teal-600 rounded-md hover:bg-teal-700 h-[42px]"
          >
            Add Category
          </button>
        </form>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-3 text-sm font-medium text-slate-600">Fee Name</th>
              <th className="px-6 py-3 text-sm font-medium text-slate-600">Description</th>
              <th className="px-6 py-3 text-sm font-medium text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {categories && categories.length > 0 ? (
              categories.map((category) => (
                <tr key={category.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{category.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{category.description || '-'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold text-teal-700 bg-teal-50 rounded-full">
                      {category.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                  No fee categories created yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}