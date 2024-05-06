import { Injectable } from "@angular/core";
import { sha512 } from "js-sha512";
import jwtDecode from "jwt-decode";
import { Utente } from "../Type/Utente.type";
import { BehaviorSubject, Subject } from "rxjs";


@Injectable({ providedIn: 'root' })
export class UtilityService {

    utente!: Utente



    passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    //qua dentro posso mettere le funzioni valide per tutta l'app dal root in poi



    /**
     * funzione per calcolare l'hash della password legata al sale
     * @param password stringa che rappresenta la password
     * @param sale stringa che rappresenta il sale da legare alla passwrod
     * @returns stringa che rappresenta l'unione del'hash della password con il sale
     */
    static nascondiPassword(password: string, sale: string): string {
        const tmp: string = sale + password
        const hash: string = sha512(tmp)
        return hash
    }

    /**
     * funzione per leggere i dati dal token
     * @param token stringa che rappresenta il token
     * @returns un oggetto
     */
    static leggiToken(token: string) {
        try {
            return jwtDecode(token)
        } catch (error) {
            console.error("Errore di lettura nel token", token)
            return null
        }
    }


    static urlServer(){
        const url="http://localhost/Codex/public/files/"
        return url
    }
    




    /**
     *    //funzione per creare l'hash sha512 di una stringa 
     * @param str  stringa da cifrare
     * @returns  stringa cifrata
     */
    static hash(str: string): string {
        const tmp = sha512(str)
        return tmp
    }



    validaPassword(password: string): void {

        // Verifica password
        if (password !== "") {
            if (!this.passwordRegex.test(password)) {
                // Verifica se ha 8 caratteri
                if (password.length < 8) {
                    console.log("La password deve contenere almeno 8 caratteri.");
                }
                // Verifica se ha una lettera maiuscola
                if (!/(?=.*[A-Z])/.test(password)) {
                    console.log("La password deve contenere almeno una lettera maiuscola.");
                }
                // Verifica se ha una lettera minuscola
                if (!/(?=.*[a-z])/.test(password)) {
                    console.log("La password deve contenere almeno una lettera minuscola.");
                }
                // Verifica se ha un numero
                if (!/(?=.*\d)/.test(password)) {
                    console.log("La password deve contenere almeno un numero.");
                }
                // Verifica se ha un carattere speciale
                if (!/(?=.*[@$!%*?&])/.test(password)) {
                    console.log("La password deve contenere almeno un carattere speciale tra @$!%*?&.");
                }
                alert("La password deve contenere 8 caratteri, almeno una maiuscola, almeno una minuscola, almeno un numero ed un carattere speciale (tra @$!%*?&).");
            }
        }
    }


    passwordCombaciano(password: string, passwordRegistrata: string): boolean {
        if (!this.passwordRegex.test(password)) {
            alert('La password non soddisfa i criteri richiesti.');
            return false;
        }

        if (password === '' || password === undefined) {
            alert('La password è errata.');
            return false;
        }

        if (password === passwordRegistrata) {
            return true;
        } else {
            alert('Le password non corrispondono.');
            return false;
        }
    }


    verificaNascita(dataNascita: string): void {
        if (dataNascita === '') {
            alert("La data di nascita è obbligatoria");
            return;
        }

        const dataParts = dataNascita.split('/');
        if (dataParts.length !== 3) {
            alert("La data di nascita non è corretta, inserisci il formato gg/mm/aaaa");
            return;
        }

        const day = parseInt(dataParts[0], 10);
        const month = parseInt(dataParts[1], 10);
        const year = parseInt(dataParts[2], 10);

        if (isNaN(day) || isNaN(month) || isNaN(year)) {
            alert("La data di nascita non è corretta, inserisci il formato gg/mm/aaaa");
            return;
        }

        // Verifica validità della data effettiva
        const data = new Date(year, month - 1, day);
        if (data.getFullYear() !== year || data.getMonth() + 1 !== month || data.getDate() !== day) {
            alert("La data di nascita non è valida.");
        }
    }

    dataValida(dataNascita: string): boolean {
        const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
        if (!dateRegex.test(dataNascita)) {
            return false; // Il formato della data non è valido
        }

        // Divide la data in giorno, mese e anno
        const [day, month, year] = dataNascita.split('/').map(Number);

        // Verifica che il mese sia compreso tra 1 e 12
        if (month < 1 || month > 12) {
            return false; // Il mese non è valido
        }

        // Verifica che il giorno sia valido per il mese specificato
        const daysInMonth = new Date(year, month, 0).getDate();
        if (day < 1 || day > daysInMonth) {
            return false; // Il giorno non è valido per il mese
        }

        // Verifica che l'anno sia un numero positivo
        if (year < 1930) {
            return false; // L'anno non è valido
        }

        // Se tutte le verifiche hanno successo, la data è valida
        return true;
    }

    path() {
        const path = "assets/immagini/"
        return path
    }

    obsUtente$: Subject<string> = new Subject<string>()
    
    setUtente(utente: string): void {
       // this.utente = utente
       console.log('SET UTENTE', utente)
       this.obsUtente$.next(utente)
    }
    getUtente(): Subject<string> {
        return this.obsUtente$
    }


    public static impostaFormData(dati: any): FormData {
        const formData: FormData = new FormData();

        let tmp: any = {};
        Object.keys(dati).forEach(key => {
            const value = Object.getOwnPropertyDescriptor(dati, key)?.value;
            if (value !== null && value !== undefined) {
                formData.append(key, value)
            }
        });
        return formData;
    }




}






