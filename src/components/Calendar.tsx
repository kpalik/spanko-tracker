import { useState, useEffect } from 'react'
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth, addMonths, subMonths, isToday } from 'date-fns'
import { pl } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs))
}

export default function Calendar({ selectedDate, onDateSelect }: { selectedDate: string, onDateSelect: (date: string) => void }) {
    const { user } = useAuth()
    const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate))
    const [loggedDates, setLoggedDates] = useState<string[]>([])

    useEffect(() => {
        if (!user) return

        const fetchLoggedDates = async () => {
            const start = startOfMonth(currentMonth).toISOString()
            const end = endOfMonth(currentMonth).toISOString()

            const { data } = await supabase
                .from('daily_sleep_logs')
                .select('date')
                .eq('user_id', user.id)
                .gte('date', start)
                .lte('date', end)

            if (data) {
                setLoggedDates(data.map(d => d.date))
            }
        }

        fetchLoggedDates()
    }, [currentMonth, user])

    const days = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth)
    })

    // Adjust grid start (Monday)
    const startDay = startOfMonth(currentMonth).getDay();
    const paddingDays = startDay === 0 ? 6 : startDay - 1; // 0 is Sunday, make Monday (1) the start

    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

    return (
        <div className="bg-zinc-900 p-4 rounded-2xl shadow-xl border border-zinc-800">
            <div className="flex items-center justify-between mb-4">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 font-bold">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="text-white font-semibold text-lg capitalize">
                    {format(currentMonth, 'LLLL yyyy', { locale: pl })}
                </h3>
                <button onClick={handleNextMonth} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 font-bold">
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs text-zinc-500 mb-2 font-medium">
                {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'].map(d => (
                    <div key={d}>{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: paddingDays }).map((_, i) => (
                    <div key={`pad-${i}`} />
                ))}

                {days.map(day => {
                    const dateStr = format(day, 'yyyy-MM-dd')
                    const isSelected = selectedDate === dateStr
                    const hasData = loggedDates.includes(dateStr)
                    const isCurrentMonth = isSameMonth(day, currentMonth)

                    return (
                        <button
                            key={dateStr}
                            onClick={() => onDateSelect(dateStr)}
                            className={cn(
                                "relative h-10 w-10 rounded-full flex items-center justify-center text-sm transition-all",
                                !isCurrentMonth && "text-zinc-600",
                                isSelected && "bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/30",
                                !isSelected && isToday(day) && "ring-1 ring-indigo-400 text-indigo-400",
                                !isSelected && !isToday(day) && "text-zinc-300 hover:bg-zinc-800",
                            )}
                        >
                            {format(day, 'd')}
                            {/* Dot indicator for existing data */}
                            {hasData && (
                                <div className={cn(
                                    "absolute bottom-1.5 w-1 h-1 rounded-full",
                                    isSelected ? "bg-white" : "bg-green-500"
                                )} />
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
