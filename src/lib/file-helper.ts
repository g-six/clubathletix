
async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)

        reader.onload = () => resolve(reader.result as string)
        reader.onerror = error => reject(error)
    })
}

export async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files.length > 0) {
        const file = event.target.files[0]
        try {
            const base64String = await fileToBase64(file)
            return base64String
        } catch (error) {
            console.error("Error converting file to Base64:", error)
        }
    }
}

export async function onVideoFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files.length > 0) {
        const file = event.target.files[0]
        try {
            return {
                file,
                size: file.size
            }
        } catch (error) {
            console.error("Error converting file to Base64:", error)
        }
    }
}