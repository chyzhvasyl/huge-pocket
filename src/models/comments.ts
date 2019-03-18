export class Comments {
    constructor (
        public emailOrTelephone: string,
        public body: string,
        public confirmation: boolean,
        public time: string
    ) { }
}