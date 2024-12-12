import React, { useEffect, useRef, useState } from 'react';
import { Container,Row, Col, Button} from 'react-bootstrap';
interface CanvasProps {
    // width ?: number;
    height ?: number;
}

interface DrawingData{
    x: number;
    y: number;
    color: string;
    brushSize: number; 
}
const Whiteboard: React.FC<CanvasProps> = ({
    // width = 1000,
    height = 600
})=>{
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const [currentColor, setCurrentColor] = useState<string>('#000000');
    const [brushSize, setBrushSize] = useState<number>(2); 
    const [canvasWidth, setCanvasWidth] = useState<number>(window.innerWidth - 20); // Initial width minus padding
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(()=>{
        wsRef.current = new WebSocket(`ws://localhost:8080`);
        wsRef.current.onopen = ()=> console.log('connected to ws sewerver');
        wsRef.current.onclose = ()=> console.log('disconnected from server');

        //Incoming drawing data
        wsRef.current.onmessage = (e) =>{
            const data: DrawingData = JSON.parse(e.data);
            drawFromServer(data);
        };

        return ()=>{
            wsRef.current?.close();
        };
        
    },[]);


    const drawFromServer = (data:DrawingData) =>{
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
        if(!canvas || !context) return;

        context.strokeStyle = data.color;
        context.lineWidth = data.brushSize;
        context.lineTo(data.x, data.y);
        context.stroke();
    }
    
    
    useEffect(() => {
        const handleResize = () => {
          setCanvasWidth(window.innerWidth - 20); // Adjust canvas to full width of the browser minus padding
        };
        window.addEventListener('resize', handleResize);
        return () => {
          window.removeEventListener('resize', handleResize);
        };
      }, []);
    

    useEffect(()=>{
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');

        if(context){
            context.strokeStyle = currentColor;
            context.lineWidth = brushSize;
            context.lineCap = 'round';
        }
    },[currentColor, brushSize]);


    const  startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) =>{
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');

        if(!canvas || !context){
            return;
        }

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        context.beginPath();
        context.moveTo(x,y);
        setIsDrawing(true);

        //Broadcasting the strarting point

        broadcastDrawing({x,y,color:currentColor,brushSize});
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if(!isDrawing) return;

        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');

        if(!canvas || !context)return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        context.lineTo(x,y);
        context.stroke();

        broadcastDrawing({x,y,color:currentColor,brushSize});

    };

    const stopDrawing = () =>{
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');

        if(context){
            context.closePath();
        }
        setIsDrawing(false);
    };

    const broadcastDrawing = (data:DrawingData)=>{
        if(wsRef.current?.readyState ===  WebSocket.OPEN){
            wsRef.current.send(JSON.stringify(data));
        }
    }

    const hanndleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const color = e.target.value;
        setCurrentColor(color);

        const canvas = canvasRef.current;
        const context = canvas ?.getContext('2d');

        if(context){
            context.strokeStyle = color;
        }
    };

    const handleBrushSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const size = parseInt(e.target.value);
        setBrushSize(size);

        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');

        if(context){
            context.lineWidth = size;
        }
    };

    const handleClear = () => {
        const canvas = canvasRef.current!;
        const context = canvas?.getContext('2d');

        if(context){
            context.clearRect(0,0,canvas.width|0,canvas.height);
        }
    };

    return (
        <Container className="mt-4">
            <Row className="mb-3 " style={{ display: 'flex', justifyContent: 'space-evenly', backgroundColor: 'lightblue', padding: '1rem' }}>
                <Col md={4}>
                    <label className="form-label">
                        Color
                        <input 
                            type="color"
                            value={currentColor}
                            onChange={hanndleColorChange}
                            className="form-control form-control-color"
                            ></input>
                    </label>
                </Col>
                <Col md={4}>
                    <label className="form-label">
                        Brush Size
                        <input 
                            type="range"
                            min="1"
                            max="50"
                            value={brushSize}
                            onChange={handleBrushSizeChange}
                            className="form-range"
                            ></input>
                    </label>
                </Col>
                <Col md={4}>
                    <Button
                        variant="danger"
                        onClick={handleClear}>
                        Clear Canvas
                        </Button>
                 </Col>
            </Row>
            <Row>
                <Col>
                    <canvas
                        ref={canvasRef}
                        width={canvasWidth}
                        height={height}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        //onMouseOut={stopDrawing}
                        onMouseLeave={undefined}
                        className="border border-secondary"
                    >
                    </canvas>
                </Col>
            </Row>
        </Container>
    );
};

export default Whiteboard;