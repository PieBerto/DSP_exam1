'use strict';

const utils = require('../utils/writer.js');
const Collaborations = require('../service/CollaborationService');

module.exports.getCollaborationReviews = (req,res,next) => {
    Collaborations.getCollaborationReviewsTotal(req.params.filmId)
        .then((response)=>{
            utils.writeJson(res, response);
        })
        .catch((response)=>{
            if(response===400){
                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The specified filmId is not a valid integer number.' }], }, response);
            } else if(response===404){
                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'Can\'t find the specified filmId.' }], }, response);
            } else {
                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': response }], }, 500);
            }
        })
}

module.exports.getSingleCollaborationReview = (req,res,next) => {
    Collaborations.getCollaborationReview(req.params.collaborationId)
        .then((response)=>{
            utils.writeJson(res, response);
        })
        .catch((response)=>{
            if(response===400){
                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The specified collaborationId is not a valid integer number.' }], }, response);
            } else if(response===404){
                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'Can\'t find the specified filmId.' }], }, response);
            } else if(response==="400b"){
                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'This function retrieve only completed drafts, to access the incompleted ones use your personal interface.' }], }, 400);
            } else {
                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': response }], }, 500);
            }
        })
}


module.exports.createCollaborationReview = (req,res,next) => {
    Collaborations.createSingleCollaborationReview(req.params.filmId,req.body.users,req.user.id)
        .then((response)=>{
            console.log(response)
            utils.writeJson(res,response,201);
        })
        .catch((response)=>{
            if(response===400){
                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The specified filmId or the request body is not valid.' }], }, response);
            } else if(response===401){
                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'You are not the owner of the film.' }], }, response);
            } else if(response===404){
                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'Can\'t find the specified filmId.' }], }, response);
            } else if(response==="400b"){
                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The specified filmId has already an open collaboration' }], }, response);
            } else {
                utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': response }], }, 500);
            }
        })
}

module.exports.getUserCollaborationReviews = (req,res,next) => {
    if(Number(req.params.reviewerId) !== req.user.id){
        utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'Wrong user inserted!' }], }, 401);
    } else {
        Collaborations.getUserCollaborationReviews(req.params.filmId,req.params.reviewerId)
            .then((response)=>{
                utils.writeJson(res, response);
            })
            .catch((response)=>{
                if(response===400){
                    utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The specified filmId or the collaborationId is not valid.' }], }, response);
                } else if(response===404){
                    utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'Can\'t find the specified filmId.' }], }, response);
                } else {
                    utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': response }], }, 500);
                }
            })
    }
}