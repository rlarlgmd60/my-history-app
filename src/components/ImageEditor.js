import React, { useEffect, useRef, useState } from "react";
import { Canvas, IText, Image } from "fabric";
import "./ImageEditor.css";

const ImageEditor = () => {
    const canvasRef = useRef(null);
    const [canvas, setCanvas] = useState(null);
    const [selectedObject, setSelectedObject] = useState(null);
    const [fontSize, setFontSize] = useState(20);
    const [fontFamily, setFontFamily] = useState("Arial");
    const [textColor, setTextColor] = useState("#000000");
    const [fontWeight, setFontWeight] = useState("normal");

    const fonts = [
        "Arial",
        "Times New Roman",
        "Courier New",
        "Georgia",
        "Verdana",
        "Helvetica"
    ];

    const weights = [
        { value: "normal", label: "보통" },
        { value: "bold", label: "굵게" },
        { value: "100", label: "Thin" },
        { value: "300", label: "Light" },
        { value: "500", label: "Medium" },
        { value: "700", label: "Bold" },
        { value: "900", label: "Black" }
    ];

    useEffect(() => {
        const fabricCanvas = new Canvas(canvasRef.current, {
            width: 1000,
            height: 1000,
            backgroundColor: "#f0f0f0",
        });

        fabricCanvas.on('selection:created', (e) => {
            setSelectedObject(e.selected[0]);
            if (e.selected[0] instanceof IText) {
                setFontSize(e.selected[0].fontSize);
                setFontFamily(e.selected[0].fontFamily);
                setTextColor(e.selected[0].fill);
                setFontWeight(e.selected[0].fontWeight || "normal");
            }
        });

        fabricCanvas.on('selection:cleared', () => {
            setSelectedObject(null);
        });
    
        setCanvas(fabricCanvas);

        return () => {
            fabricCanvas.dispose();
        };
    }, []);

    // 키보드 이벤트를 위한 별도의 useEffect
    useEffect(() => {
        const deleteSelectedObject = () => {
            if (selectedObject && canvas) {
                canvas.remove(selectedObject);
                setSelectedObject(null);
                canvas.renderAll();
            }
        };

        const handleKeyDown = (e) => {
            if (e.key === 'Delete' && selectedObject && canvas) {
                deleteSelectedObject();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedObject, canvas]);


    const addImage = (e) => {
        if (!canvas) return;
        
        const file = e.target.files[0];
        if (!file) return;
    
        const reader = new FileReader();
        reader.onload = (event) => {
            const imgElement = new window.Image();
            imgElement.src = event.target.result;
            imgElement.onload = () => {
                // 이미지 크기 조정
                const maxSize = 500;
                let width = imgElement.width;
                let height = imgElement.height;

                if (width > height && width > maxSize) {
                    height *= maxSize / width;
                    width = maxSize;
                } else if (height > maxSize) {
                    width *= maxSize / height;
                    height = maxSize;
                }

                const fabricImage = new Image(imgElement, {
                    left: 100,
                    top: 100,
                    scaleX: width / imgElement.width,
                    scaleY: height / imgElement.height,
                    selectable: true,
                });

                canvas.add(fabricImage);
                canvas.setActiveObject(fabricImage);
                setSelectedObject(fabricImage);
                canvas.renderAll();
            };
        };
        reader.readAsDataURL(file);
        e.target.value = ''; // 파일 입력 초기화
    };

    const addText = () => {
        if (!canvas) return;

        const text = new IText("텍스트를 입력하세요", {
            left: 100,
            top: 100,
            fontSize: fontSize,
            fontFamily: fontFamily,
            fontWeight: fontWeight,
            fill: textColor,
            selectable: true,
            editable: true,
        });

        canvas.add(text);
        canvas.setActiveObject(text);
        setSelectedObject(text);
        canvas.renderAll();
    };

    const updateFontSize = (e) => {
        const newSize = parseInt(e.target.value);
        setFontSize(newSize);
        if (selectedObject) {
            selectedObject.set('fontSize', newSize);
            canvas.renderAll();
        }
    };

    const updateFontFamily = (e) => {
        const newFont = e.target.value;
        setFontFamily(newFont);
        if (selectedObject) {
            selectedObject.set('fontFamily', newFont);
            canvas.renderAll();
        }
    };

    const updateFontWeight = (e) => {
        const newWeight = e.target.value;
        setFontWeight(newWeight);
        if (selectedObject) {
            selectedObject.set('fontWeight', newWeight);
            canvas.renderAll();
        }
    };

    const updateTextColor = (e) => {
        const newColor = e.target.value;
        setTextColor(newColor);
        if (selectedObject) {
            selectedObject.set('fill', newColor);
            canvas.renderAll();
        }
    };


    const saveImage = () => {
        if (!canvas) return;

        const dataUrl = canvas.toDataURL({
            format: 'png',
            quality: 1
        });

        const link = document.createElement('a');
        link.download = 'canvas-image.png';
        link.href = dataUrl;
        link.click();
    };

    return (
        <div className="image-editor">
            <div className="controls">
                <div className="image-upload">
                    <label htmlFor="image-input" className="upload-btn">
                        이미지 추가
                    </label>
                    <input
                        id="image-input"
                        type="file"
                        accept="image/*"
                        onChange={addImage}
                        style={{ display: 'none' }}
                    />
                </div>
                <button onClick={addText}>텍스트 추가</button>
                <button onClick={saveImage}>이미지 저장</button>
            </div>
            <div className="text-controls" style={{ display: selectedObject instanceof IText ? 'flex' : 'none' }}>
                <input
                    type="number"
                    value={fontSize}
                    onChange={updateFontSize}
                    min="1"
                    max="100"
                    disabled={!selectedObject}
                />
                <select
                    value={fontFamily}
                    onChange={updateFontFamily}
                    disabled={!selectedObject}
                >
                    {fonts.map((font) => (
                        <option key={font} value={font}>{font}</option>
                    ))}
                </select>
                <select
                    value={fontWeight}
                    onChange={updateFontWeight}
                    disabled={!selectedObject}
                >
                    {weights.map((weight) => (
                        <option key={weight.value} value={weight.value}>
                            {weight.label}
                        </option>
                    ))}
                </select>
                <input
                    type="color"
                    value={textColor}
                    onChange={updateTextColor}
                    disabled={!selectedObject}
                />
            </div>
            <div className="canvas-container">
                <canvas ref={canvasRef} />
            </div>
        </div>
    );
};

export default ImageEditor;