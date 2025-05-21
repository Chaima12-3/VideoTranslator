import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface Language {
  code: string
  name: string
}

interface ApiResponse {
  job_id?: string
  status?: string
  result?: string
  error?: string
}

const languages: Language[] = [
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese' },
]

type Status = 'idle' | 'uploading' | 'processing' | 'completed' | 'error'

export default function VideoTranslator() {
  const [file, setFile] = useState<File | null>(null)
  const [language, setLanguage] = useState<string>('es')
  const [jobId, setJobId] = useState<string>('')
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<string>('')

  const handleSubmit = async () => {
    if (!file) {
      toast.error('Please select a file')
      return
    }

    setStatus('uploading')
    const toastId = toast.loading('Uploading file...')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('target_language', language)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`)
      }

      const data: ApiResponse = await response.json()
      if (!data.job_id) {
        throw new Error('No job ID received from server')
      }

      setJobId(data.job_id)
      setStatus('processing')
      toast.success('File uploaded successfully!', { id: toastId })
    } catch (error: unknown) {
      setStatus('error')
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      toast.error(errorMessage, { id: toastId })
    }
  }

  useEffect(() => {
    if (!jobId || status !== 'processing') return

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/status?id=${jobId}`)
        if (!response.ok) {
          throw new Error(`Status check failed with status ${response.status}`)
        }

        const data: ApiResponse = await response.json()

        if (data.status === 'completed' && data.result) {
          setResult(data.result)
          setStatus('completed')
          toast.success('Translation complete!')
          clearInterval(interval)
        } else if (data.status === 'error') {
          throw new Error(data.error || 'Processing failed')
        }
      } catch (error: unknown) {
        setStatus('error')
        const errorMessage = error instanceof Error ? error.message : 'Failed to check status'
        toast.error(errorMessage)
        clearInterval(interval)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [jobId, status])

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Video Transcription & Translation</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block mb-2 text-sm font-medium">MP4 Video File</label>
          <Input
            type="file"
            accept=".mp4"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>
        
        <div>
          <label className="block mb-2 text-sm font-medium">Target Language</label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={handleSubmit} 
          disabled={status === 'uploading' || status === 'processing'}
          className="w-full"
        >
          {status === 'uploading' ? 'Uploading...' : 
           status === 'processing' ? 'Processing...' : 'Submit'}
        </Button>
        
        {status === 'processing' && (
          <div className="flex items-center justify-center space-x-2 p-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
            <span>Processing your video...</span>
          </div>
        )}
        
        {status === 'completed' && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Translation Result</h2>
            <div className="bg-gray-100 p-4 rounded whitespace-pre-wrap">{result}</div>
          </div>
        )}
      </div>
    </div>
  )
}