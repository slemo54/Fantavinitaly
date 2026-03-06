import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

const usersToMigrate = [
    { email: 'andrea.cariglia@w2d.it', firstName: 'Andrea', lastName: 'Cariglia', role: 'user' },
    { email: 'karla.ravagnolo@w2d.it', firstName: 'Karla', lastName: 'Ravagnolo', role: 'admin' },
    { email: 'marco.rossi@w2d.it', firstName: 'Marco', lastName: 'Rossi', role: 'user' },
    { email: 'giulia.bianchi@w2d.it', firstName: 'Giulia', lastName: 'Bianchi', role: 'user' },
]

export async function migrateUsers() {
    console.log('Starting user migration...')

    for (const user of usersToMigrate) {
        const password = `${user.lastName.toLowerCase()}W2D`
        const displayName = `${user.firstName} ${user.lastName}`

        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: user.email,
            password: password,
            email_confirm: true,
            user_metadata: { display_name: displayName }
        })

        if (authError) {
            if (authError.message.includes('already registered')) {
                console.log(`User ${user.email} already exists, skipping auth creation.`)
                // Still update profile just in case
                const { data: existingUser } = await supabase.from('profiles').select('id').eq('email', user.email).single()
                if (existingUser) {
                    await supabase.from('profiles').update({ role: user.role, display_name: displayName }).eq('id', existingUser.id)
                }
            } else {
                console.error(`Error creating auth user ${user.email}:`, authError.message)
            }
            continue
        }

        if (authData.user) {
            console.log(`Created auth user ${user.email} with password ${password}`)

            // Profile is usually created by a trigger on auth.users, 
            // but we ensure it's updated with the correct role and name.
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    display_name: displayName,
                    role: user.role,
                })
                .eq('id', authData.user.id)

            if (profileError) {
                console.error(`Error updating profile for ${user.email}:`, profileError.message)
            }
        }
    }

    console.log('Migration finished.')
}
