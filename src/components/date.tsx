'use client'
import { Field, FieldGroup, Label } from '@/components/fieldset'
import { Select } from '@/components/select'
import { useEffect, useState } from 'react'

export function DateField<T extends React.ElementType = typeof FieldGroup>({
  disabled,
  label,
  defaultValue,
  onChange,
  minYear,
  maxYear,
}: {
  disabled?: boolean
  label?: string
  defaultValue?: Date
  minYear?: number
  maxYear?: number
  onChange(str: string): void
}) {
  const currentDate = new Date()
  const [value, setValue] = useState<{
    year: number
    month: number
    day: number
  }>({
    year: defaultValue?.getFullYear() || currentDate.getFullYear(),
    month: (defaultValue?.getMonth() || currentDate.getMonth()) + 1,
    day: defaultValue?.getDate() || currentDate.getDate(),
  })
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  useEffect(() => {
    onChange([value.year, value.month, value.day].map((n) => (n.toString().length % 2 ? `0${n}` : n)).join('-'))
  }, [value])

  function getDaysInMonth() {
    const daysInMonth = new Date(value.year, value.month, 0).getDate()
    return Array.from({ length: daysInMonth }, (_, i) => i + 1)
  }

  function getYears() {
    if (minYear && maxYear) return Array.from({ length: maxYear - minYear }, (_, i) => minYear + i).reverse()
    else if (minYear && !maxYear)
      return Array.from({ length: currentDate.getFullYear() - minYear }, (_, i) => minYear + i).reverse()
    else if (maxYear && !minYear) return Array.from({ length: maxYear - 1970 }, (_, i) => maxYear - i)

    return [currentDate.getFullYear() - 1, currentDate.getFullYear(), currentDate.getFullYear() + 1]
  }

  return (
    <FieldGroup className="mt-4 grid w-full grid-cols-7 gap-x-4">
      <Field className="col-span-2 !mb-0">
        <Label>{label}</Label>
        <Select
          name="year"
          defaultValue={value.year ? Number(value.year) : ''}
          disabled={disabled}
          onChange={(evt) => {
            evt.currentTarget &&
              setValue((prev) => ({
                ...(prev || {}),
                [evt.currentTarget?.name]: Number(evt.currentTarget?.value),
              }))
          }}
        >
          <option value="" disabled>
            Year
          </option>
          {getYears().map((year) => (
            <option value={year} key={year}>
              {year}
            </option>
          ))}
        </Select>
      </Field>
      <Field className="col-span-3 !mb-0 pt-6">
        <Label className="sr-only">Month</Label>
        <Select
          name="month"
          defaultValue={value.month}
          disabled={disabled}
          onChange={(evt) => {
            evt.currentTarget &&
              setValue((prev) => ({
                ...(prev || {}),
                [evt.currentTarget?.name]: Number(evt.currentTarget?.value),
              }))
          }}
        >
          <option value="" disabled>
            Select month&hellip;
          </option>
          {months.map((month, index) => (
            <option value={index + 1} key={month}>
              {month}
            </option>
          ))}
        </Select>
      </Field>
      <Field className="!mb-0 w-20 pt-6">
        <Label className="sr-only">Day</Label>
        <Select
          name="day"
          defaultValue={value.day.toString()}
          disabled={disabled}
          onChange={(evt) => {
            evt.currentTarget &&
              setValue((prev) => ({
                ...(prev || {}),
                [evt.currentTarget?.name]: Number(evt.currentTarget?.value),
              }))
          }}
        >
          <option value="" disabled>
            Day
          </option>
          {getDaysInMonth().map((day) => (
            <option value={day} key={day}>
              {day}
            </option>
          ))}
        </Select>
      </Field>
    </FieldGroup>
  )
}

export default DateField
