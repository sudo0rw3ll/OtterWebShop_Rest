const { urlencoded } = require("body-parser");
const express = require("express");
const {sequelize, City, User} = require("../models");
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

route.get("/", async(req,res) => {
    try{
        const cities = await City.findAll();
        return res.json(cities);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska",data:err});
    }
});

route.get("/:id", async(req, res) => {
    try{
        const cityById = await City.findByPk(req.params.id);

        return res.json(cityById);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska",data:err});
    }
});

const {Op} = require("sequelize");
route.get("/findCity/:q", async(req, res) => {
    try{
        const cityMatches = await City.findAll({
                where: {
                    city_name:{
                        [Op.substring]: req.params.q
                    }
                }
            });
        return res.json(cityMatches);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska",data:err});
    }
});

route.put("/editCity/:id", async(req,res) => {
    try{
        const shema = Joi.object().keys({
            id: Joi.number().required(),
            city_name: Joi.string().trim().required(),
            region_id: Joi.number().required(),
            country_id: Joi.number().required()
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

            const newCity = await City.findByPk(req.params.id);
            newCity.city_name = req.body.city_name;
            newCity.country_id = req.body.country_id;
            newCity.region_id = req.body.region_id;

            await newCity.save();

            return res.json(newCity);
        }else{
            res.status(401).json({error:"Can't fulfill this request"});
        }

    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska",data:err});
    }
});

route.post("/addCity/", async(req,res) => {
    try{
        const shema = Joi.object().keys({
            city_name: Joi.string().trim().required(),
            region_id: Joi.number().required(),
            country_id: Joi.number().required()
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

            const newCity = await City.create(req.body);
            return res.json(newCity);
        }else{
            res.json(401).json({error:"Can't fulfill this request"});
        }
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", data:err});
    }
});

route.delete("/deleteCity/:id", async(req, res) => {
    try{
        const user = await User.findOne({
            where : {
                id : req.user.userId
            }
        });

        if(user.role_id == 1 || user.role_id == 2){
            const cityToDelete = await City.findByPk(req.params.id);
            await cityToDelete.destroy();

            return res.json(cityToDelete);
        }else{
            res.status(401).json({error:"Can't fulfill this request"});
        }
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska",data:err});
    }
});