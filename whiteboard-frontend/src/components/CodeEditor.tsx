// src/components/CodeEditor.tsx
import React, { useEffect, useState } from 'react';
import Editor, { OnChange } from '@monaco-editor/react';
import { Row, Col,Dropdown } from 'react-bootstrap';
import {DropdownButton} from 'react-bootstrap';
const CodeEditor: React.FC = () => {
    const [code, setCode] = useState<string>('Write code here');
    const [output, setOutput] = useState<string>('output');
    const [ws, setWs] = useState<WebSocket | null>(null);

    useEffect(()=>{
        const socket = new WebSocket(`ws://localhost:8080`);
        setWs(socket);

        socket.onopen = ()=>{
            console.log(`Web socket connected`);
        };

        socket.onmessage = (event) =>{
            const message = JSON.parse(event.data);

            if(message.type === 'codeOutput'){
                setOutput(message.output);
            }else{
                console.log(`Unhandled message type ${message.type}`);
            }
        };

        socket.onclose = () => {
            console.log(`Websocket disconnected`);
        };

        return ()=>{
            socket.close();
        };
    },[]);
    const handleChange = (value: string | undefined) =>{
        setCode(value || "");
    };



    const runCode = async () =>{
        // const response = await fetch('http://localhost:8080/run',{
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({code}),
        // });

        // const result = await response.json();
        // setOutput(result.output);

        if(ws && ws.readyState === WebSocket.OPEN){
            const message = {
                type: 'code',
                code,
            };
            ws.send(JSON.stringify(message));
        }else{
            console.error(`Websocket is not connected`);
        }
    };
    return (
        <div style={{ height: "90vh" }}>
            <Row className="mb-3 " style={{ display: 'flex', justifyContent: 'space-evenly', backgroundColor: 'lightblue', padding: '1rem' }}>
                <Col md={4}>
                    <label className="form-label">
                        Color
                        {/* <input 
                            type="color"
                            value={currentColor}
                            onChange={hanndleColorChange}
                            className="form-control form-control-color"
                            ></input> */}
                    </label>
                </Col>
                <Col md={4}>
                <label className="form-label">
                <DropdownButton id="dropdown-basic-button" title="Options">
                    <Dropdown.Item href="#/action-1">Action 1</Dropdown.Item>
                    <Dropdown.Item href="#/action-2">Action 2</Dropdown.Item>
                    <Dropdown.Item href="#/action-3">Action 3</Dropdown.Item>
                </DropdownButton>
          </label>
                </Col>
                <Col md={4}>
                    Button
                    {/* <Button
                        variant="danger"
                        onClick={handleClear}>
                        Clear Canvas
                        </Button> */}
                 </Col>
        </Row>
        <Editor
            height="100%"
            defaultLanguage="java"
            defaultValue={code}
            onChange={handleChange}
            theme="vs-dark"
            options={{
            minimap: { enabled: false },
            fontSize: 14,
            }}
        />
        <button onClick={runCode}>Run Code</button>
        <div>
            <h3>Output: </h3>
            <pre>{output}</pre>
        </div>
        
    </div>
    
    );

  };
  
  export default CodeEditor;
  