export class Articles {
    constructor (
        public _id: string,
        public comments: string,
        public confirmation: boolean,
        public imgSmallUrl: string,
        public imgUrl: string,
        public likes: number,
        public shortBody: string,
        public status: string,
        public title: string,
        public image: any,
        public category: any,
        public timeOfCreation?: string,
        public timeOfPublication?: string,

    ) {}
}