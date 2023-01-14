const express = require("express");
const {sequelize, Location, User } = require("../models");
const jwt = require("jsonwebtoken");
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

route.get("/", async(req, res) => {
    try{
        const locations = await Location.findAll();
        return res.json(locations);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", data:err});
    }
});

route.get("/:id", async(req, res) => {
    try{
        const locationById = await Location.findByPk(req.params.id);
        return res.json(locationById);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", data:err});
    }
});

const {Op} = require("sequelize");
route.get("/findLocation/:q", async(req, res) => {
    try{
        const locationMatches = await Location.findAll({
                where: {
                    address: {
                        [Op.substring]: req.params.q
                    }
                }
            }
        );
        return res.json(locationMatches);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", data:err});
    }
});

route.post("/addLocation/", async(req, res) => {
   try{
        const shema = Joi.object().keys({
            address: Joi.string().trim().required(),
            home_flat_number: Joi.number().required(),
            city_id: Joi.number().required()
        });

        const user = await User.findOne({
            where : {
                id : req.user.userId
            }
        });

        if(user.role_id == 1 || user.role_id == 2){
            const {error, succ} = shema.validate(req.body);

            if(error){
                res.status(400).json({msg:"Greska prilikom popunjavanja forme " + error.details[0].message});
                return;
            }

            const newLocation = await Location.create(req.body);
            return res.json(newLocation);
        }else{
            res.status(401).json({error:"Can't fulfill this request"});
        }
   }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", data:err});
   } 
});

route.put("/editLocation/:id", async(req, res) => {
    try{
        const shema = Joi.object().keys({
            id: Joi.number().required(),
            address: Joi.string().trim().required(),
            home_flat_number: Joi.number().required(),
            city_id: Joi.number().required()
        });

        const user = await User.findOne({
            where : {
                id : req.user.userId
            }
        });

        if(user.role_id == 1 || user.role_id == 2){
            const {error, succ} = shema.validate(req.body);

            if(error){
                res.status(400).json({msg:"Greska u popunjavanju forme " + error.details[0].message});
                return;
            }

            const locationToEdit = await Location.findByPk(req.params.id);
            locationToEdit.address = req.body.address;
            locationToEdit.home_flat_number = req.body.home_flat_number;
            locationToEdit.city_id = req.body.city_id;

            await locationToEdit.save();

            return res.json(locationToEdit);
        }else{
            res.status(401).json({error:"Can't fulfill this request"});
        }
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska",data:err});
    }
});

route.delete("/deleteLocation/:id", async(req, res) => {
    try{

        const user = await User.findOne({
            where : {
                id : req.user.userId
            }
        });

        if(user.role_id == 1 || user.role_id == 2){
            const locationToDelete = await Location.findByPk(req.params.id);
            await locationToDelete.destroy();

            return res.json(locationToDelete);
        }else{
            res.status(401).json({error:"Can't fulfill this request"});
        }
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", data:err});
    }
});