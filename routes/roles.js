const express = require("express");
const {sequelize, Role, User} = require("../models");
const jwt = require('jsonwebtoken');
const Joi = require("joi");
require('dotenv').config();

const route = express.Router();

route.use(express.json());
route.use(express.urlencoded({extended:true}));

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

route.use(authToken);

module.exports = route;

route.get("/", async (req, res) => {
    try{
        const roles = await Role.findAll();
        return res.json(roles);
    }catch(err){
        console.log(err);
        res.send(500).json({error:"Greska", data:err});
    }
});

route.get("/:id", async (req, res) => {
    try{
        const roleById = await Role.findByPk(req.params.id);
        return res.json(roleById);
    }catch(err){
        console.log(err);
        res.send(500).json({error:"Greska", data:err});
    }
});

const {Op} = require("sequelize");
route.get("/findRole/:q", async(req, res) => {
    try{
        const roleMatches = await Role.findAll({
            where : {
                role_name : {
                    [Op.substring]: req.params.q
                }
            }
        });

        return res.json(roleMatches);
    }catch(err){
        console.log(err);
        res.send(500).json({error:"Greska", data:err});
    }
});

route.post("/addRole/", async(req, res) => {
    try{
        const shema = Joi.object().keys({
            role_name: Joi.string().trim().required()
        });

        const user = await User.findOne({
            where: {
                id: req.user.userId
            }
        });

        if(user.role_id == 1){
            const {error, succ} = shema.validate(req.body);
            
            if(error){
                res.status(400).json({msg:"Lose popunjena forma " + error.details[0].message});
                return;
            }

            const newRole = await Role.create(req.body);
            return res.json(newRole);
        }
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", data:err})
    }
});

route.put("/editRole/:id", async(req, res) => {
    try{
        const shema = Joi.object().keys({
            id: Joi.number().required(),
            role_name: Joi.string().trim().required()
        });

        const user = await User.findOne({
            where: {
                id: req.user.userId
            }
        });

        if(user.role_id == 1){
            const {error, succ} = shema.validate(req.body);

            if(error){
                res.status(400).json({msg:"Moras uneti string"});
                return;
            }

            const roleToEdit = await Role.findByPk(req.params.id);
            roleToEdit.role_name = req.body.role_name;
    
            await roleToEdit.save();    
            return res.json(roleToEdit);
        }

        // const roleToEdit = await Role.findByPk(req.params.id);
        // roleToEdit.role_name = req.body.role_name;

        // await roleToEdit.save();

        // return res.json(roleToEdit);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska",data:err});
    }
});

route.delete("/deleteRole/:id", async(req, res) => {
    try{
        const user = await User.findOne({
            where: {
                id: req.user.userId
            }
        });

        if(user.role_id == 1){
            const roleToDelete = await Role.findByPk(req.params.id);
            await roleToDelete.destroy();
    
            return res.json(roleToDelete);
        }
        // const roleToDelete = await Role.findByPk(req.params.id);
        // await roleToDelete.destroy();

        // return res.json(roleToDelete);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska",data:err});
    }
});