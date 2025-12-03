import {SP} from './SP'
import {useState} from "react";
import {SP_ESTADO} from "./SP_ESTADO.tsx";

export const App = () => {
    const [view, setView] = useState("SP")
    return (
        <>
            <div>
                <button onClick={() => setView("SP")}>SP</button>
                <button onClick={() => setView("SP_ESTADO")}>SP_ESTADO</button>
            </div>
            {view === "SP" ? <SP/> : <SP_ESTADO/>}
        </>)
}
