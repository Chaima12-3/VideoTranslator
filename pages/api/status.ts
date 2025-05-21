import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/${id}`)
    if (!response.ok) {
      throw new Error('Failed to get status')
    }
    const data = await response.json()
    return res.status(200).json(data)
  } catch (error: unknown) { // Changed from 'any' to 'unknown'
    const err = error instanceof Error ? error.message : 'Unknown error' // Add this line
    return res.status(500).json({ 
      status: 'error',
      error: err // Use the new 'err' variable here
    })
  }
}