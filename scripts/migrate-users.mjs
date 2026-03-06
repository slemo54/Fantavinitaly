import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

const usersToMigrate = [
    { username: 'andreacariglia', display_name: 'Andrea Cariglia', cognome: 'Cariglia' },
    { username: 'andreadarra', display_name: 'Andrea Darra', cognome: 'Darra' },
    { username: 'andreamattei', display_name: 'Andrea Mattei', cognome: 'Mattei' },
    { username: 'anselmoacquah', display_name: 'Anselmo Acquah', cognome: 'Acquah' },
    { username: 'beatricemotterle', display_name: 'Beatrice Motterle', cognome: 'Motterle' },
    { username: 'cynthiachaplin', display_name: 'Cynthia Chaplin', cognome: 'Chaplin' },
    { username: 'davidezanella', display_name: 'Davide Zanella', cognome: 'Zanella' },
    { username: 'elenavoloshina', display_name: 'Elena Voloshina', cognome: 'Voloshina' },
    { username: 'elenazilotova', display_name: 'Elena Zilotova', cognome: 'Zilotova' },
    { username: 'federicozocca', display_name: 'Federico Zocca', cognome: 'Zocca' },
    { username: 'giorgiarangoni', display_name: 'Giorgia Rangoni', cognome: 'Rangoni' },
    { username: 'karlaravagnolo', display_name: 'Karla Ravagnolo', cognome: 'Ravagnolo', role: 'admin' },
    { username: 'manuelaclarizia', display_name: 'Manuela Clarizia', cognome: 'Clarizia' },
    { username: 'marcogandini', display_name: 'Marco Gandini', cognome: 'Gandini' },
    { username: 'marinalovato', display_name: 'Marina Lovato', cognome: 'Lovato' },
    { username: 'michelaguerra', display_name: 'Michela Guerra', cognome: 'Guerra' },
    { username: 'miriamferrari', display_name: 'Miriam Ferrari', cognome: 'Ferrari' },
    { username: 'rozazharmukhambetova', display_name: 'Roza Zharmukhambetova', cognome: 'Zharmukhambetova' },
    { username: 'richardhough', display_name: 'Richard Hough', cognome: 'Hough' },
    { username: 'saralacagnina', display_name: 'Sara La Cagnina', cognome: 'Lacagnina' },
    { username: 'sarazambon', display_name: 'Sara Zambon', cognome: 'Zambon' },
    { username: 'simonegallo', display_name: 'Simone Gallo', cognome: 'Gallo' },
    { username: 'valeriabianchin', display_name: 'Valeria Bianchin', cognome: 'Bianchin' },
    { username: 'veronicapimazzon', display_name: 'Veronica Pimazzon', cognome: 'Pimazzon' }
]

async function migrate() {
    console.log('🍷 Inizio migrazione utenti Fanta Vinitaly...')

    for (const user of usersToMigrate) {
        const email = `${user.username}@w2d.it`
        const password = `${user.cognome}W2D`

        console.log(`Migrazione di ${user.display_name} (${email})...`)

        // Create actual auth user
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: { display_name: user.display_name }
        })

        if (authError) {
            if (authError.message.includes('already exists')) {
                console.warn(`User ${email} already exists in auth. Skipping.`)
            } else {
                console.error(`Error creating auth user ${email}:`, authError.message)
                continue
            }
        } else {
            // Create profile (though trigger might have done it, let's be explicit and update attributes)
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    display_name: user.display_name,
                    role: user.role || 'user'
                })
                .eq('id', authUser.user.id)

            if (profileError) {
                console.error(`Error updating profile for ${email}:`, profileError.message)
            } else {
                console.log(`✅ ${user.display_name} migrato con successo!`)
            }
        }
    }

    console.log('🍷 Migrazione completata!')
}

migrate()
