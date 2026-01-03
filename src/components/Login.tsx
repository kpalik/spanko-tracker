import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Mail, KeyRound, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [step, setStep] = useState<'email' | 'otp'>('email')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const navigate = useNavigate()

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                // We ask for OTP specifically (though magic link sends code too if configured)
                shouldCreateUser: true
            },
        })

        if (error) {
            setMessage({ type: 'error', text: error.message })
        } else {
            setStep('otp')
            setMessage({ type: 'success', text: 'Kod wysłany! Sprawdź email.' })
        }
        setLoading(false)
    }

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        const { error } = await supabase.auth.verifyOtp({
            email,
            token: otp,
            type: 'email',
        })

        if (error) {
            setMessage({ type: 'error', text: error.message })
            setLoading(false)
        } else {
            // Success! AuthContext will pick up session change
            // But we can force nav just in case
            navigate('/')
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-black p-4">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-zinc-900 p-8 shadow-2xl border border-zinc-800">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-white mb-2">
                        Spanko Tracker
                    </h2>
                    <p className="text-zinc-400">
                        {step === 'email' ? 'Zaloguj się, aby śledzić sen' : 'Wpisz kod z e-maila'}
                    </p>
                </div>

                {step === 'email' ? (
                    <form className="mt-8 space-y-6" onSubmit={handleSendOtp}>
                        <div>
                            <label htmlFor="email-address" className="sr-only">Adres e-mail</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="relative block w-full rounded-md border-0 bg-zinc-800 py-3 pl-10 text-white ring-1 ring-inset ring-zinc-700 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                    placeholder="Adres e-mail"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-3 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all gap-2"
                        >
                            {loading && <Loader2 className="animate-spin w-5 h-5" />}
                            {loading ? 'Wysyłanie...' : 'Wyślij Kod'}
                        </button>
                    </form>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
                        <div>
                            <label htmlFor="otp-code" className="sr-only">Kod z e-maila</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <KeyRound className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="otp-code"
                                    name="otp"
                                    type="text"
                                    autoComplete="one-time-code"
                                    required
                                    className="relative block w-full rounded-md border-0 bg-zinc-800 py-3 pl-10 text-white ring-1 ring-inset ring-zinc-700 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 text-center tracking-widest text-xl"
                                    placeholder="000000"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <p className="text-center text-xs text-zinc-500 mt-2 cursor-pointer hover:text-white" onClick={() => setStep('email')}>
                                Zły e-mail? Wróć
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-3 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all gap-2"
                        >
                            {loading && <Loader2 className="animate-spin w-5 h-5" />}
                            {loading ? 'Weryfikacja...' : 'Zaloguj się'}
                        </button>
                    </form>
                )}

                {message && (
                    <div className={`p-4 rounded-md text-sm text-center ${message.type === 'success' ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'}`}>
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    )
}
