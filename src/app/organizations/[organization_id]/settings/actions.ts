import { updateOrganization } from '@/models/organization'

export async function saveSettings(organization_id: string, formData: FormData) {
    let payload: {
        [k: string]: string
    } = {}
    formData.forEach(function (value, key) {
        if ([
            'name',
            'short_name',
            'email',
            'phone',
            'contact_first_name',
            'contact_last_name',
            'logo'
        ].includes(key)) payload[key] = value as string
    })

    return await updateOrganization(organization_id, payload)
}