import React, { useEffect, useRef, useState } from 'react';
import { Container,Row, Col, Button} from 'react-bootstrap';
interface CanvasProps {
    // width ?: number;
    height ?: number;
}

// interface DrawingData{
//     type: 'draw' | 'clear' | 'history',
//     x: number;
//     y: number;
//     color: string;
//     brushSize: number;
//     isStarting: boolean;
// }


interface DrawingDataBase {
    type: 'draw' | 'clear';
    x?: number;
    y?: number;
    color?: string;
    brushSize?: number;
    isStarting?: boolean;
    data?: DrawingDataBase[]; // For history type
}

type DrawingData = DrawingDataBase;


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
    const [connectionStatus , setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
    const reconnectTimeoutRef = useRef<NodeJS.Timeout |null>(null);


    useEffect(()=>{
        try{
            wsRef.current = new WebSocket(`ws://localhost:8080`);
            wsRef.current.onopen = ()=> {
                console.log('connected to ws server');
                setConnectionStatus('connected');
            };
            wsRef.current.onclose = ()=> {
                console.log('disconnected from server');
                setConnectionStatus('disconnected');
                reconnectTimeoutRef.current = setTimeout(()=>console.log('retrying'),3000);
            };

            wsRef.current.onerror = (error) =>{
                console.error("Error: ",error);
                setConnectionStatus('error');
            };

            

        //Incoming drawing data
            wsRef.current.onmessage = (e) =>{
                const data: DrawingData = JSON.parse(e.data);
                //drawFromServer(data);
                // if(data.type === 'history'){
                //     data.data.forEach((item: DrawingData)=>{
                //         if(item.type === 'clear'){
                //             handleClear();
                //         }else if(item.type === 'draw'){
                //             drawFromServer(item);
                //         }
                //     });
                // }else if(data.type === 'clear'){
                //     handleClear();
                // }else if(data.type == 'draw'){
                //     drawFromServer(data);
                // }
                if (data.type === 'clear') {
                    handleClear(); // Handle clear canvas action
                  } else if (data.type === 'draw') {
                    drawFromServer(data);
                }

            };
        }catch(error){
            console.error('WebSocket connection error', error);
            setConnectionStatus('error');
        }
        

        return ()=>{
            if(reconnectTimeoutRef.current){
                clearTimeout(reconnectTimeoutRef.current);
            }
            wsRef.current?.close();
        };
        
    },[]);


    const drawFromServer = (data:DrawingData) =>{
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
        if(!canvas || !context) return;

        context.strokeStyle = data.color || currentColor;
        context.lineWidth = data.brushSize || brushSize; 
      //  context.lineTo(data.x, data.y);
      //  context.stroke();

      if(data.isStarting){
        context.beginPath();
        context.moveTo(data.x ||0 , data.y||0);
      }else{
        context.lineTo(data.x||0, data.y||0);
        context.stroke();
      }
    };
    
    
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

        broadcastDrawing({type:'draw',x,y,color:currentColor,brushSize,isStarting:true});
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

        broadcastDrawing({type: 'draw',x,y,color:currentColor,brushSize,isStarting:false});

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
       // broadcastDrawing({DrawingData.type: 'clear'});
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