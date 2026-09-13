'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { editHabitSchema, type EditHabitInput } from '@/lib/validators/habit'
import { createClient } from '@/lib/supabase/client'
import type { Habit } from '@/types/database.types'
import { AlertCircle, CheckCircle2, Loader2, Tag, AlignLeft, ArrowLeft, Save } from 'lucide-react'

interface EditHabitFormProps {
  habit: Habit
}

const CATEGORY_SUGGESTIONS = ['General', 'Study', 'Coding', 'Health', 'Fitness', 'Reading']

export function EditHabitForm({ habit }: EditHabitFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const supabase = createClient()

  const [selectedCategory, setSelectedCategory] = useState(habit.category || 'General')

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<EditHabitInput>({
    resolver: zodResolver(editHabitSchema),
    defaultValues: {
      title: habit.title,
      category: habit.category || 'General',
      description: habit.description || '',
    },
  })

  async function onSubmit(values: EditHabitInput) {
    setError(null)
    setSuccess(null)

    try {
      const { error: updateError } = await supabase
        .from('habits')
        .update({
          title: values.title,
          category: values.category || 'General',
          description: values.description || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', habit.id)

      if (updateError) {
        setError(updateError.message)
        return
      }

      setSuccess('Habit updated successfully! Redirecting...')
      setTimeout(() => {
        router.push(`/habits/${habit.id}`)
        router.refresh()
      }, 500)
    } catch (err) {
      console.error('Update habit error:', err)
      setError('An unexpected error occurred while updating the habit.')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link
          href={`/habits/${habit.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-sand-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Cancel and return to habit</span>
        </Link>
      </div>

      <div className="rounded-2xl border border-sand-200 bg-white p-6 sm:p-8 shadow-sm dark:border-brand-800 dark:bg-brand-900 space-y-6">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Edit Habit
          </h1>
          <p className="text-xs text-zinc-500 dark:text-sand-400">
            Update your habit details. Historical check-in records will remain preserved.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label
              htmlFor="title"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-sand-300"
            >
              Habit Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              disabled={isSubmitting}
              {...register('title')}
              className="w-full rounded-lg border border-sand-300 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-brand-700 dark:bg-brand-800 dark:text-white dark:placeholder:text-zinc-500 disabled:opacity-50"
            />
            {errors.title && (
              <p className="text-xs text-red-600 dark:text-red-400">{errors.title.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label
              htmlFor="category"
              className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-sand-300"
            >
              <Tag className="h-3.5 w-3.5" />
              <span>Category</span>
            </label>
            <input
              id="category"
              type="text"
              disabled={isSubmitting}
              {...register('category')}
              className="w-full rounded-lg border border-sand-300 px-3.5 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-brand-700 dark:bg-brand-800 dark:text-white dark:placeholder:text-zinc-500 disabled:opacity-50"
            />
            {/* Quick pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {CATEGORY_SUGGESTIONS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat)
                    setValue('category', cat, { shouldDirty: true })
                  }}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                    selectedCategory === cat
                      ? 'bg-brand-50 border-brand-300 text-brand-700 dark:bg-brand-950/50 dark:border-brand-800 dark:text-brand-300'
                      : 'border-sand-200 text-zinc-600 hover:bg-sand-50 dark:border-brand-800 dark:text-sand-400 dark:hover:bg-brand-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {errors.category && (
              <p className="text-xs text-red-600 dark:text-red-400">{errors.category.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label
              htmlFor="description"
              className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-sand-300"
            >
              <AlignLeft className="h-3.5 w-3.5" />
              <span>Description (Optional)</span>
            </label>
            <textarea
              id="description"
              rows={3}
              maxLength={300}
              disabled={isSubmitting}
              {...register('description')}
              className="w-full rounded-lg border border-sand-300 p-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-brand-700 dark:bg-brand-800 dark:text-white dark:placeholder:text-zinc-500 disabled:opacity-50 resize-none"
            />
            {errors.description && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-sand-100 dark:border-brand-800">
            <Link
              href={`/habits/${habit.id}`}
              className="rounded-lg border border-sand-200 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-sand-50 dark:border-brand-800 dark:text-sand-300 dark:hover:bg-brand-800 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="flex items-center gap-1.5 rounded-lg bg-gold-500 px-5 py-2 text-xs font-semibold text-white shadow hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-600 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
