'use client'

import { useEffect, useRef, useState } from 'react'
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
  PaintBucket
} from 'lucide-react'

export default function WhiteboardComponent () {
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

    canvas.freeDrawingBrush.color = brushColor

    // Save initial state
    const initialState = JSON.stringify(canvas.toJSON())
    setCanvasHistory([initialState])
    setHistoryIndex(0)

    // Add event listeners for object modifications
    canvas.on('object:added', () => {
      saveCanvasState()
    })

    canvas.on('object:modified', () => {
      saveCanvasState()
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
  }, [])

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
        canvas.freeDrawingBrush.width = brushSize
        }
        break
      case 'erase':
        canvas.isDrawingMode = true
        canvas.selection = false
        if (canvas.freeDrawingBrush) {
          canvas.freeDrawingBrush.color = backgroundColor
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
  }

  // Clear canvas
  const clearCanvas = () => {
    if (!fabricCanvasRef.current) return

    const canvas = fabricCanvasRef.current
    canvas.clear()
    canvas.backgroundColor = backgroundColor
    canvas.renderAll()
    saveCanvasState()
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
    link.download = 'whiteboard.png'
    link.href = dataURL
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className='flex flex-col gap-4'>
      <Card className='p-4'>
        <div className='flex flex-wrap gap-2 mb-4'>
          <Tabs
            value={activeTab}
            onValueChange={handleToolSelect}
            className='w-full'
          >
            <TabsList className='mb-4'>
              <TabsTrigger value='draw'>
                <Pencil className='h-4 w-4 mr-2' />
                Draw
              </TabsTrigger>
              <TabsTrigger value='erase'>
                <Eraser className='h-4 w-4 mr-2' />
                Erase
              </TabsTrigger>
              <TabsTrigger value='select'>
                <Hand className='h-4 w-4 mr-2' />
                Select
              </TabsTrigger>
              <TabsTrigger value='shape'>
                <Square className='h-4 w-4 mr-2' />
                Shapes
              </TabsTrigger>
              <TabsTrigger value='text'>
                <Type className='h-4 w-4 mr-2' />
                Text
              </TabsTrigger>
              <TabsTrigger value='background'>
                <PaintBucket className='h-4 w-4 mr-2' />
                Background
              </TabsTrigger>
            </TabsList>

            <TabsContent value='draw' className='flex items-center gap-4'>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-medium'>Brush Size:</span>
                <Slider
                  value={[brushSize]}
                  min={1}
                  max={50}
                  step={1}
                  className='w-40'
                  onValueChange={value => setBrushSize(value[0])}
                />
                <span className='text-sm'>{brushSize}px</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-medium'>Color:</span>
                <ColorPicker color={brushColor} onChange={setBrushColor} />
              </div>
            </TabsContent>

            <TabsContent value='erase' className='flex items-center gap-4'>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-medium'>Eraser Size:</span>
                <Slider
                  value={[eraserSize]}
                  min={1}
                  max={50}
                  step={1}
                  className='w-40'
                  onValueChange={value => setEraserSize(value[0])}
                />
                <span className='text-sm'>{eraserSize}px</span>
              </div>
            </TabsContent>

            <TabsContent value='shape' className='flex items-center gap-4'>
              <Button variant='outline' onClick={() => addShape('rect')}>
                <Square className='h-4 w-4 mr-2' />
                Rectangle
              </Button>
              <Button variant='outline' onClick={() => addShape('circle')}>
                <Circle className='h-4 w-4 mr-2' />
                Circle
              </Button>
              <div className='flex items-center gap-2 ml-4'>
                <span className='text-sm font-medium'>Color:</span>
                <ColorPicker color={shapeColor} onChange={setShapeColor} />
              </div>
            </TabsContent>

            <TabsContent value='text' className='flex items-center gap-4'>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-medium'>Text Color:</span>
                <ColorPicker color={textColor} onChange={setTextColor} />
              </div>
              <Button onClick={addText}>Add Text</Button>
            </TabsContent>

            <TabsContent value='background' className='flex items-center gap-4'>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-medium'>Background Color:</span>
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
            <Button variant='outline' onClick={downloadCanvas}>
              <Download className='h-4 w-4 mr-2' />
              Download
            </Button>
            <Button variant='destructive' onClick={clearCanvas}>
              <Trash2 className='h-4 w-4 mr-2' />
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
