import { Share, PlusSquare, X } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function InstallInstructions() {
    const [show, setShow] = useState(false)

    useEffect(() => {
        // Detect iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
        // Detect if already standalone (installed)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone

        // Show only on iOS and if not installed
        if (isIOS && !isStandalone) {
            setShow(true)
        }
    }, [])

    if (!show) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-50 animate-in slide-in-from-bottom">
            <div className="relative bg-zinc-800/90 backdrop-blur-md rounded-2xl p-6 border border-zinc-700 shadow-2xl">
                <button
                    onClick={() => setShow(false)}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>

                <h3 className="text-lg font-bold text-white mb-2">Zainstaluj aplikację</h3>
                <p className="text-zinc-300 text-sm mb-4">
                    Aby dodać Spanko Tracker do ekranu głównego:
                </p>

                <div className="space-y-3 text-sm text-zinc-300">
                    <div className="flex items-center gap-3">
                        <Share className="w-5 h-5 text-blue-400" />
                        <span>1. Kliknij przycisk <span className="font-bold text-blue-400">Udostępnij</span> na pasku Safari</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <PlusSquare className="w-5 h-5 text-gray-400" />
                        <span>2. Wybierz <span className="font-bold text-white">Do ekranu początkowego</span></span>
                    </div>
                </div>
            </div>
        </div>
    )
}
