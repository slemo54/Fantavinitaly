export type Profile = {
    id: string
    email: string
    display_name: string
    role: 'admin' | 'user'
    avatar_url?: string
    balance: number
    total_malus_received: number
    created_at: string
    updated_at: string
}

export type MalusType = {
    id: string
    name: string
    amount: number
    icon?: string
    description?: string
    is_active: boolean
    created_by?: string
    created_at: string
}

export type TransactionStatus = 'pending' | 'approved' | 'rejected' | 'contested' | 'cancelled'

export type Transaction = {
    id: string
    target_user_id: string
    proposed_by_user_id: string
    malus_type_id: string
    amount: number
    description?: string
    status: TransactionStatus
    judged_by_user_id?: string
    judged_at?: string
    contester_at?: string
    contestation_reason?: string
    created_at: string
    updated_at: string
}

export type EmailLog = {
    id: string
    user_id: string
    email_type: 'transaction' | 'sponsor_milestone' | 'pending_alert' | 'contestation' | 'judged'
    metadata?: any
    sent_at: string
}
