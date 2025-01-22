import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Stage, Layer, Line, Rect, Circle, Text, Image, Transformer } from 'react-konva';
import { toolState, colorState } from '../../recoil/canvasToolAtoms';
import { createCanvas, getCanvasByTeamID } from '../../service/CanvasService';

const CanvasArea = forwardRef(({ teamId, yDoc, provider, awareness, canvasSize, onZoom }, ref) => {
  const [tool, setTool] = useRecoilState(toolState);
  const color = useRecoilValue(colorState);
  const stageRef = useRef(null);
  const layerRef = useRef(null);
  const [shapes, setShapes] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentShape, setCurrentShape] = useState(null);
  const [selectedShapeIndex, setSelectedShapeIndex] = useState(null);
  const [textEditVisible, setTextEditVisible] = useState(false);
  const [textEditValue, setTextEditValue] = useState('');
  const [textEditPosition, setTextEditPosition] = useState({ x: 0, y: 0 });
  const [textEditIndex, setTextEditIndex] = useState(null);
  const transformerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const yShapes = yDoc.getArray('shapes');

    const updateKonvaShapes = () => {
      const newShapes = yShapes.toArray();
      setShapes(newShapes);
    };

    yShapes.observe(updateKonvaShapes);
    updateKonvaShapes();

    return () => {
      yShapes.unobserve(updateKonvaShapes);
    };
  }, [yDoc]);


  useImperativeHandle(ref, () => ({
    saveCanvas: async () => {
      const canvasData = { team_id: teamId, canvas: JSON.stringify(shapes) };
      try {
        await createCanvas(canvasData);
        console.log('Canvas saved successfully');
      } catch (error) {
        console.error('Error saving canvas:', error);
      }
    }
  }));

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    setScale(newScale);

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    setPosition(newPos);

    stage.scale({ x: newScale, y: newScale });
    stage.position(newPos);
    stage.batchDraw();

    onZoom(newScale);
  };

  const getCursorStyle = () => {
    switch (tool) {
      case 'mouse':
        return 'default';
      case 'pencil':
      case 'pen':
        return 'crosshair';
      case 'square':
      case 'circle':
        return 'crosshair';
      case 'text':
        return 'text';
      case 'eraser':
        return 'not-allowed';
      default:
        return 'default';
    }
  };

  useEffect(() => {
    const stage = stageRef.current;
    if (stage) {
      const container = stage.container();
      container.style.cursor = getCursorStyle();
    }
  }, [tool]);

  useEffect(() => {
    if (transformerRef.current && selectedShapeIndex !== null) {
      const selectedNode = stageRef.current.findOne(`#shape-${selectedShapeIndex}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedShapeIndex]);

const handleMouseDown = (e) => {
  console.log('color', color);
  if (!tool || tool === 'mouse' || tool === 'eraser') return;
  setIsDrawing(true);
  const stage = e.target.getStage();
  const pointer = stage.getPointerPosition();
  const pos = {
    x: (pointer.x - position.x) / scale,
    y: (pointer.y - position.y) / scale,
  };

  if (tool === 'pencil' || tool === 'pen') {
    setCurrentShape({ tool, points: [pos.x, pos.y], color });
  } else if (tool === 'square' || tool === 'circle') {
    setCurrentShape({ tool, x: pos.x, y: pos.y, width: 0, height: 0, color });
  } else if (tool === 'text') {
    setCurrentShape({ tool, x: pos.x, y: pos.y, text: 'Sample Text', color });
  }
};

const handleMouseMove = (e) => {
  if (!isDrawing || !tool) return;
  const stage = e.target.getStage();
  const pointer = stage.getPointerPosition();
  const pos = {
    x: (pointer.x - position.x) / scale,
    y: (pointer.y - position.y) / scale,
  };

  if (tool === 'pencil' || tool === 'pen') {
    const newPoints = currentShape.points.concat([pos.x, pos.y]);
    setCurrentShape({ ...currentShape, points: newPoints });
  } else if (tool === 'square') {
    const newWidth = pos.x - currentShape.x;
    const newHeight = pos.y - currentShape.y;
    setCurrentShape({ ...currentShape, width: newWidth, height: newHeight });
  } else if (tool === 'circle') {
    const radius = Math.sqrt(Math.pow(pos.x - currentShape.x, 2) + Math.pow(pos.y - currentShape.y, 2));
    setCurrentShape({ ...currentShape, radius });
  }
};

  const handleMouseUp = () => {
    if (!tool || tool.tool === 'mouse' || tool.tool === 'eraser') return;
    setIsDrawing(false);
    const newShape = { ...currentShape, id: `shape-${Date.now()}` };
    setShapes([...shapes, currentShape]);
    const yShapes = yDoc.getArray('shapes');
    yShapes.push([newShape]);
    setCurrentShape(null);
  };

  const handleTextDblClick = (e, index) => {
    const shape = shapes[index];
    setTextEditVisible(true);
    setTextEditValue(shape.text);
    setTextEditPosition({ x: shape.x, y: shape.y });
    setTextEditIndex(index);
  };

  const handleTextEditChange = (e) => {
    setTextEditValue(e.target.value);
  };

  const handleTextEditBlur = () => {
    const updatedShapes = shapes.map((shape, index) => {
      if (index === textEditIndex) {
        return { ...shape, text: textEditValue };
      }
      return shape;
    });
    setShapes(updatedShapes);
    setTextEditVisible(false);
    setTextEditValue('');
    setTextEditIndex(null);
  };

  const handleShapeClick = (index) => {
    if (!tool) return;
    if (tool === 'eraser') {
      const updatedShapes = shapes.filter((_, i) => i !== index);
      setShapes(updatedShapes);

      // Yjs에서 도형 삭제
      const yShapes = yDoc.getArray('shapes');
      yShapes.delete(index, 1);
    } else {
      setSelectedShapeIndex(index);
    }
  };

  const handleDragEnd = (e, index) => {
    const updatedShape = {
      ...shapes[index],
      x: e.target.x(),
      y: e.target.y(),
    };

    const updatedShapes = shapes.map((shape, i) => (i === index ? updatedShape : shape));
    setShapes(updatedShapes);

    const yShapes = yDoc.getArray('shapes');
    yShapes.delete(index, 1);
    yShapes.insert(index, [updatedShape]);
  };

  const handleTransformEnd = (e, index) => {
    const node = e.target;
    const updatedShape = {
      ...shapes[index],
      x: node.x(),
      y: node.y(),
      width: node.width() * node.scaleX(),
      height: node.height() * node.scaleY(),
      scaleX: 1,
      scaleY: 1,
    };

    const updatedShapes = shapes.map((shape, i) => (i === index ? updatedShape : shape));
    setShapes(updatedShapes);

    const yShapes = yDoc.getArray('shapes');
    yShapes.delete(index, 1);
    yShapes.insert(index, [updatedShape]);
  };

  const saveCanvasAsJSON = async () => {
    const canvasData = { teamId, shapes };
    try {
      await createCanvas(canvasData);
      console.log('Canvas saved successfully');
    } catch (error) {
      console.error('Error saving canvas:', error);
    }
  };

  return (
    <>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        ref={stageRef}
        onWheel={handleWheel}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer ref={layerRef} width={canvasSize.width} height={canvasSize.height}>
          {shapes.map((shape, index) => {
            if (!shape || !shape.tool) return null;
            if (shape.tool === 'pencil' || shape.tool === 'pen') {
              return (
                <Line
                  key={index}
                  id={`shape-${index}`}
                  points={shape.points}
                  stroke={shape.color}
                  strokeWidth={shape.tool === 'pencil' ? 2 : 4}
                  onClick={() => handleShapeClick(index)}
                  draggable
                  onDragEnd={(e) => handleDragEnd(e, index)}
                />
              );
            } else if (shape.tool === 'square') {
              return (
                <Rect
                  key={index}
                  id={`shape-${index}`}
                  x={shape.x}
                  y={shape.y}
                  width={shape.width}
                  height={shape.height}
                  stroke={shape.color}
                  strokeWidth={2}
                  onClick={() => handleShapeClick(index)}
                  draggable
                  onDragEnd={(e) => handleDragEnd(e, index)}
                  onTransformEnd={(e) => handleTransformEnd(e, index)}
                />
              );
            } else if (shape.tool === 'circle') {
              return (
                <Circle
                  key={index}
                  id={`shape-${index}`}
                  x={shape.x}
                  y={shape.y}
                  radius={shape.radius}
                  stroke={shape.color}
                  strokeWidth={2}
                  onClick={() => handleShapeClick(index)}
                  draggable
                  onDragEnd={(e) => handleDragEnd(e, index)}
                  onTransformEnd={(e) => handleTransformEnd(e, index)}
                />
              );
            } else if (shape.tool === 'text') {
              return (
                <Text
                  key={index}
                  id={`shape-${index}`}
                  x={shape.x}
                  y={shape.y}
                  text={shape.text}
                  stroke={shape.color}
                  fontSize={20}
                  onDblClick={(e) => handleTextDblClick(e, index)}
                  onClick={() => handleShapeClick(index)}
                  draggable
                  onDragEnd={(e) => handleDragEnd(e, index)}
                  onTransformEnd={(e) => handleTransformEnd(e, index)}
                />
              );
            } else if (shape.tool === 'image') {
              return (
                <Image
                  key={index}
                  id={`shape-${index}`}
                  x={shape.x}
                  y={shape.y}
                  image={shape.image}
                  width={shape.width}
                  height={shape.height}
                  onClick={() => handleShapeClick(index)}
                  draggable
                  onDragEnd={(e) => handleDragEnd(e, index)}
                  onTransformEnd={(e) => handleTransformEnd(e, index)}
                />
              );
            }
            return null;
          })}
          {currentShape && (currentShape.tool === 'pencil' || currentShape.tool === 'pen') && (
            <Line points={currentShape.points} stroke="black" strokeWidth={currentShape.tool === 'pencil' ? 2 : 4} />
          )}
          {currentShape && currentShape.tool === 'square' && (
            <Rect x={currentShape.x} y={currentShape.y} width={currentShape.width} height={currentShape.height} stroke="black" strokeWidth={2} />
          )}
          {currentShape && currentShape.tool === 'circle' && (
            <Circle x={currentShape.x} y={currentShape.y} radius={currentShape.radius} stroke="black" strokeWidth={2} />
          )}
          {currentShape && currentShape.tool === 'text' && (
            <Text x={currentShape.x} y={currentShape.y} text={currentShape.text} fontSize={20} />
          )}
          {currentShape && currentShape.tool === 'image' && (
            <Image x={currentShape.x} y={currentShape.y} image={currentShape.image} width={currentShape.width} height={currentShape.height} />
          )}
          <Transformer ref={transformerRef} />
        </Layer>
      </Stage>
      {textEditVisible && (
        <input
          style={{
            position: 'absolute',
            top: textEditPosition.y,
            left: textEditPosition.x,
            fontSize: '20px',
            border: 'none',
            outline: 'none',
            background: 'none',
          }}
          value={textEditValue}
          onChange={handleTextEditChange}
          onBlur={handleTextEditBlur}
          autoFocus
        />
      )}
    </>
  );
});

export default CanvasArea;