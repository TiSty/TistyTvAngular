import { Bottone } from "./Bottone.type"
import { Immagine } from "./Immagine.type"

export type Card = {
    id:number,
    immagine?:Immagine,
    titolo?:string | null,
    testo?:string|null,
    bottone?:Bottone|undefined
}


export type CardFront = {
    immagine?:Immagine,
    titolo:string | null,
    bottone:Bottone|undefined
}
export type CardBack = {
    testo:string|null,
}