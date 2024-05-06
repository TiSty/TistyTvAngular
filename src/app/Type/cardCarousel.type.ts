import { Immagine } from "./Immagine.type"

export type cardCarousel = {
    id: Number,
    immagine?: Immagine,
    titolo?: string | null,
    datiEp?: string | null,
    link: string | null
    emitId?:number | null,
}