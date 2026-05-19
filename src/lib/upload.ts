// lib/upload.ts
export async function uploadCsv(
    file: File,
    onProgress: (pct: number) => void,
): Promise<{ importId: string }> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        const form = new FormData()
        form.append('file', file)

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                onProgress(Math.round((e.loaded / e.total) * 100))
            }
        })

        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(JSON.parse(xhr.responseText)) // { importId }
            } else {
                reject(new Error(`Upload failed: ${xhr.status}`))
            }
        })

        xhr.addEventListener('error', () => reject(new Error('Network error')))

        xhr.open('POST', '/api/import/upload')
        xhr.send(form)
    })
}
