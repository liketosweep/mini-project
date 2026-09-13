'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createHabitSchema, type CreateHabitInput } from '@/lib/validators/habit'
import { createClient } from '@/lib/supabase/client'
import type { Habit } from '@/types/database.types'
import { PlusCircle, AlertCircle, Loader2, X, Tag, AlignLeft, Sparkles } from 'lucide-react'

interface CreateHabitModalProps {
  userId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: (habit: Habit) => void
}

const CATEGORY_SUGGESTIONS = ['General', 'Study', 'Coding', 'Health', 'Fitness', 'Reading']

export function CreateHabitModal({
  userId,
  isOpen,
  onClose,
  onSuccess,
}: CreateHabitModalProps) {
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const [selectedCategory, setSelectedCategory] = useState('General')

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateHabitInput>({
    resolver: zodResolver(createHabitSchema),
    defaultValues: {
      title: '',
      category: 'General',
      description: '',
    },
  })

  if (!isOpen) return null

  async function onSubmit(values: CreateHabitInput) {
    setError(null)

    try {
      const { data, error: insertError } = await supabase
        .from('habits')
        .insert({
          user_id: userId,
          title: values.title,
          description: values.description || null,
          category: values.category || 'General',
          current_streak: 0,
          longest_streak: 0,
          is_archived: false,
        })
        .select()
        .single()

      if (insertError) {
        setError(insertError.message)
        return
      }

      reset()
      onSuccess(data)
      onClose()
    } catch (err) {
      console.error('Create habit error:', err)
      setError('An unexpected error occurred while creating your habit.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl border border-sand-200 bg-white p-6 shadow-xl dark:border-brand-800 dark:bg-brand-900 space-y-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-brand-600" />
              <span>Create New Solo Habit</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-sand-400">
              Set a daily goal to track personal streaks and self-reported completions.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1 text-zinc-400 hover:bg-sand-100 hover:text-zinc-700 dark:hover:bg-brand-800 dark:hover:text-sand-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
            <span>{error}</span>
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
              placeholder="e.g. Daily LeetCode Practice, Morning Run"
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
              placeholder="Category name"
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
              placeholder="Add details, intentions, or daily targets..."
              {...register('description')}
              className="w-full rounded-lg border border-sand-300 p-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-brand-700 dark:bg-brand-800 dark:text-white dark:placeholder:text-zinc-500 disabled:opacity-50 resize-none"
            />
            {errors.description && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-sand-200 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-sand-50 dark:border-brand-800 dark:text-sand-300 dark:hover:bg-brand-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-lg bg-gold-500 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-600 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Creating Habit...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Save Habit</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
