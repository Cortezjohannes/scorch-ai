'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createChatCompletion } from '@/services/openaiService'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

type EnhancementTarget = 'dialogue' | 'scene' | 'character' | 'plot' | 'pacing'
type EnhancementTone = 'neutral' | 'detailed' | 'concise' | 'creative' | 'practical'

interface ScriptEnhancerProps {
  initialContent?: string;
  onApplyChanges?: (enhancedContent: string) => void;
}

const ScriptEnhancer = ({ initialContent = '', onApplyChanges }: ScriptEnhancerProps) => {
  const [scriptContent, setScriptContent] = useState<string>(initialContent)
  const [enhancementTarget, setEnhancementTarget] = useState<EnhancementTarget>('dialogue')
  const [enhancementTone, setEnhancementTone] = useState<EnhancementTone>('neutral')
  const [enhancedContent, setEnhancedContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setScriptContent(initialContent);
  }, [initialContent]);

  const handleEnhance = async () => {
    if (!scriptContent.trim()) {
      setError('Please enter some script content to enhance')
      return
    }

    setIsLoading(true)
    setError(null)

    // Create a dynamic prompt based on enhancement target and tone
    let prompt = `Here is a script excerpt:\n\n${scriptContent}\n\n`
    
    switch (enhancementTarget) {
      case 'dialogue':
        prompt += 'Enhance the dialogue to make it more '
        break
      case 'scene':
        prompt += 'Improve the scene descriptions to make them more '
        break
      case 'character':
        prompt += 'Enhance the character voices and personalities to make them more '
        break
      case 'plot':
        prompt += 'Enhance the plot elements to make them more '
        break
      case 'pacing':
        prompt += 'Adjust the pacing to make it more '
        break
    }

    switch (enhancementTone) {
      case 'neutral':
        prompt += 'balanced and natural.'
        break
      case 'detailed':
        prompt += 'vivid and detailed.'
        break
      case 'concise':
        prompt += 'concise and impactful.'
        break
      case 'creative':
        prompt += 'creative and unexpected.'
        break
      case 'practical':
        prompt += 'practical and realistic.'
        break
    }

    prompt += '\n\nProvide the enhanced script in the same format as the original.'

    try {
      const response = await createChatCompletion({
        messages: [
          { role: 'system', content: 'You are an expert script writer and editor. Your task is to enhance scripts based on specific requirements without changing the core story elements.' },
          { role: 'user', content: prompt }
        ],
        model: 'gpt-4',
      })

      if (response.choices && response.choices.length > 0) {
        setEnhancedContent(response.choices[0].message.content || '')
      } else {
        setError('Failed to generate enhanced content')
      }
    } catch (err) {
      setError('Error enhancing script: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setEnhancedContent('')
  }

  const handleApply = () => {
    if (onApplyChanges && enhancedContent) {
      onApplyChanges(enhancedContent);
    }
  }

  return (
    <div className="space-y-4 max-w-full overflow-hidden">
      <Card className="border-[#36393f] bg-[#1e1f22] overflow-hidden">
        <CardHeader className="bg-[#2a2a2a] px-3 py-3 sm:px-4 sm:py-4">
          <CardTitle className="text-[#e2c376] text-base sm:text-lg md:text-xl">AI Script Enhancement</CardTitle>
        </CardHeader>
        
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <div className="text-xs sm:text-sm font-medium text-[#e7e7e7]/70 mb-1.5 sm:mb-2">Choose enhancement focus:</div>
                <Select
                  value={enhancementTarget}
                  onValueChange={(value) => setEnhancementTarget(value as EnhancementTarget)}
                >
                  <SelectTrigger id="enhancementTarget" className="w-full text-xs sm:text-sm">
                    <SelectValue placeholder="Select focus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dialogue">Dialogue</SelectItem>
                    <SelectItem value="scene">Scene Descriptions</SelectItem>
                    <SelectItem value="character">Character Development</SelectItem>
                    <SelectItem value="plot">Plot Elements</SelectItem>
                    <SelectItem value="pacing">Pacing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <div className="text-xs sm:text-sm font-medium text-[#e7e7e7]/70 mb-1.5 sm:mb-2">Enhancement style:</div>
                <Select
                  value={enhancementTone}
                  onValueChange={(value) => setEnhancementTone(value as EnhancementTone)}
                >
                  <SelectTrigger id="enhancementTone" className="w-full text-xs sm:text-sm">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="neutral">Balanced & Natural</SelectItem>
                    <SelectItem value="detailed">Vivid & Detailed</SelectItem>
                    <SelectItem value="concise">Concise & Impactful</SelectItem>
                    <SelectItem value="creative">Creative & Unexpected</SelectItem>
                    <SelectItem value="practical">Practical & Realistic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <div className="text-xs sm:text-sm font-medium text-[#e7e7e7]/70 mb-1.5 sm:mb-2">Script content:</div>
              <Textarea
                id="scriptContent"
                value={scriptContent}
                onChange={(e) => setScriptContent(e.target.value)}
                placeholder="Paste your script content here..."
                className="min-h-[150px] sm:min-h-[200px] font-mono text-xs sm:text-sm resize-y w-full"
              />
            </div>
            
            {error && (
              <div className="bg-red-900/20 border border-red-900/30 text-red-400 p-2 sm:p-3 rounded-md text-xs sm:text-sm">
                {error}
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button
                onClick={handleReset}
                variant="outline"
                className="bg-[#36393f] text-[#e7e7e7]/90 hover:bg-[#4f535a] hover:text-[#e7e7e7] text-xs sm:text-sm py-1.5 px-2.5 sm:py-2 sm:px-3"
                disabled={isLoading}
              >
                Reset
              </Button>
              <Button
                onClick={handleEnhance}
                className="bg-[#e2c376] text-black hover:bg-[#d4b46a] text-xs sm:text-sm py-1.5 px-2.5 sm:py-2 sm:px-3"
                disabled={isLoading || !scriptContent.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-1.5 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4 animate-spin" /> Enhancing...
                  </>
                ) : (
                  'Enhance Script'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
        
        {enhancedContent && (
          <>
            <div className="h-px bg-[#36393f]" />
            <CardContent className="p-3 sm:p-4">
              <div className="space-y-3 sm:space-y-4">
                <div className="text-xs sm:text-sm font-medium text-[#e7e7e7]/70 mb-1.5 sm:mb-2">Enhanced Script:</div>
                <div className="bg-[#0e0e0e]/80 p-3 sm:p-4 rounded-md border border-[#36393f] max-h-[300px] overflow-y-auto">
                  <pre className="font-mono whitespace-pre-wrap text-xs sm:text-sm text-[#e7e7e7]/90 break-words">
                    {enhancedContent}
                  </pre>
                </div>
                
                {onApplyChanges && (
                  <div className="flex justify-end">
                    <Button
                      onClick={handleApply}
                      className="bg-[#e2c376] text-black hover:bg-[#d4b46a] text-xs sm:text-sm py-1.5 px-2.5 sm:py-2 sm:px-3"
                    >
                      Apply Changes
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}

export default ScriptEnhancer 