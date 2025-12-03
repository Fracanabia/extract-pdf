import {SP} from './SP'
import {useState} from "react";
import {SP_ESTADO} from "./SP_ESTADO.tsx";

export const App = () => {
    const [view, setView] = useState("SP")
    return (
        <>
            <div><button onClick={() => setView(view === "SP" ? "CNIS" : "SP")}>{view}</button></div>
            {view === "SP" ? <SP/> : <SP_ESTADO/>}
        </>)
}
