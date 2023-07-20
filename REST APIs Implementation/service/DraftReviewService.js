'use strict';

const DraftReview = require('../components/draftReview');
const Collaboration = require('../components/collaboration');
const db = require('../components/db');

exports.getOpenCollab = (filmId,reviewerId)=>{
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
                    const sql2 = "SELECT c.id, c.author, c.rating, c.description AS descriptionc, d.userId, d.agreement, d.description AS descriptiond "+
                    "FROM collaborations c, draftReviews d "+
                    "WHERE filmId = ? AND open = true AND d.collaborationId=c.id";
                    db.all(sql2,[filmId],(err,rows)=>{
                        if(err){
                            reject(err)
                        } else {
                            let contain = false;
                            rows.forEach((row)=>{
                                if(row.userId===Number(reviewerId)){
                                    contain=true;
                                }
                            })
                            if(contain){
                                const collab = new Collaboration(rows[0].id,filmId,rows[0].author,rows[0].rating,rows[0].descriptionc,true,false,rows.map((row)=>new DraftReview(row.id,row.userId,row.agreement,row.descriptiond)));
                                resolve(collab);
                            } else {
                                reject(404)
                            }
                        }
                    })
                }
            })
        }
    })
}

exports.createOpenCollab = (filmId,reviewerId,rating,description) => {
    return new Promise((resolve,reject)=>{
        if(!filmId || !Number.isInteger(Number(filmId)) || !reviewerId || !Number.isInteger(Number(reviewerId)) || !rating || !description){
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
                    const sql2 = "SELECT id, author, rating, c.description as descriptionc, userId "+
                        "FROM collaborations c, draftReviews d "+
                        "WHERE filmId = ? AND d.collaborationId=c.id AND open = true";
                    db.all(sql2,[filmId],(err,rows)=>{
                        if(err){
                            reject(err)
                        } else if(rows.length === 0){
                            reject(404);
                        } else if(rows[0].author || rows[0].rating || rows[0].descriptionc){
                            reject(400);
                        } else {
                            let contain = false;
                            rows.forEach((row)=>{
                                if(row.userId===Number(reviewerId)){
                                    contain=true;
                                }
                            })
                            if(contain){
                                const sql3 = "UPDATE collaborations SET author = ?, rating = ?, description = ? WHERE id = ?";
                                const sql4 = "UPDATE draftReviews SET agreement = true WHERE userId = ? AND collaborationId = ?";
                                const promises = [];
                                promises.push(db.run(sql3,[reviewerId,rating,description,rows[0].id]));
                                promises.push(db.run(sql4,[reviewerId,rows[0].id]));
                                Promise.all(promises)
                                    .then(()=>resolve(new Collaboration(rows[0].id,filmId,reviewerId,rating,description,true,false)))
                                    .catch((err)=>reject(err))
                            } else {
                                reject(404);
                            }
                        }
                    })
                }
            })
        }
    })
}

exports.addAgreement = (filmId,reviewerId,agreement,description) => {
    return new Promise((resolve,reject)=>{
        if(!filmId || !Number.isInteger(Number(filmId)) || !reviewerId || !Number.isInteger(Number(reviewerId)) || agreement===undefined){
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
                    const sql2 = "SELECT id FROM collaborations WHERE filmId = ? AND open = true AND description IS NOT NULL";
                    db.all(sql2,[filmId],(err,rows)=>{
                        if(err){
                            reject(500);
                        } else if(rows.length===0){
                            reject(404);
                        } else {
                            const descr = agreement===true ? " " : ", description = ? "
                            const sql3 = "UPDATE draftReviews SET agreement = ?" + descr + "WHERE userId = ? AND collaborationId = ? AND agreement IS NULL";
                            let params;
                            agreement===true ?
                                params = [agreement,reviewerId,rows[0].id]
                            :
                                params = [agreement,description,reviewerId,rows[0].id]
                            db.run(sql3,params,(err)=>{
                                if(err){
                                    reject(err);
                                } else {
                                    const sql4 = "SELECT agreement FROM draftReviews WHERE collaborationId = ?";
                                    db.all(sql4,[rows[0].id],(err,rows2)=>{
                                        if(err){
                                            reject(err);
                                        } else if(rows2.length === 0){
                                            reject(404);
                                        } else {
                                            let count = 0;
                                            let completed = 0;
                                            rows2.forEach(row => {
                                                if(row.agreement === true || row.agreement === false || row.agreement === 0 || row.agreement === 1){
                                                    count++;
                                                }
                                                if(row.agreement == true){
                                                    completed++;
                                                }
                                            });
                                            if(completed === rows2.length){
                                                const sql5 = "UPDATE collaborations SET open = false, completed = true WHERE id = ?";
                                                db.run(sql5,[rows[0].id],(err)=>{
                                                    if(err){
                                                        reject(err);
                                                    } else {
                                                        resolve({});
                                                    }
                                                })
                                            } else if(count === rows2.length){
                                                const sql5 = "UPDATE collaborations SET open = false, completed = false WHERE id = ?";
                                                db.run(sql5,[rows[0].id],(err)=>{
                                                    if(err){
                                                        reject(err);
                                                    } else {
                                                        resolve({});
                                                    }
                                                })
                                            } else {
                                                resolve({});
                                            }
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    })
}