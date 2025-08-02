import { useState, useRef, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'

interface UseAudioRecorderProps {
  onTranscription: (text: string) => void
}

export const useAudioRecorder = ({ onTranscription }: UseAudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const recognitionRef = useRef<any>(null)
  const { toast } = useToast()

  const startRecording = useCallback(async () => {
    try {
      // Check if browser supports Speech Recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      
      if (!SpeechRecognition) {
        throw new Error('Speech recognition is not supported in this browser')
      }

      const recognition = new SpeechRecognition()
      recognitionRef.current = recognition

      // Configure speech recognition
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US' // Default to English, but it auto-detects

      recognition.onstart = () => {
        console.log('Speech recognition started')
        setIsRecording(true)
      }

      recognition.onresult = (event) => {
        console.log('Speech recognition result:', event)
        const transcript = event.results[0][0].transcript
        console.log('Transcribed text:', transcript)
        onTranscription(transcript)
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
        
        let errorMessage = 'Speech recognition failed'
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.'
            break
          case 'audio-capture':
            errorMessage = 'Microphone not accessible. Please check permissions.'
            break
          case 'not-allowed':
            errorMessage = 'Microphone permission denied. Please allow microphone access.'
            break
          case 'network':
            errorMessage = 'Network error occurred during speech recognition.'
            break
        }
        
        toast({
          title: "Speech Recognition Error",
          description: errorMessage,
          variant: "destructive",
        })
      }

      recognition.onend = () => {
        console.log('Speech recognition ended')
        setIsRecording(false)
      }

      // Start recognition
      recognition.start()
      
    } catch (error) {
      console.error('Error starting speech recognition:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start speech recognition",
        variant: "destructive",
      })
    }
  }, [toast, onTranscription])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      console.log('Stopping speech recognition')
      recognitionRef.current.stop()
    }
  }, [isRecording])

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording
  }
}