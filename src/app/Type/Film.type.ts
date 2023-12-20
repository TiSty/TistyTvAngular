import { Immagine } from "./Immagine.type";

export type Film={
    idFilm:number;
    idCategoria:number;
    titolo:string;
    durata:number;
    regista:string;
    categoria:string;
    anno:number;
    trama:string;
    trailer?:string;
    src?:string;
}