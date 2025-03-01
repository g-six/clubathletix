'use client'

import { Field } from '@/components/fieldset'
import { onVideoFileChange } from '@/lib/file-helper'
import { createVideo } from '@/services/match.service'
import { ShieldExclamationIcon } from '@heroicons/react/20/solid'
import { useState } from 'react'

export function VideoUploader({
  label = 'Upload a video',
  name,
  className,
  'data-default': defaultValue,
  data,
}: {
  label?: string
  name: string
  className?: string
  'data-default'?: string | null
  data: {
    [k: string]: string
  }
}) {
  const [value, setValue] = useState<string>(defaultValue || '')

  return (
    <div
      className={
        className ||
        'w-full rounded-lg bg-black/20 px-1 py-3 dark:border-r dark:border-b dark:border-white/15 dark:bg-black'
      }
    >
      <input type="hidden" defaultValue={value} name={name} />
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
              onVideoFileChange(evt).then((result) => {
                const { match_id, title, match_event_id } = data

                if (match_id && result?.size) {
                  createVideo({
                    match_id,
                    match_event_id,
                    title,
                    ...result,
                  }).then((res) => {
                    console.log({
                      createVideo: res,
                    })
                    // res.json().then(({ upload_link, uri, ...rest }) => {
                    //   setFile(result.file)
                    //   setTotal(result.size)
                    //   setValue(uri)
                    //   setUploadLink(upload_link)
                    // })
                  })
                }
                // result && setFile(result)
              })
            }}
            accept="video/mp4,video/mov,video/mpeg"
          />
          {value ? (
            <video src={value} title="event video" className="size-12 rounded-full" />
          ) : (
            <ShieldExclamationIcon aria-hidden="true" className="size-12 text-gray-300" />
          )}
          {value ? 'Replace' : label}
        </label>
      </Field>
    </div>
  )
}
