import "./styles/global.css";
import { Button } from "./components/ui/button";

function App() {
  return (
    <main className="container">
      <h1 className="text-red-500 text-4xl">Welcome to Tauri + React</h1>

      <Button>Hello world</Button>
    </main>
  );
}

export default App;
