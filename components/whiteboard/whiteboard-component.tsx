'use client'

import { use, useEffect, useRef, useState } from 'react'
import * as fabric from 'fabric'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { ColorPicker } from '@/components/whiteboard/color-picker'
import {
  Eraser,
  Pencil,
  Square,
  Circle,
  Type,
  Download,
  Trash2,
  Undo,
  Redo,
  Hand,
  PaintBucket,
  Save,
  Share,
  List
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import analyticsTracker from '@/lib/analytics'
import { useRouter } from 'next/navigation'

interface WhiteboardComponentProps {
  id?: string
  initialData?: any
}

export default function WhiteboardComponent ({
  id,
  initialData
}: WhiteboardComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null)
  const [activeTab, setActiveTab] = useState('draw')
  const [brushSize, setBrushSize] = useState(5)
  const [eraserSize, setEraserSize] = useState(10)
  const [brushColor, setBrushColor] = useState('#000000')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [shapeColor, setShapeColor] = useState('#000000')
  const [textColor, setTextColor] = useState('#000000')
  const [canvasHistory, setCanvasHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [title, setTitle] = useState(
    initialData?.title || 'Untitled Whiteboard'
  )
  const [isPublic, setIsPublic] = useState(initialData?.isPublic || false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [whiteboardsList, setWhiteboardsList] = useState([])
  const [showWhiteboardsDialog, setShowWhiteboardsDialog] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Start analytics tracking
  useEffect(() => {
    analyticsTracker.startSession('whiteboard')

    return () => {
      analyticsTracker.endSession()
    }
  }, [])

  useEffect(() => {
    if (KeyboardEvent) {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.ctrlKey && event.key === 'z') {
          undo()
        } else if (event.ctrlKey && event.key === 'y') {
          redo()
        }
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [historyIndex, canvasHistory])

  useEffect(() => {
    if (KeyboardEvent) {
      const handleKey = (event: KeyboardEvent) => {
        if (event.key === 'Delete') {
          const canvas = fabricCanvasRef.current
          if (canvas) {
            const activeObject = canvas.getActiveObject()
            if (activeObject) {
              canvas.remove(activeObject)
              saveCanvasState()
              analyticsTracker.recordAction()
            }
          }
        }
      }
      window.addEventListener('keydown', handleKey)
      return () => {
        window.removeEventListener('keydown', handleKey)
      }
    }
  }, [])
  // Load whiteboards list
  const loadWhiteboards = async () => {
    try {
      const response = await fetch('/api/whiteboards')
      if (response.ok) {
        const data = await response.json()
        setWhiteboardsList(data.whiteboards)
      }
    } catch (error) {
      console.error('Error loading whiteboards:', error)
    }
  }

  // Initialize canvas
  useEffect(() => {
    // Clean up any existing canvas
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose()
    }

    if (!canvasRef.current) return

    // Get parent dimensions
    const parent = canvasRef.current.parentElement
    if (!parent) return

    // Set canvas dimensions
    const width = parent.clientWidth
    const height = window.innerHeight - 250 // Adjust for toolbar height

    // Initialize Fabric canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor,
      isDrawingMode: true
    })

    fabricCanvasRef.current = canvas

    // Set initial brush settings
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = brushSize
    }
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = brushColor
    }
    // Load initial data if provided
    if (initialData && initialData.content) {
      canvas.loadFromJSON(initialData.content, () => {
        canvas.renderAll()
        // Save initial state
        const initialState = JSON.stringify(canvas.toJSON())
        setCanvasHistory([initialState])
        setHistoryIndex(0)
      })
    } else {
      // Save initial state
      const initialState = JSON.stringify(canvas.toJSON())
      setCanvasHistory([initialState])
      setHistoryIndex(0)
    }

    // Add event listeners for object modifications
    canvas.on('object:added', () => {
      saveCanvasState()
      analyticsTracker.recordAction()
    })

    canvas.on('object:modified', () => {
      saveCanvasState()
      analyticsTracker.recordAction()
    })

    // Handle window resize
    const handleResize = () => {
      if (!canvasRef.current || !fabricCanvasRef.current) return
      const parent = canvasRef.current.parentElement
      if (!parent) return

      const width = parent.clientWidth
      const height = window.innerHeight - 250

      fabricCanvasRef.current.setWidth(width)
      fabricCanvasRef.current.setHeight(height)
      fabricCanvasRef.current.renderAll()
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose()
        fabricCanvasRef.current = null
      }
    }
  }, [initialData])

  // Save canvas state for undo/redo
  const saveCanvasState = () => {
    if (!fabricCanvasRef.current) return

    const json = JSON.stringify(fabricCanvasRef.current.toJSON())

    // If we're in the middle of the history, truncate the future states
    if (historyIndex < canvasHistory.length - 1) {
      setCanvasHistory(prev => prev.slice(0, historyIndex + 1))
    }

    setCanvasHistory(prev => [...prev, json])
    setHistoryIndex(prev => prev + 1)
  }

  // Update brush settings when they change
  useEffect(() => {
    if (!fabricCanvasRef.current) return

    const canvas = fabricCanvasRef.current

    if (activeTab === 'draw') {
      canvas.isDrawingMode = true

      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.width = brushSize
      }

      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = brushColor
      }
    } else if (activeTab === 'erase') {
      canvas.isDrawingMode = true

      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.width = eraserSize
      }

      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = backgroundColor
      }
    }
  }, [activeTab, brushSize, eraserSize, brushColor, backgroundColor])

  // Update background color
  useEffect(() => {
    if (!fabricCanvasRef.current) return
    fabricCanvasRef.current.backgroundColor = backgroundColor
    fabricCanvasRef.current.renderAll()
  }, [backgroundColor])

  // Handle tool selection
  const handleToolSelect = (tool: string) => {
    setActiveTab(tool)
    if (!fabricCanvasRef.current) return

    const canvas = fabricCanvasRef.current

    switch (tool) {
      case 'draw':
        canvas.isDrawingMode = true
        canvas.selection = false

        if (canvas.freeDrawingBrush) {
          canvas.freeDrawingBrush.color = brushColor
        }

        if (canvas.freeDrawingBrush) {
          canvas.freeDrawingBrush.width = brushSize
        }
        break
      case 'erase':
        canvas.isDrawingMode = true
        canvas.selection = false

        if (canvas.freeDrawingBrush) {
          canvas.freeDrawingBrush.color = backgroundColor
        }

        if (canvas.freeDrawingBrush) {
          canvas.freeDrawingBrush.width = eraserSize
        }
        break
      case 'select':
        canvas.isDrawingMode = false
        canvas.selection = true
        break
      case 'shape':
      case 'text':
        canvas.isDrawingMode = false
        canvas.selection = true
        break
      default:
        canvas.isDrawingMode = false
        canvas.selection = false
    }
  }

  // Add shape to canvas
  const addShape = (shape: 'rect' | 'circle') => {
    if (!fabricCanvasRef.current) return

    const canvas = fabricCanvasRef.current
    let object

    if (shape === 'rect') {
      object = new fabric.Rect({
        left: 100,
        top: 100,
        fill: shapeColor,
        width: 100,
        height: 100
      })
    } else if (shape === 'circle') {
      object = new fabric.Circle({
        left: 100,
        top: 100,
        fill: shapeColor,
        radius: 50
      })
    }

    if (object) {
      canvas.add(object)
      canvas.setActiveObject(object)
      saveCanvasState()
      analyticsTracker.recordAction()
    }
  }

  // Add text to canvas
  const addText = () => {
    if (!fabricCanvasRef.current) return

    const canvas = fabricCanvasRef.current
    const text = new fabric.IText('Click to edit text', {
      left: 100,
      top: 100,
      fontFamily: 'Arial',
      fill: textColor,
      fontSize: 20
    })

    canvas.add(text)
    canvas.setActiveObject(text)
    saveCanvasState()
    analyticsTracker.recordAction()
  }

  // Undo action
  const undo = () => {
    if (historyIndex <= 0 || !fabricCanvasRef.current) return

    const newIndex = historyIndex - 1
    setHistoryIndex(newIndex)

    const canvas = fabricCanvasRef.current
    canvas.loadFromJSON(JSON.parse(canvasHistory[newIndex]), () => {
      canvas.renderAll()
    })

    analyticsTracker.recordAction()
  }

  // Redo action
  const redo = () => {
    if (historyIndex >= canvasHistory.length - 1 || !fabricCanvasRef.current)
      return

    const newIndex = historyIndex + 1
    setHistoryIndex(newIndex)

    const canvas = fabricCanvasRef.current
    canvas.loadFromJSON(JSON.parse(canvasHistory[newIndex]), () => {
      canvas.renderAll()
    })

    analyticsTracker.recordAction()
  }

  // Clear canvas
  const clearCanvas = () => {
    if (!fabricCanvasRef.current) return

    const canvas = fabricCanvasRef.current
    canvas.clear()
    canvas.backgroundColor = backgroundColor
    canvas.renderAll()
    saveCanvasState()
    analyticsTracker.recordAction()
  }

  // Download canvas as image
  const downloadCanvas = () => {
    if (!fabricCanvasRef.current) return

    const dataURL = fabricCanvasRef.current.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1
    })

    const link = document.createElement('a')
    link.download = `${title}.png`
    link.href = dataURL
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    analyticsTracker.recordAction()
  }

  // Save whiteboard to server
  const saveWhiteboard = async () => {
    if (!fabricCanvasRef.current) return

    setIsSaving(true)

    try {
      const canvas = fabricCanvasRef.current
      const content = JSON.stringify(canvas.toJSON())

      // Generate thumbnail
      const thumbnail = canvas.toDataURL({
        format: 'png',
        quality: 0.5,
        multiplier: 0.5
      })

      const whiteboardData = {
        title,
        content,
        thumbnail,
        isPublic
      }

      let url = '/api/whiteboards'
      let method = 'POST'

      if (id) {
        url = `/api/whiteboards/${id}`
        method = 'PUT'
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(whiteboardData)
      })

      if (response.ok) {
        const data = await response.json()

        toast({
          title: 'Success',
          description: id
            ? 'Whiteboard updated successfully'
            : 'Whiteboard saved successfully'
        })

        if (!id) {
          // Redirect to the new whiteboard page
          router.push(`/whiteboard/${data.whiteboard._id}`)
        }
      } else {
        throw new Error('Failed to save whiteboard')
      }
    } catch (error) {
      console.error('Error saving whiteboard:', error)
      toast({
        title: 'Error',
        description: 'Failed to save whiteboard. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
      setShowSaveDialog(false)
    }
  }

  // Open a whiteboard
  const openWhiteboard = (whiteboardId: string) => {
    router.push(`/whiteboard/${whiteboardId}`)
  }

  return (
    <div className='flex flex-col gap-4'>
      <Card className='p-2 md:p-4'>
        <div className='flex flex-col md:flex-row justify-between items-center mb-4'>
          <div className='flex items-center gap-2 mb-2 md:mb-0'>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className='max-w-xs font-medium text-lg'
              placeholder='Untitled Whiteboard'
            />
          </div>
          <div className='flex gap-2'>
            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <DialogTrigger asChild>
                <Button variant='outline' className='px-3'>
                  <Save className='h-3 md:h-4 w-3 md:w-4 md:mr-2' />
                  <span className='hidden md:block'>Save</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Whiteboard</DialogTitle>
                </DialogHeader>
                <div className='space-y-4 py-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='title'>Title</Label>
                    <Input
                      id='title'
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder='Enter whiteboard title'
                    />
                  </div>
                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='isPublic'
                      checked={isPublic}
                      onChange={e => setIsPublic(e.target.checked)}
                      className='rounded border-gray-300'
                      title='Make this whiteboard public'
                    />
                    <Label htmlFor='isPublic'>
                      Make this whiteboard public
                    </Label>
                  </div>
                </div>
                <div className='flex justify-end gap-2'>
                  <Button
                    variant='outline'
                    onClick={() => setShowSaveDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={saveWhiteboard} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Whiteboard'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog
              open={showWhiteboardsDialog}
              onOpenChange={open => {
                setShowWhiteboardsDialog(open)
                if (open) loadWhiteboards()
              }}
            >
              <DialogTrigger asChild>
                <Button variant='outline' className='px-3'>
                  <List className='h-3 md:h-4 w-3 md:w-4 md:mr-2' />
                  <span className='hidden md:block'>My Whiteboards</span>
                </Button>
              </DialogTrigger>
              <DialogContent className='max-w-2xl'>
                <DialogHeader>
                  <DialogTitle>My Whiteboards</DialogTitle>
                </DialogHeader>
                <div className='max-h-96 overflow-y-auto'>
                  {whiteboardsList.length === 0 ? (
                    <p className='text-center text-muted-foreground py-4'>
                      No whiteboards found
                    </p>
                  ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 py-4'>
                      {whiteboardsList.map((whiteboard: any) => (
                        <div
                          key={whiteboard._id}
                          className='border rounded-md p-2 cursor-pointer hover:bg-accent'
                          onClick={() => openWhiteboard(whiteboard._id)}
                        >
                          <div className='aspect-video bg-muted rounded-md mb-2 overflow-hidden'>
                            {whiteboard.thumbnail ? (
                              <img
                                src={whiteboard.thumbnail || '/placeholder.svg'}
                                alt={whiteboard.title}
                                className='w-full h-full object-cover'
                              />
                            ) : (
                              <div className='w-full h-full flex items-center justify-center text-muted-foreground'>
                                No Preview
                              </div>
                            )}
                          </div>
                          <h3 className='font-medium truncate'>
                            {whiteboard.title}
                          </h3>
                          <p className='text-xs text-muted-foreground'>
                            {new Date(
                              whiteboard.updatedAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Button variant='outline' className='px-3' onClick={downloadCanvas}>
              <Download className='h-3 md:h-4 w-3 md:w-4 md:mr-2' />
              <span className='hidden md:block'>Downloads</span>
            </Button>

            <Button variant='outline' className='px-3'>
              <Share className='h-3 md:h-4 w-3 md:w-4 md:mr-2' />
              <span className='hidden md:block'>Share</span>
            </Button>
          </div>
        </div>

        <div className='flex flex-wrap gap-2 mb-4'>
          <Tabs
            value={activeTab}
            onValueChange={handleToolSelect}
            className='w-full'
          >
            <TabsList className='flex justify-self-center md:justify-self-start'>
              <TabsTrigger value='draw'>
                <Pencil className='h-3 md:h-4 w-3 md:w-4 md:mr-2' />
                <span className='hidden md:block'>Draw</span>
              </TabsTrigger>
              <TabsTrigger value='erase'>
                <Eraser className='h-3 md:h-4 w-3 md:w-4 md:mr-2' />
                <span className='hidden md:block'>Erase</span>
              </TabsTrigger>
              <TabsTrigger value='select'>
                <Hand className='h-3 md:h-4 w-3 md:w-4 md:mr-2' />
                <span className='hidden md:block'>Select</span>
              </TabsTrigger>
              <TabsTrigger value='shape'>
                <Square className='h-3 md:h-4 w-3 md:w-4 md:mr-2' />
                <span className='hidden md:block'>Shapes</span>
              </TabsTrigger>
              <TabsTrigger value='text'>
                <Type className='h-3 md:h-4 w-3 md:w-4 md:mr-2' />
                <span className='hidden md:block'>Text</span>
              </TabsTrigger>
              <TabsTrigger value='background'>
                <PaintBucket className='h-3 md:h-4 w-3 md:w-4 md:mr-2' />
                <span className='hidden md:block'>Background</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value='draw' className='flex items-center gap-4 m-1'>
              <div className='flex items-center gap-2'>
                <span className='text-md font-medium'>Brush Size:</span>
                <Slider
                  value={[brushSize]}
                  min={1}
                  max={50}
                  step={1}
                  className='w-40'
                  onValueChange={value => setBrushSize(value[0])}
                />
                <span className='text-md'>{brushSize}px</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-md font-medium'>Color:</span>
                <ColorPicker color={brushColor} onChange={setBrushColor} />
              </div>
            </TabsContent>

            <TabsContent value='erase' className='flex items-center gap-4 m-1'>
              <div className='flex items-center gap-2'>
                <span className='text-md font-medium'>Eraser Size:</span>
                <Slider
                  value={[eraserSize]}
                  min={1}
                  max={50}
                  step={1}
                  className='w-40'
                  onValueChange={value => setEraserSize(value[0])}
                />
                <span className='text-md'>{eraserSize}px</span>
              </div>
            </TabsContent>

            <TabsContent value='shape' className='flex flex-col md:flex-row items-center gap-4 m-1' >
              <div className='flex items-center gap-2'>
                <Button variant='outline' onClick={() => addShape('rect')}>
                  <Square className='h-3 md:h-4 w-3 md:w-4 md:mr-2' />
                  <span className='hidden md:block'>Rectangle</span>
                  <span className='md:hidden'>Rect</span>
                </Button>
                <Button variant='outline' onClick={() => addShape('circle')}>
                  <Circle className='h-3 md:h-4 w-3 md:w-4 md:mr-2' />
                  <span className='hidden md:block'>Circle</span>
                  <span className='md:hidden'>Circ</span>
                </Button>
              </div>
              <div className='flex items-center gap-2 ml-4'>
                <span className='text-md font-medium'>Color:</span>
                <ColorPicker color={shapeColor} onChange={setShapeColor} />
              </div>
            </TabsContent>

            <TabsContent value='text' className='flex items-center gap-4 m-1'>
              <div className='flex items-center gap-2'>
                <span className='text-md font-medium'>Text Color:</span>
                <ColorPicker color={textColor} onChange={setTextColor} />
              </div>
              <Button onClick={addText}>Add Text</Button>
            </TabsContent>

            <TabsContent value='background' className='flex items-center gap-4'>
              <div className='flex items-center gap-2'>
                <span className='text-md font-medium'>Background Color:</span>
                <ColorPicker
                  color={backgroundColor}
                  onChange={setBackgroundColor}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className='flex justify-between mb-4'>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='icon'
              onClick={undo}
              disabled={historyIndex <= 0}
            >
              <Undo className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              size='icon'
              onClick={redo}
              disabled={historyIndex >= canvasHistory.length - 1}
            >
              <Redo className='h-4 w-4' />
            </Button>
          </div>
          <div className='flex gap-2'>
            <Button variant='destructive' onClick={clearCanvas}>
              <Trash2 className='h-3 md:h-4 w-3 md:w-4 md:mr-2' />
              Clear
            </Button>
          </div>
        </div>

        <div
          className='border rounded-md overflow-hidden'
          style={{ height: 'calc(100vh - 250px)' }}
        >
          <canvas ref={canvasRef} />
        </div>
      </Card>
    </div>
  )
}
