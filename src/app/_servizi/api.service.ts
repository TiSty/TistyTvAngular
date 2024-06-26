import { Injectable } from "@angular/core";
import { ChiamataHTTP } from "../Type/ChiamataHTTP.type";
import { HttpClient } from "@angular/common/http";
import { Observable, concatMap, from, map, take, tap } from "rxjs";
import { IRispostaServer } from "../Interfacce/IRispostaServer";
import { Categorie } from "../Type/Categorie.type";
import { Film } from "../Type/Film.type";
import { SerieTv } from "../Type/SerieTv.type";
import { UtilityService } from "./utility.service";
import { Credenziali } from "../Type/Credenziali.type";
import { Form1 } from "../Type/Form1.type";
import { Form2 } from "../Type/Form2.type";
import { serieTvVisualizzata } from "../Type/serieTvVisualizzata.type";
import { FilmVisualizzato } from "../Type/FilmVisualizzato.type";
import { EpisodioVisualizzato } from "../Type/EpisodioVisualizzato.type";
import { identifierName } from "@angular/compiler";


@Injectable({ providedIn: 'root' })

export class ApiService {

    constructor(private http: HttpClient) { }

    /**
       * 
       * @param risorsa(string|nuber)[] 
       * 
       * @returns string Ovvero la stringa che rappresenta l' endpoint del server
       */
    //funzione per definire url (url sarebbe risorsa)
    protected calcolaRisorsa(risorsa: (string | number)[]): string {
        const server: string = "/api"
        const versione: string = "v1"
        let url = server + "/" + versione + "/"
        url = url + risorsa.join("/")
        return url
    }
    /**
     * 
     * @param risorsa (string|number)[] risorsa di cui voglio sapere i dati
     * @param tipo String 'GET' | 'POST' | 'PUT' | 'DELETE' tipo di chiamata htp
     * @param parametri objct | null parametri da passare all'endpoint
     * @returns  observable
     */
    //standardizzare le chiamate (fare la richiesta per la risorsa)
    protected richiestaGenerica(risorsa: (string | number)[], tipo: ChiamataHTTP, parametri: Object | null = null): Observable<IRispostaServer> {

        const url = this.calcolaRisorsa(risorsa)

        switch (tipo) {

            case "GET": return this.http.get<IRispostaServer>(url)
                break

            case "POST":
                console.log("passo da qui POST", url)
                //i parametri potrebbero essre nulli e quindi faccio un controllop
                if (parametri !== null) {
                    return this.http.post<IRispostaServer>(url, parametri) //dentro i parametri ci saranno i dati/oggetto che voglio inserire  
                } else {
                    const objErrore = { data: null, message: null, error: "NO_PARAMETRI" }
                    const obs$ = new Observable<IRispostaServer>(subscriber => subscriber.next(objErrore))
                    return obs$
                }
                break

            case "PUT":
                console.log("passo da qui PUT", url)
                //i parametri potrebbero essre nulli e quindi faccio un controllop
                if (parametri !== null) {
                    return this.http.put<IRispostaServer>(url, parametri) //dentro i parametri ci saranno i dati/oggetto che voglio inserire  
                } else {
                    const objErrore = { data: null, message: null, error: "NO_PARAMETRI" }
                    const obs$ = new Observable<IRispostaServer>(subscriber => subscriber.next(objErrore))
                    return obs$
                }
                break;

            case "PUT-BUG":
                console.log("passo da qui PUT-BUG", url)
                //i parametri potrebbero essre nulli e quindi faccio un controllop
                if (parametri !== null) {
                    return this.http.post<IRispostaServer>(url, parametri) //dentro i parametri ci saranno i dati/oggetto che voglio inserire  
                } else {
                    const objErrore = { data: null, message: null, error: "NO_PARAMETRI" }
                    const obs$ = new Observable<IRispostaServer>(subscriber => subscriber.next(objErrore))
                    return obs$
                }
                break

            case "DELETE":
                console.log("passo da qui DELETE", url)
                //fare controllo sul passaggio dell'id
                return this.http.delete<IRispostaServer>(url)
                break

            default: return this.http.get<IRispostaServer>(url)
                break
        }
    }



    // RICHIESTE GET  --------------------------------------------------


    /**
     * Funzione per richiamare l'elenco di categorie
     * @returns  observable
     */
    public getCategorie(): Observable<IRispostaServer> {
        const risorsa: string[] = ["categorie"]
        return this.richiestaGenerica(risorsa, "GET")
    }
    public getFiles(): Observable<IRispostaServer> {
        const risorsa: string[] = ["file"]
        return this.richiestaGenerica(risorsa, "GET")
    }

    /**
     * funzione per chiamare la singola risorsa
     * 
     * @returns Observable
     */
    public getCategoria(id: string): Observable<IRispostaServer> {
        const risorsa: string[] = ["categorie ", id]
        return this.richiestaGenerica(risorsa, "GET")
    }



    /**
    * Funzione per richiamare l'elenco di film
    * @returns  observable
    */
    public getFilms(): Observable<IRispostaServer> {
        const risorsa: string[] = ["film"]
        return this.richiestaGenerica(risorsa, "GET")
    }
    /**
   * Funzione per richiamare il singolo libro tramite id
   * @returns  observable
   */
    public getFilm(id: string): Observable<IRispostaServer> {
        const risorsa: string[] = ["film", id]
        return this.richiestaGenerica(risorsa, "GET")
    }



    /**
     * FUNZIONE CHE RICHIAMA/RITORNA I FILM APPARTENENTI AD UNA CATEGORIA PASSATA
     * @param idCategoria ID DELLA CATEGORIA SCELTA
     * @returns OBSERVABLE
     */
    public getFilmDaCategoria(idCategoria: number): Observable<IRispostaServer> {
        const risorsa: (string | number)[] = ["film", "categoria", idCategoria]
        return this.richiestaGenerica(risorsa, "GET")
    }

    //DATA 6/12/23 FARE RICHIAMO PER FUNZIONE GET FILM DA CATEGORIA FILM cioe prendere il film da categoria film
    public getFilmDaCategoriaFilm(idFilm: number): Observable<IRispostaServer> {
        const risorsa: (string | number)[] = ["categoria", "film", idFilm]
        return this.richiestaGenerica(risorsa, "GET")
    }





    //-------------------------------------------------------
    /**
    * Funzione per richiamare l'elenco di categorie
    * @returns  observable
    */
    public getSeriesTv(): Observable<IRispostaServer> {
        const risorsa: string[] = ["serieTv"]
        return this.richiestaGenerica(risorsa, "GET")
    }
    /**
    * Funzione per richiamare l'elenco di categorie
    * @returns  observable
    */
    public getSerieTv(id: string): Observable<IRispostaServer> {
        const risorsa: string[] = ["serieTv", id]
        return this.richiestaGenerica(risorsa, "GET")
    }

    /**
    * FUNZIONE CHE RICHIAMA/RITORNA I FILM APPARTENENTI AD UNA CATEGORIA PASSATA
    * @param idCategoria ID DELLA CATEGORIA SCELTA
    * @returns OBSERVABLE
    */
    public getSerieTvDaCategoria(idCategoria: number): Observable<IRispostaServer> {
        const risorsa: (string | number)[] = ["serieTv", "categoria", idCategoria]
        return this.richiestaGenerica(risorsa, "GET")
    }

    //-------------------------------------------------------

    public getEpisodi(): Observable<IRispostaServer> {
        const risorsa: string[] = ["episodi"]
        return this.richiestaGenerica(risorsa, "GET")
    }
    public getEpisodiConID(idSerieTv: number): Observable<IRispostaServer> {
        const risorsa: (string | number)[] = ["episodio", "serieTv", idSerieTv]
        return this.richiestaGenerica(risorsa, "GET")
    }


    public getEpisodio(id: string): Observable<IRispostaServer> {
        const risorsa: string[] = ["episodi", id]
        return this.richiestaGenerica(risorsa, "GET")
    }


    public getEpisodiDaSerie(idSerieTv: number): Observable<IRispostaServer> {
        const risorsa: (string | number)[] = ["episodi", "serieTv", idSerieTv]
        return this.richiestaGenerica(risorsa, "GET")
    }

    public getEpisodiDaEpisodio(idEpisodio: number): Observable<IRispostaServer> {
        const risorsa: (string | number)[] = [idEpisodio, "episodi"]
        // console.log('ID EPISODIO' ,idEpisodio)
        return this.richiestaGenerica(risorsa, "GET")
    }




    //funzione per ceercare l'id utente
    public getIdUtente(): Observable<IRispostaServer> {
        const risorsa: string[] = ["cercaId"]
        return this.richiestaGenerica(risorsa, "GET")
    }

    public getUtente(id: number): Observable<IRispostaServer> {
        const risorsa: (string | number)[] = ["utente", id]
        return this.richiestaGenerica(risorsa, "GET")
    }






    // RICHIESTE POST  --------------------------------------------------

    /**
     * 
     * @param parametri 
     * @returns 
     */
    public postCategoria(parametri: FormData): Observable<IRispostaServer> {
        const risorsa: string[] = ["categorie"]
        console.log('postCategorie', parametri);
        return this.richiestaGenerica(risorsa, "POST", parametri)
    }


    /**
     * 
     * @param parametri 
     * @returns 
     */
    public postFilm(parametri: FormData): Observable<IRispostaServer> {
        const risorsa: string[] = ["film"]
        console.log('postFilm', parametri);
        return this.richiestaGenerica(risorsa, "POST", parametri)
    }

    /**
   * 
   * @param parametri 
   * @returns 
   */
    public postSerieTv(parametri: FormData): Observable<IRispostaServer> {
        const risorsa: string[] = ["serieTv"]
        return this.richiestaGenerica(risorsa, "POST", parametri)
    }

    /**
     * FUNZIONE PER L'UPLOAD DI IMMAGINI
     * @param dati 
     * @returns 
     */
    public upload(dati: FormData): Observable<IRispostaServer> {
        const risorsa: string[] = ["upload"]
        return this.richiestaGenerica(risorsa, "POST", dati)
    }

    public uploadFiles(dati: FormData): Observable<IRispostaServer> {
        const risorsa: string[] = ["uploadFiles"]
        return this.richiestaGenerica(risorsa, "POST", dati)
    }









    // RICHIESTE PUT  --------------------------------------------------
    public putCategoria(idRisorsa: number, parametri: FormData): Observable<IRispostaServer> {
        const risorsa: [string, number] = ["categorie", idRisorsa]
        return this.richiestaGenerica(risorsa, "PUT-BUG", parametri)
    }
    public putCategoriaSignola(parametri: Partial<Categorie>): Observable<IRispostaServer> {
        const risorsa: string[] = ["categorie"]
        return this.richiestaGenerica(risorsa, "PUT", parametri)
    }


    
    public putFilm(idRisorsa: number, parametri: Partial<Film>): Observable<IRispostaServer> {
        const risorsa: [string, number] = ["film", idRisorsa]
        return this.richiestaGenerica(risorsa, "PUT", parametri)
    }
    public putFilmVisualizzato(idRisorsa: number, parametri: FormData): Observable<IRispostaServer> {
        const risorsa: [string, number] = ["film", idRisorsa]
        return this.richiestaGenerica(risorsa, "PUT-BUG", parametri)
    }
    
// QUESTO ERA IL PRIMO PUT FILM visualizzato
    public putFilmVisualizzato2(idRisorsa: number, parametri: Partial<Film>): Observable<IRispostaServer> {
        const risorsa: [string, number] = ["film", idRisorsa]
        return this.richiestaGenerica(risorsa, "PUT-BUG", parametri)
    }



    public putSerieTv(idRisorsa: number, parametri: Partial<SerieTv>): Observable<IRispostaServer> {
        const risorsa: [string, number] = ["serieTv", idRisorsa]
        return this.richiestaGenerica(risorsa, "PUT", parametri)
    }
 
   public putSerieVisualizzato(idRisorsa:number, parametri:FormData):Observable<IRispostaServer>{
    const risorsa: [string, number] = ["serieTv", idRisorsa]
    return this.richiestaGenerica(risorsa, "PUT-BUG", parametri)
   }

    // QUESTO ERA IL PRIMO PUT serie visualizzato
    public putSerieTvVisualizzata(idRisorsa: number, parametri: Partial<serieTvVisualizzata>): Observable<IRispostaServer> {
        const risorsa: [string, number] = ["serieTv", idRisorsa]
        return this.richiestaGenerica(risorsa, "PUT", parametri)
    }


    public putEpisodioVisualizzato(idRisorsa: number, parametri: FormData): Observable<IRispostaServer> {
        const risorsa: [string, number] = ["episodi", idRisorsa]
        return this.richiestaGenerica(risorsa, "PUT-BUG", parametri)
    }
    // QUESTO ERA IL PRIMO PUT episodio visualizzato
    public putEpisodioVisualizzato2(idRisorsa: number, parametri: Partial<EpisodioVisualizzato>): Observable<IRispostaServer> {
        const risorsa: [string, number] = ["episodi", idRisorsa]
        return this.richiestaGenerica(risorsa, "PUT", parametri)
    }


    // RICHIESTE DELETE  --------------------------------------------------

    public deleteCategorie(id: string): Observable<IRispostaServer> {
        const risorsa: string[] = ["categorie", id]
        return this.richiestaGenerica(risorsa, "DELETE")
    }



    public deleteFilm(id: string): Observable<IRispostaServer> {
        const risorsa: string[] = ["film", id]
        return this.richiestaGenerica(risorsa, "DELETE")
    }
    public deleteSerieTv(id: string): Observable<IRispostaServer> {
        const risorsa: string[] = ["serieTv", id]
        return this.richiestaGenerica(risorsa, "DELETE")
    }
    public deleteEpisodio(id: string): Observable<IRispostaServer> {
        const risorsa: string[] = ["episodi", id]
        return this.richiestaGenerica(risorsa, "DELETE")
    }
    //FASI DI LOGIN ------------------------------------------------------------    PER ME STESSO, EMAIL E HASHEMAIL sono per rino UTENTE E HASHUTENTE






    //fase uno : inviamo i dati utente al server
    /**
     * funzione che manda lo user (utente/email) al server per l'autenticazione
     * @param hashUser stringa che rappresenta l'hash utente
     * @returns  ritorna un Observable
     */
    public getLoginFase1(hashUser: string): Observable<IRispostaServer> {
        const risorsa: string[] = ["accedi", hashUser]
        const rit = this.richiestaGenerica(risorsa, "GET")
        return rit
    }


    //fase due : il serve ritorna qualcosa e noi uniamo quello che ritorna(sale) con l'hash della psw e lo inviamo di nuovo al server
    /**
     * Funzione che manda hashUser (utente) e psw cifrata al server 
     * @param hashUser stringa che rappresenta l'hash utente
     * @param hashPassword stringa che rappresenta l'hash della password unita al sale
     * @returns  ritorna un Observable
     */
    public getLoginFase2(hashUser: string, hashPassword: string): Observable<IRispostaServer> {
        const risorsa: string[] = ["accedi", hashUser, hashPassword]
        const rit = this.richiestaGenerica(risorsa, "GET")
        return rit
    }


    /**
     * funzione per richiamare la fase uno e la fase due concatenate (fa il login)
     * @param User stringa che rappresenta l'utente
     * @param password  stringa che rappresenta la password
     * @returns ritorna un osservable
     */
    public login(user: string, password: string): Observable<IRispostaServer> {
        const hashUser: string = UtilityService.hash(user)
        const hashPassword: string = UtilityService.hash(password)
        const controllo$ = this.getLoginFase1(hashUser)
            .pipe(
                take(1),
                tap(x => console.log("DATI: ", x)),
                map((rit: IRispostaServer): string => {
                    const sale: string = rit.data.sale
                    const passwordNascosta = UtilityService.nascondiPassword(hashPassword, sale)
                    return passwordNascosta
                }),
                concatMap((rit: string) => {
                    return this.getLoginFase2(hashUser, rit)
                })
            )
        return controllo$
    }





    /**
     * funzione per realizzare la registrazione all'applicazione
     * @param form1 stringa json degli elementi del form di registrazione utente
     * @param form2 stringa json degli elementi del form di registrazione credenziali
     * @returns un osservable
     */
    public registra(form1: Form1, form2: Form2): Observable<IRispostaServer> {
        const controllo$ = this.registrazioneFase1(form1)
            .pipe(
                take(1),
                tap(x => console.log("DATI: ", x)),
                map((rit: IRispostaServer): number => {
                    console.log("ritorno", rit)
                    const idUtente: number = rit.data
                    return idUtente
                }),
                concatMap((rit: number) => {
                    form2.idUtente = rit
                    return this.registrazioneUtenza(form2)
                })
            )
        return controllo$
    }

    public registrazioneFase1(form1: Form1): Observable<IRispostaServer> {
        const url = "http://localhost:4200/api/v1/registrazione"
        return this.http.post<IRispostaServer>(url, form1)
    }

    public registrazioneUtenza(form2: Form2): Observable<IRispostaServer> {
        // console.log("idUtente" , form2.idUtente)
        const url = "http://localhost:4200/api/v1/registrazione/utenza"
        return this.http.post<IRispostaServer>(url, form2)
    }



}  