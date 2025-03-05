export const TEAM_INVITATION_TEMPLATE = 39203872
export const ADDED_TO_TEAM_TEMPLATE = 39188601
export const INVITED_TO_CLUB_TEMPLATE = 39180237

export async function createEmailNotification({
    sender,
    receiver,
    TemplateModel,
    TemplateId = INVITED_TO_CLUB_TEMPLATE
}: {
    sender: {
        email: string,
        name: string
    }
    receiver: {
        email: string,
        name: string
    }
    TemplateId?: string | number,
    TemplateModel: {
        [k: string]: string | undefined
    }
}) {
    const { POSTMARK_SERVER_TOKEN, POSTMARK_ENTRYPOINT, } = process.env as { [k: string]: string }
    const emailData = {
        From: 'Club Athletix <rey@clubathletix.com>',
        Cc: `${sender.name} <${sender.email}>`,
        ReplyTo: `${sender.name} <${sender.email}>`,
        To: `${receiver.name} <${receiver.email}>`,
        TemplateId,
        TemplateModel
    }
    const postMarkHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Postmark-Server-Token': POSTMARK_SERVER_TOKEN,
    }

    const mail = await fetch(`${POSTMARK_ENTRYPOINT}/withTemplate`, {
        method: 'POST',
        headers: postMarkHeaders,
        body: JSON.stringify(emailData)
    })

    console.log(JSON.stringify({ emailData, mail }, null, 2))
    return mail
}