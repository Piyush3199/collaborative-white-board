// src/components/CodeEditor.tsx
import React, { useState } from 'react';
import Editor, { OnChange } from '@monaco-editor/react';

const CodeEditor: React.FC = () => {
    const [code, setCode] = useState<string>('Write code here');
    const [output, setOutput] = useState<string>('output');

    const handleChange = (value: string | undefined) => {
        setCode(value || "");
    };

    const runCode = async () =>{
        const response = await fetch('http://localhost:8080/run',{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({code}),
        });

        const result = await response.json();
        setOutput(result.output);
    };
    return (
        <div style={{ height: "90vh" }}>
        <Editor
            height="100%"
            defaultLanguage="typescript"
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
  