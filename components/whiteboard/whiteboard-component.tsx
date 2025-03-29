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
  Type,
  Download,
  Trash2,
  Undo,
  Redo,
  PaintBucket,
  Circle
} from 'lucide-react'
import { Hand } from 'lucide-react' // Import the Hand icon

export default function WhiteboardComponent () {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null)
  const [activeTab, setActiveTab] = useState('draw')
  const [brushSize, setBrushSize] = useState(5)
  const [eraserSize, setEraserSize] = useState(10)
  const [tabColors, setTabColors] = useState({
    draw: '#000000',
    erase: '#ffffff',
    shape: '#000000',
    text: '#000000',
    background: '#ffffff'
  })
  const [canvasHistory, setCanvasHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [zoomLevel, setZoomLevel] = useState(1)

  const activeColor = tabColors[activeTab as keyof typeof tabColors]
  const handleToolSelect = (tool: string) => {
    setActiveTab(tool)
    if (!fabricCanvasRef.current) return

    const canvas = fabricCanvasRef.current

    if (!canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
    }

    switch (tool) {
      case 'draw':
        canvas.isDrawingMode = true
        canvas.selection = false
        canvas.freeDrawingBrush.color = tabColors.draw
        break
      case 'erase':
        canvas.isDrawingMode = true
        canvas.selection = false
        canvas.freeDrawingBrush.color =
          (canvas.backgroundColor as string) || '#ffffff'
        break
      case 'shape':
      case 'text':
        canvas.isDrawingMode = false
        canvas.selection = false
        if (tool === 'text') addText()
        break
      case 'select': // Enable object selection
        canvas.isDrawingMode = false
        canvas.selection = true
        break
      default:
        canvas.isDrawingMode = true
        canvas.selection = false
    }
  }

  useEffect(() => {
    const resizeCanvas = () => {
      if (fabricCanvasRef.current && canvasRef.current) {
        const canvas = fabricCanvasRef.current
        const containerWidth =
          canvasRef.current.parentElement?.offsetWidth || 1000
        const containerHeight =
          canvasRef.current.parentElement?.offsetHeight || 600
        canvas.setWidth(containerWidth)
        canvas.setDimensions({ width: containerWidth, height: containerHeight })
      }
    }

    if (canvasRef.current && !fabricCanvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        backgroundColor: tabColors.background,
        isDrawingMode: true
      })

      fabricCanvasRef.current = canvas

      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.width = brushSize
        canvas.freeDrawingBrush.color = tabColors.draw
      } else {
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
        canvas.freeDrawingBrush.width = brushSize
        canvas.freeDrawingBrush.color = tabColors.draw
      }

      canvas.on('object:added', () => {})
      canvas.on('object:modified', () => {})
      canvas.on('object:removed', () => {})

      // Add keydown event listener for delete functionality
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Delete' && canvas.getActiveObject()) {
          const activeObject = canvas.getActiveObject()
          if (activeObject) {
            canvas.remove(activeObject)
          }
        }
      }
      window.addEventListener('keydown', handleKeyDown)
      window.addEventListener('resize', resizeCanvas)

      resizeCanvas()

      return () => {
        window.removeEventListener('keydown', handleKeyDown)
        window.removeEventListener('resize', resizeCanvas)
      }
    }

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose()
        fabricCanvasRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current
      if (!canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
      }
      canvas.freeDrawingBrush.width =
        activeTab === 'erase' ? eraserSize : brushSize
      if (activeTab === 'erase') {
        canvas.freeDrawingBrush.color =
          (canvas.backgroundColor as string) || '#ffffff'
      }
    }
  }, [brushSize, eraserSize, activeTab, tabColors.background])

  useEffect(() => {
    if (fabricCanvasRef.current && activeTab === 'draw') {
      const canvas = fabricCanvasRef.current
      if (!canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
      }
      canvas.freeDrawingBrush.color = activeColor
    }
  }, [activeColor, activeTab])

  const loadCanvasState = (index: number) => {
    if (!fabricCanvasRef.current || !canvasHistory[index]) return
    fabricCanvasRef.current.loadFromJSON(
      JSON.parse(canvasHistory[index]),
      () => {
        fabricCanvasRef.current?.renderAll()
      }
    )
  }

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      loadCanvasState(historyIndex - 1)
    }
  }

  const redo = () => {
    if (historyIndex < canvasHistory.length - 1) {
      setHistoryIndex(historyIndex + 1)
      loadCanvasState(historyIndex + 1)
    }
  }

  const addShape = (shape: 'rect' | 'circle') => {
    if (!fabricCanvasRef.current) return

    const canvas = fabricCanvasRef.current
    let object

    if (shape === 'rect') {
      object = new fabric.Rect({
        left: 100,
        top: 100,
        fill: activeColor,
        width: 100,
        height: 100
      })
    } else {
      object = new fabric.Circle({
        left: 100,
        top: 100,
        fill: activeColor,
        radius: 50
      })
    }

    canvas.add(object)
    canvas.setActiveObject(object)
  }

  const addText = () => {
    if (!fabricCanvasRef.current) return

    const canvas = fabricCanvasRef.current
    const text = new fabric.IText('Click to edit text', {
      left: 100,
      top: 100,
      fontFamily: 'Arial',
      fill: activeColor,
      fontSize: 20
    })

    canvas.add(text)
    canvas.setActiveObject(text)
  }

  const handleZoom = (value: number) => {
    if (!fabricCanvasRef.current) return

    const canvas = fabricCanvasRef.current
    const zoom = value / 100
    setZoomLevel(zoom)
    canvas.setZoom(zoom)
    canvas.setViewportTransform([zoom, 0, 0, zoom, 0, 0])
  }

  const clearCanvas = () => {
    if (!fabricCanvasRef.current) return

    const canvas = fabricCanvasRef.current
    const backgroundColor = canvas.backgroundColor
    canvas.clear()
    canvas.backgroundColor = backgroundColor
    canvas.renderAll()
  }

  if (fabricCanvasRef.current) {
    const canvas = fabricCanvasRef.current
    canvas.backgroundColor = tabColors.background
    canvas.renderAll()
  }

  return (
    <div className='flex flex-col'>
      <Card className='p-1 md:p-4'>
        {/* Toolbar Tabs */}
        <div className='flex flex-wrap'>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='w-full'
          >
            <TabsList className='m-0 w-full md:justify-start'>
              {['draw', 'erase', 'select', 'shape', 'text', 'background'].map(
                tool => (
                  <TabsTrigger
                    key={tool}
                    value={tool}
                    className='flex items-center justify-center  h-8 p-2 mx-1 my-2'
                    onClick={() => handleToolSelect(tool)}
                  >
                    {tool === 'draw' && (
                      <Pencil className='h-3 md:h-4 w-3 md:w-4 m-0 md:mr-2' />
                    )}
                    {tool === 'erase' && (
                      <Eraser className='h-3 md:h-4 w-3 md:w-4 m-0 md:mr-2' />
                    )}
                    {tool === 'select' && (
                      <Hand className='h-3 md:h-4 w-3 md:w-4 m-0 md:mr-2' />
                    )}
                    {tool === 'shape' && (
                      <Square className='h-3 md:h-4 w-3 md:w-4 m-0 md:mr-2' />
                    )}
                    {tool === 'text' && (
                      <Type className='h-3 md:h-4 w-3 md:w-4 m-0 md:mr-2' />
                    )}
                    {tool === 'background' && (
                      <PaintBucket className='h-3 md:h-4 w-3 md:w-4 m-0 md:mr-2' />
                    )}
                    <span className='hidden md:block'>
                      {tool.charAt(0).toUpperCase() + tool.slice(1)}
                    </span>
                  </TabsTrigger>
                )
              )}
              {/* Add more tabs as needed */}
              {/* Draw Tab */}
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
                  onValueChange={([value]) => setBrushSize(value)}
                />
                <span className='text-sm'>{brushSize}px</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-medium'>Color:</span>
                <ColorPicker
                  color={tabColors.draw}
                  onChange={color =>
                    setTabColors(prev => ({ ...prev, draw: color }))
                  }
                />
              </div>
            </TabsContent>

            {/* Erase Tab */}
            <TabsContent value='erase' className='flex items-center gap-4'>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-medium'>Eraser Size:</span>
                <Slider
                  value={[eraserSize]}
                  min={1}
                  max={50}
                  step={1}
                  className='w-40'
                  onValueChange={([value]) => setEraserSize(value)}
                />
                <span className='text-sm'>{eraserSize}px</span>
              </div>
            </TabsContent>

            {/* Shape Tab */}
            <TabsContent value='shape' className='flex items-center gap-4'>
              <div className='flex flex-col md:flex-row items-center w-full md:w-max gap-2'>
                <Button variant='outline' className='w-full justify-start' onClick={() => addShape('rect')}>
                  <Square className='h-4 w-4 mr-2' />
                  Rectangle
                </Button>
                <Button variant='outline' className='w-full justify-start' onClick={() => addShape('circle')}>
                  <Circle className='h-4 w-4 mr-2' />
                  Circle
                </Button>
                <div className='flex items-center w-full gap-2 ml-4'>
                  <span className='text-sm font-medium'>Color:</span>
                  <ColorPicker
                    color={tabColors.shape}
                    onChange={color =>
                      setTabColors(prev => ({ ...prev, shape: color }))
                    }
                  />
                </div>
              </div>
            </TabsContent>

            {/* Text Tab */}
            <TabsContent value='text' className='flex items-center gap-4'>
              <Button onClick={addText}>Add Text</Button>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-medium'>Text Color:</span>
                <ColorPicker
                  color={tabColors.text}
                  onChange={color =>
                    setTabColors(prev => ({ ...prev, text: color }))
                  }
                />
              </div>
            </TabsContent>

            {/* Background Tab */}
            <TabsContent value='background' className='flex items-center gap-4'>
              <span className='text-sm font-medium'>Background Color:</span>
              <ColorPicker
                color={tabColors.background}
                onChange={color =>
                  setTabColors(prev => ({ ...prev, background: color }))
                }
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Undo / Redo / Download / Clear */}
        <div className='flex md:justify-between mb-4 gap-2'>
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
            <Button
              variant='outline'
              onClick={() =>
                console.log('Download functionality not implemented')
              }
            >
              <Download className='h-4 w-4 md:mr-2' />
              <span className='hidden md:block'>Download</span>
            </Button>
            <Button variant='destructive' onClick={clearCanvas}>
              <Trash2 className='h-4 w-4 md:mr-2' />
              <span className='hidden md:block'>Clear</span>
            </Button>
          </div>
        </div>

        {/* Zoom Slider */}
        <div className='flex items-center gap-4 mb-4'>
          <span className='text-sm font-medium'>Zoom:</span>
          <Slider
            value={[zoomLevel * 100]}
            min={10}
            max={200}
            step={10}
            className='w-40'
            onValueChange={([value]) => handleZoom(value)}
          />
          <span className='text-sm'>{zoomLevel * 100}%</span>
        </div>
        {/* Canvas */}
        <div className='border rounded-md overflow-hidden'>
          <canvas ref={canvasRef} />
        </div>
      </Card>
    </div>
  )
}
