import Editor from "@monaco-editor/react";
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Button from '@mui/joy/Button';
import Box from '@mui/joy/Box';
import Slider from '@mui/joy/Slider';
import { useState, useEffect, useRef, useCallback } from "react";

const default_code = '#include<bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    return 0;\n}\n';
const default_error = 'unknown_error'

function LangSelect({setLang}) {
  const lang_change = (_, new_value) => setLang(new_value);
  return (
    <Select defaultValue="cpp" onChange={lang_change} sx={{width: 'max-content', display: 'inline-flex'}}>
      <Option value="abap">ABAP</Option>
      <Option value="redshift">Amazon Redshift</Option>
      <Option value="apex">Apex</Option>
      <Option value="razor">ASP.NET Razor</Option>
      <Option value="azcli">Azure CLI</Option>
      <Option value="bat">Batch Script</Option>
      <Option value="bicep">Bicep</Option>
      <Option value="cpp">C/C++</Option>
      <Option value="cameligo">CameLIGO</Option>
      <Option value="clojure">Clojure</Option>
      <Option value="coffee">CoffeeScript</Option>
      <Option value="csp">CSP</Option>
      <Option value="css">CSS</Option>
      <Option value="cypher">Cypher</Option>
      <Option value="csharp">C#</Option>
      <Option value="dart">Dart</Option>
      <Option value="dockerfile">Dockerfile</Option>
      <Option value="ecl">ECL</Option>
      <Option value="elixir">Elixir</Option>
      <Option value="flow9">Flow9</Option>
      <Option value="freemarker2">FreeMarker 2</Option>
      <Option value="fsharp">F#</Option>
      <Option value="go">Go</Option>
      <Option value="graphql">GraphQL</Option>
      <Option value="handlebars">Handlebars</Option>
      <Option value="hcl">HCL</Option>
      <Option value="html">HTML</Option>
      <Option value="ini">ini</Option>
      <Option value="java">Java</Option>
      <Option value="javascript">JavaScript</Option>
      <Option value="julia">Julia</Option>
      <Option value="kotlin">Kotlin</Option>
      <Option value="less">Less</Option>
      <Option value="liquid">Liquid</Option>
      <Option value="lua">Lua</Option>
      <Option value="lexon">Lexon</Option>
      <Option value="powerquery">M</Option>
      <Option value="markdown">Markdown</Option>
      <Option value="mdx">MDX</Option>
      <Option value="mips">MIPS</Option>
      <Option value="mysql">MySQL</Option>
      <Option value="m3">M3</Option>
      <Option value="objective-c">Objective-C</Option>
      <Option value="pascal">Pascal</Option>
      <Option value="pascaligo">PascaLigo</Option>
      <Option value="perl">Perl</Option>
      <Option value="php">PHP</Option>
      <Option value="pla">PLA</Option>
      <Option value="pgsql">PostgreSQL</Option>
      <Option value="postiats">Postiats</Option>
      <Option value="powershell">PowerShell</Option>
      <Option value="protobuf">Protocol Buffers</Option>
      <Option value="pug">Pug</Option>
      <Option value="python">Python</Option>
      <Option value="qsharp">Q#</Option>
      <Option value="r">R</Option>
      <Option value="redis">Redis</Option>
      <Option value="restructuredtext">reStructuredText</Option>
      <Option value="ruby">Ruby</Option>
      <Option value="rust">Rust</Option>
      <Option value="scala">Scala</Option>
      <Option value="scheme">Scheme</Option>
      <Option value="scss">SCSS</Option>
      <Option value="shell">Shell</Option>
      <Option value="sb">Small Basic</Option>
      <Option value="solidity">Solidity</Option>
      <Option value="sophia">Sophia</Option>
      <Option value="sparql">SPARQL</Option>
      <Option value="sql">SQL</Option>
      <Option value="st">Structured Text</Option>
      <Option value="swift">Swift</Option>
      <Option value="systemverilog">SystemVerilog</Option>
      <Option value="tcl">TCL</Option>
      <Option value="twig">Twig</Option>
      <Option value="typescript">TypeScript</Option>
      <Option value="vb">Visual Basic</Option>
      <Option value="wgsl">WebGPU Shading Language</Option>
      <Option value="xml">XML</Option>
      <Option value="msdax">X++</Option>
      <Option value="yaml">YAML</Option>
    </Select>
  );
}


function App() {
  const [editor, setEditor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expire, setExpire] = useState(2);
  const [value, setValue] = useState(default_code);
  const [lang, setLang] = useState('cpp');
  useEffect(() => {
    if (editor === null) return;
    const writeCode = (v) => {
      editor.setValue(v);
    };

    const params = new URLSearchParams(window.location.search);
    if (params.has('error')) {
      const err = params.get('error');
      writeCode(`Sorry, an error occurred.\n\nError Code: ${err.toUpperCase()}`);
    } else if (params.has('success')) {
      const new_loc = params.get('success');
      writeCode(`Congrats! Your code is available at:\n\n    https://${window.location.host}/#${new_loc}\n`);
    } else {
      const hash = window.location.hash.slice(1);
      if (hash) {
        writeCode('loading');
        const data = {
          hash: hash
        };
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        }
        fetch('/load', options).then((res) => {
          if (!res.ok) {
            window.location.href = `/?error=${default_error}`;
          } else {
            res.json().then((j) => {
              const {prompt, value, lang} = j;
              if (prompt !== 'ok') {
                window.location.href = `/?error=${prompt}`;
              } else {
                setLang(lang);
                writeCode(value);
              }
            });
          }
        });
      }
    }
  }, [editor]);
  const clickHandler = () => {
    const data = {
      lang: lang,
      value: value,
      expire: expire
    };
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    };
    setLoading(true);
    fetch('/hash', options).then(res => {
      if (!res.ok) {
        window.location.href = `/?error=${default_error}`;
      } else {
        res.json().then((j) => {
          const {prompt, loc} = j;
          if (prompt !== 'ok') {
            window.location.href = `/?error=${prompt}`;
          } else {
            window.location.href = `/?success=${loc}`;
          }
        });
      }
    });
  };
  const slideHandler = (_, v) => setExpire(v);
  const inputHandler = (v) => setValue(v);
  const marks = [
    {value: 1, label: '1h'},
    {value: 2, label: '1d'},
    {value: 3, label: '3d'},
    {value: 4, label: '5d'},
    {value: 5, label: '7d'},
  ];


  return (
    <Box sx={{display: 'flex', flexDirection: 'column', width: '80vw', height: '90vh', margin: 'auto', rowGap: '10px'}}>
      <Box sx={{display: 'flex', margin: 'auto'}}>
        <h1>Yet Another Pastebin</h1>
      </Box>
      <Box sx={{display: 'flex', height: '70px', alignItems: 'center'}}>
        <Box sx={{margin: 'auto', width: '100%', display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center'}}>
          <LangSelect setLang={setLang} />
          <Slider onChange={slideHandler} sx={{width: '50vw'}} defaultValue={2} step={1} max={5} marks={marks} />
          <Button onClick={clickHandler} sx={{display: 'inline-flex', marginRight: '0'}} loading={loading}>Create</Button>
        </Box>
      </Box>
      <Box sx={{display: 'flex', flexGrow: 1}}>
        <Editor onMount={(ed, _)=>setEditor(ed)} onChange={inputHandler} theme={'vs-dark'} language={lang} defaultValue={default_code} />
      </Box>
    </Box>
  );
}

export default App;
