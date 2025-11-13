export async function uploadImages(
  files: File[],
  folderPath: string
): Promise<string[]> {
  if (files.length === 0) {
    return []
  }

  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file)
  })
  formData.append('folderPath', folderPath)

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to upload images')
  }

  const data = await response.json()
  return data.urls || []
}

