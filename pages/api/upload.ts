import type { NextApiRequest, NextApiResponse } from 'next'

interface UploadResponse {
  job_id?: string
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const formData = new FormData()
    // Add type checking for the request body
    if (!req.body?.file || !req.body?.target_language) {
      throw new Error('Missing file or target language')
    }
    
    formData.append('file', req.body.file)
    formData.append('target_language', req.body.target_language)

    const backendResponse = await fetch(`${process.env.BACKEND_URL}/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!backendResponse.ok) {
      throw new Error(`Backend upload failed with status ${backendResponse.status}`)
    }

    const data = await backendResponse.json()
    return res.status(200).json(data)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Upload failed due to unknown error'
    return res.status(500).json({ error: errorMessage })
  }
}