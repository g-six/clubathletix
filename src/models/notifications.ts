export async function createEmailNotification({
    sender,
    receiver,
    TemplateModel,
    TemplateId = 39180237
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