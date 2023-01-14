const express = require("express");
const {sequelize, Comment, User} = require("../models");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
require('dotenv').config();

function authToken(req, res, next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if(token == null) return res.status(401).json({msg: err});

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) return res.status(403).json({msg:err});

        req.user = user;

        next();
    });
}

const route = express.Router();

route.use(authToken);
route.use(express.json());
route.use(express.urlencoded({extended:true}));

module.exports = route;

route.get("/", async(req, res) => {
    try{
        const comments = await Comment.findAll();
        return res.json(comments);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska",data:err});
    }
});

route.get("/:id", async(req, res) => {
    try{
        const commentById = await Comment.findByPk(req.params.id);
        return res.json(commentById);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska",data:err});
    }
});

const {Op} = require("sequelize");
const comment = require("../models/comment");
route.get("/findComment/:q", async(req,res) => {
    try{
        const commentsMatch = await Comment.findAll({
            where : {
                comment_body : {
                    [Op.substring] : req.params.q
                }
            }
        });
        return res.json(commentsMatch);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", data:err});
    }
});

route.post("/addComment", async(req, res) => {
    try{
        const shema = Joi.object().keys({
            comment_body: Joi.string().trim().required(),
            rank: Joi.number().min(1).max(5).required(),
            user_id: Joi.number().required(),
            product_id: Joi.number().required()
        });

        const user = await User.findOne({
            where : {
                id : req.user.userId
            }
        });


        // ako je admin ili moderator
        if(user.role_id == 1 || user.role_id == 2){
            const {error, succ} = shema.validate(req.body);

            if(error){
                res.status(400).json({msg: "Greska prilikom popunjavanja forme " + error.details[0].message});
                return;
            }

            const newComment = await Comment.create(req.body);
            return res.json(newComment);
        }else{
            res.status(401).json({error:"Can't fulfill this request"});
        }
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", data:err});
    }
});

route.put("/editComment/:id", async(req,res) => {
    try{
        const shema = Joi.object().keys({
            id: Joi.number().required(),
            comment_body: Joi.string().trim().required(),
            rank: Joi.number().min(1).max(5).required(),
            user_id: Joi.number().required(),
            product_id: Joi.number().required()
        });

        const user = await User.findOne({
            where : {
                id : req.user.userId
            }
        });

        if(user.role_id == 1 || user.role_id == 2){
            const {error, succ} = shema.validate(req.body);

            if(error){
                res.status(400).json({msg: "Greska prilikom popunjavanja forme " + error.details[0].message});
                return;
            }
           
            const commentToEdit = await Comment.findByPk(req.params.id);
            commentToEdit.comment_body = req.body.comment_body;
            commentToEdit.rank = req.body.rank;
            await commentToEdit.save();

            return res.json(commentToEdit);
        }else{
            res.status(401).json({error:"Can't fulfill this request"});
        }
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", data:err});
    }
});

route.delete("/deleteComment/:id", async(req, res) => {
    try{
        const user = await User.findOne({
            where : {
                id : req.user.userId
            }
        });

        if(user.role_id == 1 || user.role_id == 2){
            const commentToDelete = await Comment.findByPk(req.params.id);
            await commentToDelete.destroy();

            return res.json(commentToDelete);
        }else{
            res.status(401).json({error:"Can't fulfill this request"})
        }

    }catch(err){  
        console.log(err);
        res.status(500).json({error:"Greska",data:err});
    }
});