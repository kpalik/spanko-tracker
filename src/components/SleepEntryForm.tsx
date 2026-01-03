import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { Moon, Coffee, Activity, Save, Loader2, Calendar as CalendarIcon, ChevronDown, ChevronUp } from 'lucide-react'
import Calendar from './Calendar'

// --- Helper Components ---
const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2">
        <Icon className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
    </div>
)

const InputGroup = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
        {children}
    </div>
)

const RatingInput = ({ value, onChange, label }: { value: number, onChange: (v: number) => void, label: string }) => (
    <InputGroup label={label}>
        <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors ${value === star
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                        : 'bg-zinc-800 text-gray-500 hover:bg-zinc-700'
                        }`}
                >
                    {star}
                </button>
            ))}
        </div>
    </InputGroup>
)

// --- Main Form Component ---
export default function SleepEntryForm() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [showCalendar, setShowCalendar] = useState(false)

    // Form State
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])

    // Sleep Params
    const [bedTime, setBedTime] = useState('')
    const [lightsOutDelay, setLightsOutDelay] = useState<number | ''>('')
    const [sleepLatency, setSleepLatency] = useState<number | ''>('')
    const [awakeningsCount, setAwakeningsCount] = useState<number | ''>('')
    const [awakeningsMinutes, setAwakeningsMinutes] = useState<number | ''>('')
    const [wakeUpDelay, setWakeUpDelay] = useState<number | ''>('')
    const [getUpTime, setGetUpTime] = useState('')

    // Hygiene
    const [naps, setNaps] = useState('')
    const [caffeine, setCaffeine] = useState('')
    const [activity, setActivity] = useState('')
    const [alcohol, setAlcohol] = useState('')
    const [meds, setMeds] = useState('')

    // Ratings
    const [sleepQuality, setSleepQuality] = useState(0)
    const [morningFeeling, setMorningFeeling] = useState(0)
    const [yesterdayFeeling, setYesterdayFeeling] = useState(0)

    // Fetch data when date changes
    useEffect(() => {
        if (!user || !date) return

        const loadData = async () => {
            setFetching(true)
            setMessage(null)
            try {
                const { data, error } = await supabase
                    .from('daily_sleep_logs')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('date', date)
                    .maybeSingle()

                if (error) throw error

                if (data) {
                    // Populate Form
                    setBedTime(data.bed_time ? data.bed_time.split('T')[1].substring(0, 5) : '')
                    setLightsOutDelay(data.lights_out_delay_minutes ?? '')
                    setSleepLatency(data.sleep_latency_minutes ?? '')
                    setAwakeningsCount(data.awakenings_count ?? '')
                    setAwakeningsMinutes(data.awakenings_total_minutes ?? '')
                    setWakeUpDelay(data.wake_up_delay_minutes ?? '')
                    setGetUpTime(data.get_up_time ? data.get_up_time.split('T')[1].substring(0, 5) : '')

                    setNaps(data.naps_details ?? '')
                    setCaffeine(data.caffeine_details ?? '')
                    setActivity(data.physical_activity_details ?? '')
                    setAlcohol(data.alcohol_details ?? '')
                    setMeds(data.medication_details ?? '')

                    setSleepQuality(data.sleep_quality_rating ?? 0)
                    setMorningFeeling(data.morning_feeling_rating ?? 0)
                    setYesterdayFeeling(data.yesterday_feeling_rating ?? 0)

                    if (!showCalendar) { // Don't spam message if browsing via calendar
                        setMessage({ type: 'success', text: 'Załadowano dane z tego dnia.' })
                    }
                } else {
                    // Clear Form
                    setBedTime('')
                    setLightsOutDelay('')
                    setSleepLatency('')
                    setAwakeningsCount('')
                    setAwakeningsMinutes('')
                    setWakeUpDelay('')
                    setGetUpTime('')

                    setNaps('')
                    setCaffeine('')
                    setActivity('')
                    setAlcohol('')
                    setMeds('')

                    setSleepQuality(0)
                    setMorningFeeling(0)
                    setYesterdayFeeling(0)
                }
            } catch (err: any) {
                console.error('Error fetching data:', err)
                setMessage({ type: 'error', text: 'Błąd pobierania danych.' })
            } finally {
                setFetching(false)
            }
        }

        loadData()
    }, [date, user]) // Removed showCalendar dep

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return
        setLoading(true)
        setMessage(null)

        try {
            const payload = {
                user_id: user.id,
                date,
                // Params
                bed_time: bedTime ? `${date}T${bedTime}:00` : null, // Simplification
                lights_out_delay_minutes: lightsOutDelay === '' ? null : lightsOutDelay,
                sleep_latency_minutes: sleepLatency === '' ? null : sleepLatency,
                awakenings_count: awakeningsCount === '' ? null : awakeningsCount,
                awakenings_total_minutes: awakeningsMinutes === '' ? null : awakeningsMinutes,
                wake_up_delay_minutes: wakeUpDelay === '' ? null : wakeUpDelay,
                get_up_time: getUpTime ? `${date}T${getUpTime}:00` : null,
                // Hygiene
                naps_details: naps,
                caffeine_details: caffeine,
                physical_activity_details: activity,
                alcohol_details: alcohol,
                medication_details: meds,
                // Ratings
                sleep_quality_rating: sleepQuality || null,
                morning_feeling_rating: morningFeeling || null,
                yesterday_feeling_rating: yesterdayFeeling || null
            }

            const { error } = await supabase
                .from('daily_sleep_logs')
                .upsert(payload, { onConflict: 'user_id, date' })

            if (error) throw error

            setMessage({ type: 'success', text: 'Zapisano pomyślnie!' })
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 space-y-8 pb-32">
            {/* Header / Date Selection */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                <div
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-800/50 transition-colors"
                    onClick={() => setShowCalendar(!showCalendar)}
                >
                    <div className="flex items-center gap-3">
                        <CalendarIcon className="w-5 h-5 text-indigo-400" />
                        <div>
                            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Wybrana Data</p>
                            <p className="text-white font-bold text-lg">{date}</p>
                        </div>
                    </div>
                    {showCalendar ? <ChevronUp className="w-5 h-5 text-zinc-500" /> : <ChevronDown className="w-5 h-5 text-zinc-500" />}
                </div>

                {showCalendar && (
                    <div className="p-4 border-t border-zinc-800 bg-zinc-900">
                        <Calendar
                            selectedDate={date}
                            onDateSelect={(d) => {
                                setDate(d)
                                // setTimeout(() => setShowCalendar(false), 200) // Optional auto-close
                            }}
                        />
                    </div>
                )}
            </div>

            {fetching ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
            ) : (
                <>
                    {/* 1. Sleep Parameters */}
                    <div className="bg-zinc-900 p-6 rounded-2xl shadow-xl border border-zinc-800">
                        <SectionHeader icon={Moon} title="Parametry Snu (Miniona Noc)" />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputGroup label="Poszłam do łóżka">
                                <input type="time" value={bedTime} onChange={e => setBedTime(e.target.value)} className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-3 text-white" />
                            </InputGroup>
                            <InputGroup label="Wstałam z łóżka">
                                <input type="time" value={getUpTime} onChange={e => setGetUpTime(e.target.value)} className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-3 text-white" />
                            </InputGroup>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputGroup label="Zgaszenie światła (ile minut od położenia się)">
                                <input type="number" value={lightsOutDelay} onChange={e => setLightsOutDelay(Number(e.target.value))} className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-3 text-white" />
                            </InputGroup>
                            <InputGroup label="Czas zasypiania (ile minut)">
                                <input type="number" value={sleepLatency} onChange={e => setSleepLatency(Number(e.target.value))} className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-3 text-white" />
                            </InputGroup>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputGroup label="Liczba przebudzeń">
                                <input type="number" value={awakeningsCount} onChange={e => setAwakeningsCount(Number(e.target.value))} className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-3 text-white" />
                            </InputGroup>
                            <InputGroup label="Czas przebudzeń (orientacyjnie minut)">
                                <input type="number" value={awakeningsMinutes} onChange={e => setAwakeningsMinutes(Number(e.target.value))} className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-3 text-white" />
                            </InputGroup>
                        </div>
                        <InputGroup label="Czas do wstania z łóżka (od przebudzenia, w minutach)">
                            <input type="number" value={wakeUpDelay} onChange={e => setWakeUpDelay(Number(e.target.value))} className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-3 text-white" />
                        </InputGroup>
                    </div>

                    {/* 2. Hygiene */}
                    <div className="bg-zinc-900 p-6 rounded-2xl shadow-xl border border-zinc-800">
                        <SectionHeader icon={Coffee} title="Higiena (Dzień Poprzedni)" />

                        <InputGroup label="Drzemki (godzina, czas trwania)">
                            <input type="text" value={naps} onChange={e => setNaps(e.target.value)} placeholder="np. 14:00, 20 min" className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-3 text-white" />
                        </InputGroup>
                        <InputGroup label="Kofeina (ilość/godzina)">
                            <input type="text" value={caffeine} onChange={e => setCaffeine(e.target.value)} placeholder="np. 2 kawy, ost. 15:00" className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-3 text-white" />
                        </InputGroup>
                        <InputGroup label="Aktywność fizyczna (rodzaj/czas)">
                            <input type="text" value={activity} onChange={e => setActivity(e.target.value)} placeholder="np. Spacer 30min, 18:00" className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-3 text-white" />
                        </InputGroup>
                        <InputGroup label="Alkohol (wieczorem)">
                            <input type="text" value={alcohol} onChange={e => setAlcohol(e.target.value)} placeholder="Brak" className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-3 text-white" />
                        </InputGroup>
                        <InputGroup label="Leki nasenne/inne">
                            <input type="text" value={meds} onChange={e => setMeds(e.target.value)} placeholder="Brak" className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-3 text-white" />
                        </InputGroup>
                    </div>

                    {/* 3. Ratings */}
                    <div className="bg-zinc-900 p-6 rounded-2xl shadow-xl border border-zinc-800">
                        <SectionHeader icon={Activity} title="Samopoczucie (1-5)" />
                        <RatingInput label="Jakość snu minionej nocy" value={sleepQuality} onChange={setSleepQuality} />
                        <RatingInput label="Samopoczucie dziś rano" value={morningFeeling} onChange={setMorningFeeling} />
                        <RatingInput label="Samopoczucie wczoraj w ciągu dnia" value={yesterdayFeeling} onChange={setYesterdayFeeling} />
                    </div>
                </>
            )}

            {/* Submit Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-md border-t border-zinc-800 flex flex-col gap-2 z-20">
                {message && (
                    <div className={`text-center text-sm font-medium ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                        {message.text}
                    </div>
                )}
                <button
                    type="submit"
                    disabled={loading || fetching}
                    className="w-full max-w-2xl mx-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5" />}
                    {loading ? 'Zapisywanie...' : 'Zapisz Dziennik'}
                </button>
            </div>
        </form>
    )
}
