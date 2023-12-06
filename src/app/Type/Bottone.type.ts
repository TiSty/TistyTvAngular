export type TipoBottone = "submit" | "button" | "reset"

export type Bottone = {
    testo: string,
    title: string,    //ad esempio "vai a"
    icona?: string,
    link: string | null,
    emitId: number | null,   //per eliminare o modificare 
    tipo: TipoBottone
}


