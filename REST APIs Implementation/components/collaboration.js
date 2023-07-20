class Collaboration{
    constructor(collaborationId,filmId,author,rating,description,open = undefined,completed = undefined,draftReview){
        if(collaborationId)
            this.collaborationId=collaborationId;
        if(filmId)
            this.filmId=filmId;
        if(author)
            this.author=author;
        this.rating=rating;
        this.description=description;
        if(open !== undefined)
            this.open=open;
        if(completed !== undefined)
            this.completed=completed;
        if(draftReview){
            this.draftReview = draftReview;
        }
        const selfLink = "/api/film/public/collaborationReviews/"+this.collaborationId;
        this.self = selfLink;
    }
}

module.exports = Collaboration;