import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'

export default async function StudentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // 1. Verify membership and get school_id
  const { data: membership } = await supabase
    .from('school_memberships')
    .select('school_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/onboarding')

  // 2. Fetch students for this specific school
  const { data: students } = await supabase
    .from('students')
    .select('*')
    .eq('school_id', membership.school_id)
    .order('created_at', { ascending: false })

  // 3. Server Action to add a new student
  const addStudent = async (formData: FormData) => {
    'use server'
    const name = formData.get('name') as string
    const student_code = formData.get('student_code') as string
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: activeMembership } = await supabase
      .from('school_memberships')
      .select('school_id')
      .eq('user_id', user.id)
      .single()

    if (activeMembership) {
      await supabase.from('students').insert({
        school_id: activeMembership.school_id,
        name,
        student_code,
        status: 'active'
      })
      revalidatePath('/students')
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Students</h1>
        <Link href="/dashboard" className="text-sm font-medium text-teal-600 hover:underline">
          &larr; Back to Dashboard
        </Link>
      </div>

      {/* Add Student Form */}
      <div className="p-6 bg-white rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Add New Student</h2>
        <form action={addStudent} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Aarav Sharma"
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Admission / Roll No.</label>
            <input
              type="text"
              name="student_code"
              placeholder="e.g. 2026-001"
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 text-white bg-teal-600 rounded-md hover:bg-teal-700 h-[42px]"
          >
            Add Student
          </button>
        </form>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-3 text-sm font-medium text-slate-600">Student Code</th>
              <th className="px-6 py-3 text-sm font-medium text-slate-600">Name</th>
              <th className="px-6 py-3 text-sm font-medium text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {students && students.length > 0 ? (
              students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-600">{student.student_code || '-'}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{student.name}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold text-teal-700 bg-teal-50 rounded-full">
                      {student.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                  No students added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}