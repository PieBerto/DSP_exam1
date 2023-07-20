class DraftReview{
    constructor(collaborationId,userId,agreement,description){
        if(collaborationId)
            this.collaborationId=collaborationId;
        if(userId)
            this.userId=userId;
        this.agreement=agreement;
        if(description)
            this.description=description;
    }
}

module.exports = DraftReview;