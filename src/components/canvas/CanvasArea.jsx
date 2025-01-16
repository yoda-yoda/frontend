import React, { useRef, useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Stage, Layer, Line, Rect, Circle, Text, Image, Transformer } from 'react-konva';
import { toolState, colorState } from '../../recoil/canvasToolAtoms';

const CanvasArea = () => {
  const [tool, setTool] = useRecoilState(toolState);
  const color = useRecoilValue(colorState);
  const stageRef = useRef(null);
  const [shapes, setShapes] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentShape, setCurrentShape] = useState(null);
  const [selectedShapeIndex, setSelectedShapeIndex] = useState(null);
  const [textEditVisible, setTextEditVisible] = useState(false);
  const [textEditValue, setTextEditValue] = useState('');
  const [textEditPosition, setTextEditPosition] = useState({ x: 0, y: 0 });
  const [textEditIndex, setTextEditIndex] = useState(null);
  const transformerRef = useRef(null);

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
    const pos = e.target.getStage().getPointerPosition();
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
    const pos = e.target.getStage().getPointerPosition();
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
    setShapes([...shapes, currentShape]);
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
    } else {
      setSelectedShapeIndex(index);
    }
  };

  const handleDragEnd = (e, index) => {
    const updatedShapes = shapes.map((shape, i) => {
      if (i === index) {
        return { ...shape, x: e.target.x(), y: e.target.y() };
      }
      return shape;
    });
    setShapes(updatedShapes);
  };

  const handleTransformEnd = (e, index) => {
    const node = e.target;
    const updatedShapes = shapes.map((shape, i) => {
      if (i === index) {
        return { ...shape, x: node.x(), y: node.y(), width: node.width() * node.scaleX(), height: node.height() * node.scaleY(), scaleX: 1, scaleY: 1 };
      }
      return shape;
    });
    setShapes(updatedShapes);
  };

  return (
    <>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        ref={stageRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer>
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
};

export default CanvasArea;