'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function NotificationManager() {
    const supabase = createClient()

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            registerServiceWorker()
        }
    }, [])

    async function registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js')
            console.log('Service Worker registered with scope:', registration.scope)

            // Request permission
            const permission = await Notification.requestPermission()
            if (permission === 'granted') {
                console.log('Notification permission granted.')
                // In a real app, you'd subscribe here and send subscription to Supabase
            }
        } catch (error) {
            console.error('Service Worker registration failed:', error)
        }
    }

    return null // This component doesn't render anything
}
