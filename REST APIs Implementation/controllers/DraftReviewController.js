'use strict';

const utils = require('../utils/writer.js');
const DraftReviews = require('../service/DraftReviewService');

module.exports.getOpenCollaborationDraft = (req,res,next) =>{
    if(Number(req.params.reviewerId) !== req.user.id){
        utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'Wrong user inserted!' }], }, 401);
    } else {
        DraftReviews.getOpenCollab(req.params.filmId,req.params.reviewerId)
            .then((response)=>{
                utils.writeJson(res, response);
            })
            .catch((response)=>{
                if(response===400){
                    utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The specified filmId or the reviewerId is not a valid integer number.' }], }, response);
                } else if(response===404){
                    utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'Can\'t find the specified filmId or the agreement has already been sent.' }], }, response);
                } else {
                    utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': response }], }, 500);
                }
            })
    }
}

module.exports.CreateOpenCollaborationDraft = (req,res,next) => {
    if(Number(req.params.reviewerId) !== req.user.id){
        utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'Wrong user inserted!' }], }, 401);
    } else {
        DraftReviews.createOpenCollab(req.params.filmId,req.params.reviewerId,req.body.rating,req.body.description)
            .then((response)=>{
                utils.writeJson(res, response,201);
            })
            .catch((response)=>{
                if(response===400){
                    utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The specified filmId or the reviewerId or the body is not valid.' }], }, response);
                } else if(response===404){
                    utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'Can\'t find the specified filmId.' }], }, response);
                } else {
                    utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': response }], }, 500);
                }
            })
    }
}

module.exports.modifyOpenCollaborationDraft = (req,res,next) => {
    if(Number(req.params.reviewerId) !== req.user.id){
        utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'Wrong user inserted!' }], }, 401);
    } else {
        DraftReviews.addAgreement(req.params.filmId,req.params.reviewerId,req.body.agreement,req.body.description)
            .then((response)=>{
                utils.writeJson(res, response,204);
            })
            .catch((response)=>{
                if(response===400){
                    utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'The specified filmId or the reviewerId or the body is not valid.' }], }, response);
                } else if(response===404){
                    utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'Can\'t find the specified filmId or the related draft.' }], }, response);
                } else {
                    utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': response }], }, 500);
                }
            })
    }
}