import { useState, FormEvent } from 'react'
import { Loader2, ChevronDown, AlertCircle } from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────
export interface CarFormData {
  brand: string
  model_year: number
  kilometers_driven: number
  fuel_type: string
  transmission: string
  engine_cc: number
  owner_count: number
  mileage: number
}

interface CarFormProps {
  onSubmit: (data: CarFormData) => Promise<void>
  loading: boolean
  apiError: string | null
}

// ── Constants ────────────────────────────────────────────────────────────────
const BRANDS = [
  'Maruti Suzuki', 'Hyundai', 'Tata', 'Honda', 'Toyota',
  'Kia', 'Mahindra', 'Volkswagen', 'Skoda', 'Renault',
]

const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid']
const TRANSMISSIONS = ['Manual', 'Automatic']
const YEARS = Array.from({ length: 17 }, (_, i) => 2026 - i)

// ── Validation ───────────────────────────────────────────────────────────────
type Errors = Partial<Record<keyof CarFormData, string>>

function validate(f: Partial<CarFormData>): Errors {
  const e: Errors = {}
  if (!f.brand) e.brand = 'Car brand is required.'
  if (!f.model_year) e.model_year = 'Manufacturing year is required.'
  if (f.kilometers_driven === undefined || f.kilometers_driven === null || isNaN(f.kilometers_driven as number)) {
    e.kilometers_driven = 'Kilometers driven is required.'
  } else if ((f.kilometers_driven as number) < 0) {
    e.kilometers_driven = 'Kilometers cannot be negative.'
  } else if ((f.kilometers_driven as number) > 1_000_000) {
    e.kilometers_driven = 'Please enter a realistic value (≤ 10,00,000 km).'
  }
  if (!f.fuel_type) e.fuel_type = 'Fuel type is required.'
  if (!f.transmission) e.transmission = 'Transmission is required.'
  if (f.fuel_type !== 'Electric') {
    if (f.engine_cc === undefined || f.engine_cc === null || isNaN(f.engine_cc as number)) {
      e.engine_cc = 'Engine capacity is required.'
    } else if ((f.engine_cc as number) <= 0) {
      e.engine_cc = 'Engine CC must be a positive number.'
    } else if ((f.engine_cc as number) > 6000) {
      e.engine_cc = 'Engine CC seems too high (max 6000 cc).'
    }
  }
  if (!f.owner_count) e.owner_count = 'Owner count is required.'
  if (f.mileage === undefined || f.mileage === null || isNaN(f.mileage as number)) {
    e.mileage = f.fuel_type === 'Electric' ? 'Range (km) is required.' : 'Mileage is required.'
  } else if ((f.mileage as number) <= 0) {
    e.mileage = 'Mileage must be a positive number.'
  }
  return e
}

// ── Helper ────────────────────────────────────────────────────────────────────
function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <ChevronDown size={15} className="text-gray-500" />
      </div>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function CarForm({ onSubmit, loading, apiError }: CarFormProps) {
  const [form, setForm] = useState<Partial<CarFormData>>({})
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof CarFormData, boolean>>>({})

  const isElectric = form.fuel_type === 'Electric'

  function handleChange(field: keyof CarFormData, raw: string) {
    const numFields: (keyof CarFormData)[] = [
      'model_year', 'kilometers_driven', 'engine_cc', 'owner_count', 'mileage',
    ]
    const value = numFields.includes(field) ? (raw === '' ? undefined : Number(raw)) : raw
    const next = { ...form, [field]: value }

    // Auto-zero engine_cc for Electric
    if (field === 'fuel_type' && raw === 'Electric') {
      next.engine_cc = 0
    }
    setForm(next)

    // Live validation for touched fields
    if (touched[field]) {
      setErrors(validate(next))
    }
  }

  function handleBlur(field: keyof CarFormData) {
    setTouched((t) => ({ ...t, [field]: true }))
    setErrors(validate(form))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    // Mark all touched
    const allTouched = Object.fromEntries(
      (Object.keys(form) as (keyof CarFormData)[]).map((k) => [k, true])
    ) as Partial<Record<keyof CarFormData, boolean>>
    setTouched(allTouched)

    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    await onSubmit(form as CarFormData)
  }

  function fieldError(field: keyof CarFormData) {
    return touched[field] && errors[field] ? (
      <p className="error-text flex items-center gap-1">
        <AlertCircle size={11} />
        {errors[field]}
      </p>
    ) : null
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

        {/* Brand */}
        <div>
          <label className="label">Car Brand *</label>
          <SelectWrapper>
            <select
              className={`select-field ${touched.brand && errors.brand ? 'border-red-500' : ''}`}
              value={form.brand ?? ''}
              onChange={(e) => handleChange('brand', e.target.value)}
              onBlur={() => handleBlur('brand')}
            >
              <option value="">Select brand</option>
              {BRANDS.map((b) => <option key={b}>{b}</option>)}
            </select>
          </SelectWrapper>
          {fieldError('brand')}
        </div>

        {/* Year */}
        <div>
          <label className="label">Manufacturing Year *</label>
          <SelectWrapper>
            <select
              className={`select-field ${touched.model_year && errors.model_year ? 'border-red-500' : ''}`}
              value={form.model_year ?? ''}
              onChange={(e) => handleChange('model_year', e.target.value)}
              onBlur={() => handleBlur('model_year')}
            >
              <option value="">Select year</option>
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </SelectWrapper>
          {fieldError('model_year')}
        </div>

        {/* Kilometers */}
        <div>
          <label className="label">Kilometers Driven *</label>
          <input
            type="number"
            min={0}
            placeholder="e.g. 35000"
            className={`input-field ${touched.kilometers_driven && errors.kilometers_driven ? 'border-red-500' : ''}`}
            value={form.kilometers_driven ?? ''}
            onChange={(e) => handleChange('kilometers_driven', e.target.value)}
            onBlur={() => handleBlur('kilometers_driven')}
          />
          {fieldError('kilometers_driven')}
        </div>

        {/* Fuel Type */}
        <div>
          <label className="label">Fuel Type *</label>
          <SelectWrapper>
            <select
              className={`select-field ${touched.fuel_type && errors.fuel_type ? 'border-red-500' : ''}`}
              value={form.fuel_type ?? ''}
              onChange={(e) => handleChange('fuel_type', e.target.value)}
              onBlur={() => handleBlur('fuel_type')}
            >
              <option value="">Select fuel type</option>
              {FUEL_TYPES.map((f) => <option key={f}>{f}</option>)}
            </select>
          </SelectWrapper>
          {fieldError('fuel_type')}
        </div>

        {/* Transmission */}
        <div>
          <label className="label">Transmission *</label>
          <SelectWrapper>
            <select
              className={`select-field ${touched.transmission && errors.transmission ? 'border-red-500' : ''}`}
              value={form.transmission ?? ''}
              onChange={(e) => handleChange('transmission', e.target.value)}
              onBlur={() => handleBlur('transmission')}
            >
              <option value="">Select transmission</option>
              {TRANSMISSIONS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </SelectWrapper>
          {fieldError('transmission')}
        </div>

        {/* Engine CC */}
        <div>
          <label className="label">
            Engine Capacity (cc){isElectric ? ' — N/A for Electric' : ' *'}
          </label>
          <input
            type="number"
            min={0}
            placeholder={isElectric ? 'Not applicable' : 'e.g. 1197'}
            className={`input-field ${isElectric ? 'opacity-50 cursor-not-allowed' : ''} ${
              touched.engine_cc && errors.engine_cc ? 'border-red-500' : ''
            }`}
            value={isElectric ? 0 : (form.engine_cc ?? '')}
            disabled={isElectric}
            onChange={(e) => handleChange('engine_cc', e.target.value)}
            onBlur={() => handleBlur('engine_cc')}
          />
          {!isElectric && fieldError('engine_cc')}
          {isElectric && (
            <p className="text-xs text-gray-500 mt-1.5">Set to 0 automatically for Electric vehicles.</p>
          )}
        </div>

        {/* Owner Count */}
        <div>
          <label className="label">Previous Owners *</label>
          <SelectWrapper>
            <select
              className={`select-field ${touched.owner_count && errors.owner_count ? 'border-red-500' : ''}`}
              value={form.owner_count ?? ''}
              onChange={(e) => handleChange('owner_count', e.target.value)}
              onBlur={() => handleBlur('owner_count')}
            >
              <option value="">Select owners</option>
              <option value={1}>1 (First Owner)</option>
              <option value={2}>2 (Second Owner)</option>
              <option value={3}>3 (Third Owner)</option>
              <option value={4}>4+ (Fourth or more)</option>
            </select>
          </SelectWrapper>
          {fieldError('owner_count')}
        </div>

        {/* Mileage */}
        <div>
          <label className="label">
            {isElectric ? 'Range (km) *' : 'Mileage (km/l) *'}
          </label>
          <input
            type="number"
            step="0.1"
            min={0}
            placeholder={isElectric ? 'e.g. 400' : 'e.g. 18.5'}
            className={`input-field ${touched.mileage && errors.mileage ? 'border-red-500' : ''}`}
            value={form.mileage ?? ''}
            onChange={(e) => handleChange('mileage', e.target.value)}
            onBlur={() => handleBlur('mileage')}
          />
          {fieldError('mileage')}
          {isElectric && (
            <p className="text-xs text-gray-500 mt-1.5">Enter the real-world range in km for EVs.</p>
          )}
        </div>
      </div>

      {/* API Error */}
      {apiError && (
        <div className="mt-5 p-4 bg-red-900/30 border border-red-700/50 rounded-xl flex items-start gap-3">
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-red-300 text-sm">{apiError}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full mt-6 flex items-center justify-center gap-2 py-3.5 text-base"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Analysing…
          </>
        ) : (
          <>
            Predict Price
          </>
        )}
      </button>
    </form>
  )
}
