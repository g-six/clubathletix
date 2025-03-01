'use client'

import { Field } from '@/components/fieldset'
import { onFileChange } from '@/lib/file-helper'
import { ShieldExclamationIcon } from '@heroicons/react/20/solid'
import { useState } from 'react'

export function PhotoUploader({
  name,
  className,
  'data-default': defaultValue,
}: {
  name: string
  className?: string
  'data-default'?: string | null
}) {
  const [file, setFile] = useState<string | undefined>(defaultValue ? `/api/files/${defaultValue}` : undefined)

  return (
    <div
      className={
        className ||
        'w-full rounded-lg bg-black/20 px-1 py-3 dark:border-r dark:border-b dark:border-white/15 dark:bg-black'
      }
    >
      <input type="hidden" defaultValue={file} name={name} />
      <Field>
        <label
          htmlFor="file-upload"
          className="flex w-full cursor-pointer items-center justify-center gap-2 text-base/6 font-bold text-zinc-950 hover:text-lime-500 sm:text-sm/6 dark:text-white"
        >
          <input
            type="file"
            title="upload a logo"
            id="file-upload"
            name="file-upload"
            className="!sr-only"
            onChange={(evt) => {
              onFileChange(evt).then((result) => {
                result && setFile(result)
              })
            }}
            accept="image/png,image/jpg,image/jpeg"
          />
          {file ? (
            <img src={file} alt="" className="size-12 rounded-full" />
          ) : (
            <ShieldExclamationIcon aria-hidden="true" className="size-12 text-gray-300" />
          )}
          {file ? 'Update logo' : 'Upload a logo'}
        </label>
      </Field>
    </div>
  )
}
