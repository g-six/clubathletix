const webPush = require('web-push')
const fs = require('fs')

const vapidKeys = webPush.generateVAPIDKeys()

const envData = `
NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}
NEXT_PUBLIC_VAPID_PRIVATE_KEY=${vapidKeys.privateKey}
`

console.log(envData)
