'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Loader2, ArrowRight, ArrowLeft } from 'lucide-react'
import { Input, Textarea, Select, Button, Stack, Card } from '@/lib/design-system'
import { useTracking } from '@/components/tracking'

const US_STATES = [
  { value: '', label: 'Select state...' },
  { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' }, { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' }, { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' }, { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' }, { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' }, { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' }, { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' }, { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' }, { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' }, { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' }, { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' }, { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' }, { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' }, { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' }, { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' }, { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' }, { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' },
]

const YES_NO = [
  { value: '', label: 'Select...' },
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
]

const EMPLOYMENT_TYPE = [
  { value: '', label: 'Select...' },
  { value: 'Full Time', label: 'Full Time' },
  { value: 'Part Time', label: 'Part Time' },
]

const MONTHS = [
  { value: '', label: 'Month' },
  ...Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) })),
]

const DAYS = [
  { value: '', label: 'Day' },
  ...Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) })),
]

const currentYear = new Date().getFullYear()

const DOB_YEARS = [
  { value: '', label: 'Year' },
  ...Array.from({ length: currentYear - 1940 + 1 }, (_, i) => {
    const y = String(currentYear - i)
    return { value: y, label: y }
  }),
]

const EMPLOYMENT_YEARS = [
  { value: '', label: 'Year' },
  ...Array.from({ length: currentYear - 1980 + 1 }, (_, i) => {
    const y = String(currentYear - i)
    return { value: y, label: y }
  }),
]

const SKILL_LEVELS = [
  { value: '', label: 'Select...' },
  ...Array.from({ length: 10 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) })),
]

const STEP_NAMES = [
  'Personal Information',
  'Experience',
  'Employment History',
  'Personal References',
  'Questions & Consent',
]

interface Employer {
  name: string
  street: string
  street2: string
  city: string
  state: string
  zip: string
  country: string
  position: string
  start_month: string
  start_day: string
  start_year: string
  end_month: string
  end_day: string
  end_year: string
  reason_leaving: string
  supervisor_name: string
  supervisor_phone: string
}

interface Reference {
  name: string
  phone: string
  years_known: string
}

interface FormData {
  first_name: string
  last_name: string
  phone: string
  email: string
  street_address: string
  address_line_2: string
  city: string
  state: string
  zip_code: string
  dob_month: string
  dob_day: string
  dob_year: string
  construction_experience: string
  employers: Employer[]
  references: Reference[]
  can_travel: string
  travel_availability: string
  is_fulltime_rver: string
  fulltime_rver_duration: string
  has_tools: string
  can_work_outdoors: string
  can_lift_50lbs: string
  can_climb_ladders: string
  vehicle_description: string
  owns_vehicle: string
  employment_type: string
  felony_conviction: string
  felony_explanation: string
  has_working_capital: string
  has_computer: string
  computer_device: string
  has_internet: string
  computer_skill_level: string
  proficient_google_drive: string
  proficient_pdf: string
  can_take_quality_photos: string
  has_quality_camera: string
  final_statement: string
  consent: boolean
}

function createEmptyEmployer(): Employer {
  return {
    name: '', street: '', street2: '', city: '', state: '', zip: '', country: '',
    position: '', start_month: '', start_day: '', start_year: '',
    end_month: '', end_day: '', end_year: '', reason_leaving: '',
    supervisor_name: '', supervisor_phone: '',
  }
}

function createEmptyReference(): Reference {
  return { name: '', phone: '', years_known: '' }
}

const initialFormData: FormData = {
  first_name: '', last_name: '', phone: '', email: '',
  street_address: '', address_line_2: '', city: '', state: '', zip_code: '',
  dob_month: '', dob_day: '', dob_year: '',
  construction_experience: '',
  employers: [createEmptyEmployer(), createEmptyEmployer(), createEmptyEmployer()],
  references: [createEmptyReference(), createEmptyReference()],
  can_travel: '', travel_availability: '',
  is_fulltime_rver: '', fulltime_rver_duration: '',
  has_tools: '', can_work_outdoors: '', can_lift_50lbs: '', can_climb_ladders: '',
  vehicle_description: '', owns_vehicle: '', employment_type: '',
  felony_conviction: '', felony_explanation: '',
  has_working_capital: '', has_computer: '', computer_device: '', has_internet: '',
  computer_skill_level: '', proficient_google_drive: '', proficient_pdf: '',
  can_take_quality_photos: '', has_quality_camera: '',
  final_statement: '', consent: false,
}

export function TechApplicationForm() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { trackEvent } = useTracking()

  function update(field: keyof FormData, value: string | boolean) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  function updateEmployer(index: number, field: keyof Employer, value: string) {
    setFormData(prev => {
      const employers = [...prev.employers]
      employers[index] = { ...employers[index], [field]: value }
      return { ...prev, employers }
    })
  }

  function updateReference(index: number, field: keyof Reference, value: string) {
    setFormData(prev => {
      const references = [...prev.references]
      references[index] = { ...references[index], [field]: value }
      return { ...prev, references }
    })
  }

  function validateStep(): boolean {
    setError(null)
    if (step === 0) {
      if (!formData.first_name || !formData.last_name || !formData.phone || !formData.email || !formData.city || !formData.state || !formData.zip_code) {
        setError('Please fill in all required fields.')
        return false
      }
    }
    if (step === 4 && !formData.consent) {
      setError('You must agree to the application policy to submit.')
      return false
    }
    return true
  }

  function handleNext() {
    if (!validateStep()) return
    setStep(prev => Math.min(prev + 1, 4))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handlePrev() {
    setError(null)
    setStep(prev => Math.max(prev - 1, 0))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function toBool(val: string): boolean {
    return val === 'Yes'
  }

  async function handleSubmit() {
    if (!validateStep()) return
    setSubmitting(true)
    setError(null)

    const dob = formData.dob_year && formData.dob_month && formData.dob_day
      ? `${formData.dob_year}-${formData.dob_month.padStart(2, '0')}-${formData.dob_day.padStart(2, '0')}`
      : null

    const body = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone,
      date_of_birth: dob,
      street_address: formData.street_address || null,
      address_line_2: formData.address_line_2 || null,
      city: formData.city,
      state: formData.state,
      zip_code: formData.zip_code,
      construction_experience: formData.construction_experience || null,
      work_history: formData.employers.map(emp => ({
        employer_name: emp.name,
        street: emp.street,
        street2: emp.street2,
        city: emp.city,
        state: emp.state,
        zip: emp.zip,
        country: emp.country,
        position: emp.position,
        start_date: emp.start_year && emp.start_month && emp.start_day
          ? `${emp.start_year}-${emp.start_month.padStart(2, '0')}-${emp.start_day.padStart(2, '0')}`
          : null,
        end_date: emp.end_year && emp.end_month && emp.end_day
          ? `${emp.end_year}-${emp.end_month.padStart(2, '0')}-${emp.end_day.padStart(2, '0')}`
          : null,
        reason_leaving: emp.reason_leaving,
        supervisor_name: emp.supervisor_name,
        supervisor_phone: emp.supervisor_phone,
      })),
      personal_references: formData.references.map(ref => ({
        name: ref.name,
        phone: ref.phone,
        years_known: ref.years_known,
      })),
      can_travel: toBool(formData.can_travel),
      travel_availability: formData.travel_availability || null,
      is_fulltime_rver: toBool(formData.is_fulltime_rver),
      fulltime_rver_duration: formData.fulltime_rver_duration || null,
      has_tools: toBool(formData.has_tools),
      can_work_outdoors: toBool(formData.can_work_outdoors),
      can_lift_50lbs: toBool(formData.can_lift_50lbs),
      can_climb_ladders: toBool(formData.can_climb_ladders),
      vehicle_description: formData.vehicle_description || null,
      owns_vehicle: toBool(formData.owns_vehicle),
      employment_type: formData.employment_type || null,
      felony_conviction: toBool(formData.felony_conviction),
      felony_explanation: formData.felony_explanation || null,
      has_working_capital: toBool(formData.has_working_capital),
      has_computer: toBool(formData.has_computer),
      computer_device: formData.computer_device || null,
      has_internet: toBool(formData.has_internet),
      computer_skill_level: formData.computer_skill_level || null,
      proficient_google_drive: toBool(formData.proficient_google_drive),
      proficient_pdf: toBool(formData.proficient_pdf),
      can_take_quality_photos: toBool(formData.can_take_quality_photos),
      has_quality_camera: toBool(formData.has_quality_camera),
      final_statement: formData.final_statement || null,
      consent_background_check: formData.consent,
    }

    try {
      const res = await fetch('/api/tech-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Failed to submit application. Please try again.')
      }

      await trackEvent('tech_application_submitted')
      router.push('/thank-you')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  function renderEmployerSection(index: number, title: string) {
    const emp = formData.employers[index]
    return (
      <fieldset key={index} className="space-y-4">
        <legend className="text-sm font-semibold text-gray-700 mb-3">{title}</legend>

        <Input
          label="Employer Name"
          value={emp.name}
          onChange={e => updateEmployer(index, 'name', e.target.value)}
        />

        <div className="space-y-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Employer Address</p>
          <Input
            label="Street Address"
            value={emp.street}
            onChange={e => updateEmployer(index, 'street', e.target.value)}
          />
          <Input
            label="Address Line 2"
            value={emp.street2}
            onChange={e => updateEmployer(index, 'street2', e.target.value)}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Input
              label="City"
              value={emp.city}
              onChange={e => updateEmployer(index, 'city', e.target.value)}
            />
            <Select
              label="State"
              options={US_STATES}
              value={emp.state}
              onChange={e => updateEmployer(index, 'state', (e.target as HTMLSelectElement).value)}
            />
            <Input
              label="ZIP Code"
              value={emp.zip}
              onChange={e => updateEmployer(index, 'zip', e.target.value)}
            />
          </div>
          <Input
            label="Country"
            value={emp.country}
            onChange={e => updateEmployer(index, 'country', e.target.value)}
          />
        </div>

        <Textarea
          label="Position Title, Duties, and Skills"
          value={emp.position}
          onChange={e => updateEmployer(index, 'position', e.target.value)}
          rows={3}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Start Date</p>
            <div className="grid grid-cols-3 gap-2">
              <Select
                label="Month"
                options={MONTHS}
                value={emp.start_month}
                onChange={e => updateEmployer(index, 'start_month', (e.target as HTMLSelectElement).value)}
              />
              <Select
                label="Day"
                options={DAYS}
                value={emp.start_day}
                onChange={e => updateEmployer(index, 'start_day', (e.target as HTMLSelectElement).value)}
              />
              <Select
                label="Year"
                options={EMPLOYMENT_YEARS}
                value={emp.start_year}
                onChange={e => updateEmployer(index, 'start_year', (e.target as HTMLSelectElement).value)}
              />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">End Date</p>
            <div className="grid grid-cols-3 gap-2">
              <Select
                label="Month"
                options={MONTHS}
                value={emp.end_month}
                onChange={e => updateEmployer(index, 'end_month', (e.target as HTMLSelectElement).value)}
              />
              <Select
                label="Day"
                options={DAYS}
                value={emp.end_day}
                onChange={e => updateEmployer(index, 'end_day', (e.target as HTMLSelectElement).value)}
              />
              <Select
                label="Year"
                options={EMPLOYMENT_YEARS}
                value={emp.end_year}
                onChange={e => updateEmployer(index, 'end_year', (e.target as HTMLSelectElement).value)}
              />
            </div>
          </div>
        </div>

        <Input
          label="Reason for Leaving"
          value={emp.reason_leaving}
          onChange={e => updateEmployer(index, 'reason_leaving', e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Supervisor Name"
            value={emp.supervisor_name}
            onChange={e => updateEmployer(index, 'supervisor_name', e.target.value)}
          />
          <Input
            label="Supervisor Phone"
            type="tel"
            value={emp.supervisor_phone}
            onChange={e => updateEmployer(index, 'supervisor_phone', e.target.value)}
          />
        </div>
      </fieldset>
    )
  }

  function renderStep() {
    switch (step) {
      case 0:
        return (
          <Stack gap="md">
            <fieldset>
              <legend className="text-sm font-semibold text-gray-700 mb-3">Personal Information</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={formData.first_name}
                  onChange={e => update('first_name', e.target.value)}
                  required
                />
                <Input
                  label="Last Name"
                  value={formData.last_name}
                  onChange={e => update('last_name', e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <Input
                  label="Cell Phone"
                  type="tel"
                  value={formData.phone}
                  onChange={e => update('phone', e.target.value)}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={e => update('email', e.target.value)}
                  required
                />
              </div>
              <div className="mt-4 space-y-4">
                <Input
                  label="Street Address"
                  value={formData.street_address}
                  onChange={e => update('street_address', e.target.value)}
                />
                <Input
                  label="Address Line 2"
                  value={formData.address_line_2}
                  onChange={e => update('address_line_2', e.target.value)}
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <Input
                    label="City"
                    value={formData.city}
                    onChange={e => update('city', e.target.value)}
                    required
                  />
                  <Select
                    label="State"
                    options={US_STATES}
                    value={formData.state}
                    onChange={e => update('state', (e.target as HTMLSelectElement).value)}
                    required
                  />
                  <Input
                    label="ZIP Code"
                    value={formData.zip_code}
                    onChange={e => update('zip_code', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Date of Birth</p>
                <div className="grid grid-cols-3 gap-3">
                  <Select
                    label="Month"
                    options={MONTHS}
                    value={formData.dob_month}
                    onChange={e => update('dob_month', (e.target as HTMLSelectElement).value)}
                  />
                  <Select
                    label="Day"
                    options={DAYS}
                    value={formData.dob_day}
                    onChange={e => update('dob_day', (e.target as HTMLSelectElement).value)}
                  />
                  <Select
                    label="Year"
                    options={DOB_YEARS}
                    value={formData.dob_year}
                    onChange={e => update('dob_year', (e.target as HTMLSelectElement).value)}
                  />
                </div>
              </div>
            </fieldset>
          </Stack>
        )

      case 1:
        return (
          <Stack gap="md">
            <fieldset>
              <legend className="text-sm font-semibold text-gray-700 mb-3">Experience</legend>
              <Textarea
                label="Do you have construction experience? Please tell us a little about you and your work experience."
                value={formData.construction_experience}
                onChange={e => update('construction_experience', e.target.value)}
                rows={6}
              />
            </fieldset>
          </Stack>
        )

      case 2:
        return (
          <Stack gap="lg">
            {renderEmployerSection(0, 'Employment History: Please list most recent employment first.')}
            <hr className="border-gray-200" />
            {renderEmployerSection(1, 'Employer 2')}
            <hr className="border-gray-200" />
            {renderEmployerSection(2, 'Employer 3')}
          </Stack>
        )

      case 3:
        return (
          <Stack gap="lg">
            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold text-gray-700 mb-3">
                Personal References: Please list two personal references below.
              </legend>
              <Input
                label="Name"
                value={formData.references[0].name}
                onChange={e => updateReference(0, 'name', e.target.value)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Phone"
                  type="tel"
                  value={formData.references[0].phone}
                  onChange={e => updateReference(0, 'phone', e.target.value)}
                />
                <Input
                  label="Years Known"
                  value={formData.references[0].years_known}
                  onChange={e => updateReference(0, 'years_known', e.target.value)}
                />
              </div>
            </fieldset>
            <hr className="border-gray-200" />
            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold text-gray-700 mb-3">Reference 2</legend>
              <Input
                label="Name"
                value={formData.references[1].name}
                onChange={e => updateReference(1, 'name', e.target.value)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Phone"
                  type="tel"
                  value={formData.references[1].phone}
                  onChange={e => updateReference(1, 'phone', e.target.value)}
                />
                <Input
                  label="Years Known"
                  value={formData.references[1].years_known}
                  onChange={e => updateReference(1, 'years_known', e.target.value)}
                />
              </div>
            </fieldset>
          </Stack>
        )

      case 4:
        return (
          <Stack gap="md">
            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold text-gray-700 mb-3">Questions</legend>

              <Select
                label="Are you willing to travel?"
                options={YES_NO}
                value={formData.can_travel}
                onChange={e => update('can_travel', (e.target as HTMLSelectElement).value)}
              />
              {formData.can_travel === 'Yes' && (
                <Input
                  label="If yes, what part of the country?"
                  value={formData.travel_availability}
                  onChange={e => update('travel_availability', e.target.value)}
                />
              )}

              <Select
                label="Are you currently a fulltime RVer?"
                options={YES_NO}
                value={formData.is_fulltime_rver}
                onChange={e => update('is_fulltime_rver', (e.target as HTMLSelectElement).value)}
              />
              {formData.is_fulltime_rver === 'Yes' && (
                <Input
                  label="If yes, how long have you been full-timing?"
                  value={formData.fulltime_rver_duration}
                  onChange={e => update('fulltime_rver_duration', e.target.value)}
                />
              )}

              <Select
                label="Do you have your own set of basic construction tools?"
                options={YES_NO}
                value={formData.has_tools}
                onChange={e => update('has_tools', (e.target as HTMLSelectElement).value)}
              />

              <Select
                label="Do you have any physical or medical conditions that prevent you from working in an outdoor environment?"
                options={YES_NO}
                value={formData.can_work_outdoors}
                onChange={e => update('can_work_outdoors', (e.target as HTMLSelectElement).value)}
              />

              <Select
                label="Do you have any physical or medical conditions that prevent you from lifting 50lbs?"
                options={YES_NO}
                value={formData.can_lift_50lbs}
                onChange={e => update('can_lift_50lbs', (e.target as HTMLSelectElement).value)}
              />

              <Select
                label="Do you have any physical or medical conditions that prevent you from climbing ladders?"
                options={YES_NO}
                value={formData.can_climb_ladders}
                onChange={e => update('can_climb_ladders', (e.target as HTMLSelectElement).value)}
              />

              <Input
                label="What kind of vehicle do you plan on using for your business?"
                value={formData.vehicle_description}
                onChange={e => update('vehicle_description', e.target.value)}
              />

              <Select
                label="Do you currently own this vehicle?"
                options={YES_NO}
                value={formData.owns_vehicle}
                onChange={e => update('owns_vehicle', (e.target as HTMLSelectElement).value)}
              />

              <Select
                label="Are you looking for part-time or full-time?"
                options={EMPLOYMENT_TYPE}
                value={formData.employment_type}
                onChange={e => update('employment_type', (e.target as HTMLSelectElement).value)}
              />

              <Select
                label="Have you ever been convicted of a felony?"
                options={YES_NO}
                value={formData.felony_conviction}
                onChange={e => update('felony_conviction', (e.target as HTMLSelectElement).value)}
              />
              {formData.felony_conviction === 'Yes' && (
                <Textarea
                  label="If yes, please explain."
                  value={formData.felony_explanation}
                  onChange={e => update('felony_explanation', e.target.value)}
                  rows={3}
                />
              )}
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold text-gray-700 mb-3">
                All independent installers will have travel and other expenses prior to receiving pay from any work done.
              </legend>

              <Select
                label="Do you have working capital to sustain your business?"
                options={YES_NO}
                value={formData.has_working_capital}
                onChange={e => update('has_working_capital', (e.target as HTMLSelectElement).value)}
              />

              <Select
                label="Do you have access to a computer?"
                options={YES_NO}
                value={formData.has_computer}
                onChange={e => update('has_computer', (e.target as HTMLSelectElement).value)}
              />
              {formData.has_computer === 'Yes' && (
                <Input
                  label="If yes, please list your device."
                  value={formData.computer_device}
                  onChange={e => update('computer_device', e.target.value)}
                />
              )}

              <Select
                label="Do you have regular access to the internet?"
                options={YES_NO}
                value={formData.has_internet}
                onChange={e => update('has_internet', (e.target as HTMLSelectElement).value)}
              />

              <Select
                label="On a scale from 1-10 how would you rank your computer and internet skills?"
                options={SKILL_LEVELS}
                value={formData.computer_skill_level}
                onChange={e => update('computer_skill_level', (e.target as HTMLSelectElement).value)}
              />
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold text-gray-700 mb-3">
                RV Armor requires all jobs to have progress pictures taken and uploaded to our cloud based program.
              </legend>

              <Select
                label="Are you proficient in the use of Google Drive?"
                options={YES_NO}
                value={formData.proficient_google_drive}
                onChange={e => update('proficient_google_drive', (e.target as HTMLSelectElement).value)}
              />

              <Select
                label="Are you proficient in the use of PDF files?"
                options={YES_NO}
                value={formData.proficient_pdf}
                onChange={e => update('proficient_pdf', (e.target as HTMLSelectElement).value)}
              />

              <Select
                label="Can you take quality job progress pictures and upload them with proper instructions from us?"
                options={YES_NO}
                value={formData.can_take_quality_photos}
                onChange={e => update('can_take_quality_photos', (e.target as HTMLSelectElement).value)}
              />

              <Select
                label="Do you have a good quality phone camera or regular camera for taking quality pictures?"
                options={YES_NO}
                value={formData.has_quality_camera}
                onChange={e => update('has_quality_camera', (e.target as HTMLSelectElement).value)}
              />
            </fieldset>

            <fieldset className="space-y-4">
              <Textarea
                label="Tell us why you believe you have the right stuff to be a part of our team."
                value={formData.final_statement}
                onChange={e => update('final_statement', e.target.value)}
                rows={5}
              />

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.consent}
                  onChange={e => update('consent', e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-[#003365] focus:ring-[#003365]"
                  required
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    I agree to the application policy.
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    As part of our procedure for processing your application, your personal and employment references may be checked. If you have misrepresented or omitted any facts on this application, and are subsequently granted a position as an independent installer, you may be discharged from this position and become ineligible for any future work with RV Armor.
                  </p>
                </div>
              </label>
            </fieldset>
          </Stack>
        )

      default:
        return null
    }
  }

  const progressPercent = ((step + 1) / STEP_NAMES.length) * 100

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="p-6 sm:p-8">
        <div className="mb-8">
          <p className="text-sm font-medium text-gray-500 mb-2">
            Step {step + 1} of {STEP_NAMES.length} &mdash; {STEP_NAMES[step]}
          </p>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#003365] rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {renderStep()}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg mt-6">
            {error}
          </p>
        )}

        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          {step > 0 ? (
            <Button type="button" variant="outline" onClick={handlePrev}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <Button type="button" variant="primary" onClick={handleNext}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button type="button" variant="primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
