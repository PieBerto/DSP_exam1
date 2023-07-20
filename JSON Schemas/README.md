## JSON Schemas

This folder contains the JSON Schemas.

# collaboration_schema

An object that rapresent even the coperative review by his 2 first effective fields (collaborationId,filmId), even the review draft by author, rating and description, even the status of the review draft by open and completed, then it has an array of draftReview_schemas that rapresents the users' agreement or disagreement

# draftReview_schema

The collaborationId is a link to his respective collaboration_schema while userId, agreement and description are the agreement or disagreement of each user.
