const express = require("express");
const {sequelize, User} = require("../models");
const jwt = require('jsonwebtoken');
const Joi = require("joi");
const bcrypt = require("bcrypt");
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

route.get("/", async(req,res) => {
    try{
        const users = await User.findAll();
        return res.json(users);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska",data:err});
    }
});

route.get("/:id", async (req, res) => {
    try{
        const userById = await User.findByPk(req.params.id);
        return res.json(userById);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", data:err});
    }
});

const {Op} = require("sequelize");
route.get("/findUser/:q", async (req, res) => {
    try{
        const userMatches = await User.findAll({
            where : {
                username: {
                    [Op.substring] : req.params.q
                }
            }
        });
        return res.json(userMatches);
    }catch(err){
        res.status(500).json({error:"Greska",data:err});
    }
});

route.post("/addUser", async (req, res) => {
    try{
        const shema = Joi.object().keys({
            name: Joi.string().trim().min(5).max(30).required(),
            surname: Joi.string().trim().min(5).max(30),
            email: Joi.string().trim().email().required(),
            password: Joi.string().trim().pattern(new RegExp("(?=.*\d)(?=.*[!@#$%^&*+-])(?=.*[a-z])(?=.*[A-Z]).{8,}$")).required(),
            mobile_phone: Joi.string().trim().pattern(new RegExp("^[0-9]{3}\/?[0-9]{6,7}$")).required(),
            role_id: Joi.number(),
            location_id: Joi.number(),
            username: Joi.string().trim().pattern(new RegExp("^[A-Za-z][A-Za-z0-9_]{7,29}$")).required()
        });

        const user = await User.findOne({
            where : {
                id : req.user.userId
            }
        });

        if(user.role_id == 1){
            const {error, success} = shema.validate(req.body);

            req.body.password = bcrypt.hashSync(req.body.password, 10);

            if(error){
                res.status(400).json({msg: "Greska u pounjavanju forme: " + error.details[0].message});
                return;                
            }

            const newUser = await User.create(req.body);
            return res.json(newUser);
        }else{
            res.status(403).json({error:"Can't fulfill this request"})
        }
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", data:err});
    }
});

route.put("/editUser/:id", async (req, res) => {
    try{
        const shema = Joi.object().keys({
            id: Joi.number().required(),
            name: Joi.string().trim().min(5).max(30).required(),
            surname: Joi.string().trim().min(5).max(30),
            email: Joi.string().trim().email().required(),
            password: Joi.string().trim().pattern(new RegExp("(?=.*\d)(?=.*[!@#$%^&*+-])(?=.*[a-z])(?=.*[A-Z]).{8,}$")).required(),
            mobile_phone: Joi.string().trim().pattern(new RegExp("^[0-9]{3}\/?[0-9]{6,7}$")).required(),
            role_id: Joi.number(),
            location_id: Joi.number(),
            username: Joi.string().trim().pattern(new RegExp("^[A-Za-z][A-Za-z0-9_]{7,29}$")).required()
        });

        const user = await User.findOne({
            where : {
                id : req.user.userId
            }
        });

        if(user.role_id == 1){
           
            const {error, success} = shema.validate(req.body);

            if(error){
                res.status(400).json({msg: "Greska u popunjavanju forme: " + error.details[0].message})
                return;                
            }
           
            const userToEdit = await User.findByPk(req.params.id);
            userToEdit.name = req.body.name;
            userToEdit.surname = req.body.surname;
            userToEdit.email = req.body.email;
            userToEdit.username = req.body.username;
            userToEdit.password = bcrypt.hashSync(req.body.password, 10);
            userToEdit.mobile_phone = req.body.mobile_phone;
            userToEdit.location_id = req.body.location_id;
            userToEdit.role_id = req.body.role_id;

            await userToEdit.save();

            return res.json(userToEdit);
        }else{
            res.status(401).json({error:"Can't fulfill this request"})
        }
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska",data:err});
    }
});

route.delete("/deleteUser/:id", async (req, res) => {
    try{
        const user = await User.findOne({
            where : {
                id : req.user.userId
            }
        });

        if(user.role_id == 1){
            const userToDelete = await User.findByPk(req.params.id);
            await userToDelete.destroy();

            return res.json(userToDelete);
        }else{
            res.status(401).json({error:"Can't fulfill this request"});
        }
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", data:err});
    }
});