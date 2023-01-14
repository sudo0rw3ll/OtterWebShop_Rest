const express = require("express");
const {sequelize, Region, User} = require("../models");
const jwt = require('jsonwebtoken');
const Joi = require("joi");

require('dotenv').config();

const route = express.Router();

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
route.use(express.json());
route.use(express.urlencoded({extended:true}));

module.exports = route;

route.get("/", async (req, res) => {
    try{
        const regions = await Region.findAll();
        return res.json(regions);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", data:err});
    }
});

route.get("/:id", async (req, res) => {
    try{
        const regionById = await Region.findAll(
            {
                where: {
                    id: req.params.id
                }
            });
        return res.json(regionById);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", data:err});
    }
});

route.post("/addRegion/", async (req, res) => {
    try{

        const shema = Joi.object().keys({
            region_name: Joi.string().trim().required(),
            country_id: Joi.number().required()
        });

        const user = await User.findOne({
            where : {
                id: req.user.userId
            }
        });

        if(user.role_id == 1 || user.role_id == 2){
            const {error, succ} = shema.validate(req.body);

            if(error){
                res.status(400).json({error:"Nepravilno uneseni podaci",body:error});
                return;
            }

            const newRegion = await Region.create(req.body);
            return res.json(newRegion);
        }else{
            res.status(401).json({error:"Can't fulfill this request"});
        }
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska",data:err});
    }
});

route.put("/editRegion/:id", async (req, res) => {
    try{
        const shema = Joi.object().keys({
            id: Joi.number().required(),
            region_name: Joi.string().trim().required(),
            country_id: Joi.number().required()
        });

        const user = await User.findOne({
            where : {
                id: req.user.userId
            }
        });

        if(user.role_id == 1 || user.role_id == 2){
            const {error, succ} = shema.validate(req.body);

            if(error){
                res.status(400).json({msg:"Nepravilno uneti podaci"+error.details[0].message});
                return;
            }

            const regionToEdit = await Region.findByPk(req.params.id);

            regionToEdit.region_name = req.body.region_name;
            regionToEdit.country_id = req.body.country_id;
    
            await regionToEdit.save();
        
            return res.json(regionToEdit);  
        }else{
            res.status(401).json({error:"Can't fulfill this request"});
        }
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", data:err});
    }
});

route.delete("/deleteRegion/:id", async (req, res) => {
    try{
        const user = await User.findOne({
            where : {
                id : req.user.userId
            }
        });

        if(user.role_id == 1 || user.role_id == 2){
            const regionToDelete = await Region.findByPk(req.params.id);
            await regionToDelete.destroy();
            res.send(regionToDelete);
        }else{
            res.status(401).json({error:"Can't fulfill this request"});
        }
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", data:err});
    }
});

const {Op} = require("sequelize");
route.get("/findRegions/:q", async(req,res) => {
    try{
        const regionMatches = await Region.findAll({
            where: {
                region_name : {
                    [Op.substring]: req.params.q
                }
            }
        });
        return res.json(regionMatches);
     }catch(err){
        console.log(err);
        res.status(500).json({error: "Greska", data:err});
    }
});