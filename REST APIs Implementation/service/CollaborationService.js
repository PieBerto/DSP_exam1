'use strict';

const Collaboration = require('../components/collaboration');
const DraftReview = require('../components/draftReview');
const db = require('../components/db');

exports.getCollaborationReviewsTotal = (filmId)=>{
    return new Promise((resolve,reject)=>{
        if(!filmId || !Number.isInteger(Number(filmId))){
            reject(400);
        } else {
            const sql1 = 'SELECT private FROM films WHERE id = ?';
            db.all(sql1,[filmId],(err,rows1)=>{
                if(err){
                    reject(500);
                } else if(rows1.length === 0){
                    reject(404);
                } else if(rows1[0].private === 0){
                    reject(404);
                } else {
                    const sql2 = "SELECT id,author,rating,description FROM collaborations WHERE filmId = ? AND completed = true";
                    db.all(sql2,[filmId],(err,rows)=>{
                        if(err){
                            reject(500);
                        } else{
                            const collabs = rows.map((row)=> new Collaboration(row.id,filmId,row.author,row.rating,row.description))
                            resolve(collabs);
                        }
                    })
                }
            })
        }
    })
}

exports.getCollaborationReview = (collaborationId) => {
    return new Promise((resolve,reject)=>{
        if(!collaborationId || !Number.isInteger(Number(collaborationId))){
            reject(400);
        } else {            
            const sql2 = "SELECT id,filmId,author,rating,description,open,completed FROM collaborations WHERE id = ?";
            db.all(sql2,[collaborationId],(err,rows)=>{
                if(err){
                    reject(500);
                } else if(rows.length === 0){
                    reject(404);
                } else {
                    const sql3 = "SELECT userId,agreement,description FROM draftReviews WHERE collaborationId = ?";
                    db.all(sql3,[rows[0].id],(err,rows2)=>{
                        const collab = new Collaboration(rows[0].id,rows[0].filmId,rows[0].author,rows[0].rating,rows[0].description,rows[0].open,rows[0].completed,rows2.map((row)=>new DraftReview(rows[0].id,row.userId,row.agreement,row.description)));
                        resolve(collab);
                    })
                }
            })
        }
    })
}

exports.createSingleCollaborationReview = (filmId,users,userId) => {
    return new Promise((resolve,reject)=>{
        if(!filmId || !Number.isInteger(Number(filmId)) || !users || users.length<2){
            reject(400);
        } else {
            const sql1 = 'SELECT private,owner FROM films WHERE id = ?';
            db.all(sql1,[filmId],(err,rows1)=>{
                if(err){
                    reject(500);
                } else if(rows1.length === 0){
                    reject(404);
                } else if(rows1[0].private === 0){
                    reject(404);
                } else if(rows1[0].owner !== userId){
                    reject(401);
                } else {
                    const sql15 = "SELECT filmId FROM collaborations WHERE filmId = ? AND open = true";
                    db.all(sql15,[filmId],(err,rows2)=>{
                        if(err){
                            reject(err);
                        } else if(rows2.length !== 0){
                            reject("400b");
                        } else {
                            const sql2 = "INSERT INTO collaborations(filmId) VALUES (?) RETURNING id";
                            db.all(sql2,[filmId],(err,rows)=>{
                                if(err){
                                    reject(500);
                                } else{
                                    Promise.all(users.map(user => 
                                        new Promise((resolve1,reject1)=>{
                                            const sql3 = "INSERT INTO draftReviews(collaborationId, userId) VALUES (?,?)"
                                            db.run(sql3,[rows[0].id,user],(err)=>{
                                                if(err){
                                                    reject1(500)
                                                } else {
                                                    resolve1(true)
                                                }
                                            })
                                        })
                                    ))
                                        .then(()=>resolve(new Collaboration(rows[0].id,filmId,undefined,undefined,undefined,true,false)))
                                        .catch(()=>reject(500))
                                }
                            })
                        }
                    })
                }
            })
        }
    })
}

exports.getUserCollaborationReviews = (filmId,reviewerId) => {
    return new Promise((resolve,reject)=>{
        if(!filmId || !Number.isInteger(Number(filmId)) || !reviewerId || !Number.isInteger(Number(reviewerId))){
            reject(400);
        } else {
            const sql1 = 'SELECT private FROM films WHERE id = ?';
            db.all(sql1,[filmId],(err,rows1)=>{
                if(err){
                    reject(500);
                } else if(rows1.length === 0){
                    reject(404);
                } else if(rows1[0].private === 0){
                    reject(404);
                } else {
                    const sql2 = "SELECT id,filmId,author,rating,c.description,open,completed FROM collaborations c, draftReviews d WHERE d.userId = ? AND filmId = ? AND d.collaborationId=c.id";
                    db.all(sql2,[reviewerId,filmId],(err,rows)=>{
                        if(err){
                            reject(500);
                        } else if(rows.length === 0){
                            reject(404);
                        } else{
                            const collab = rows.map((row)=> new Collaboration(row.id,filmId,row.author,row.rating,row.description,row.open,row.completed));
                            resolve(collab);
                        }
                    })
                }
            })
        }
    })
}