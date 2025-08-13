import {BrowserRouter, Route, Routes} from "react-router-dom";
import AuthPage from "./pages/AuthPage.jsx";

function App() {

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<AuthPage/>}/>
            </Routes>
        </BrowserRouter>
    )
}

export default App
