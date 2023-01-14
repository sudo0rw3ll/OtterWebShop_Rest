const express = require("express");
const {sequelize, Country, User} = require("../models");
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

// Ova ruta se koristi kada zelimo da dohvatimo sve
// podatke o zemljama koje se nalaze unutar tabele
route.get("/", async(req, res) => {
    try{
        const countries = await Country.findAll();
        return res.json(countries);
    }catch(err){
        console.log(err);
        res.status(500).json({error: "Greska", data: err});
    }
});

// Ovu rutu koristimo da dovucemo drzavu iz tabele koja ima
// id koji je prosledjen
route.get("/:id",async(req, res) => {
    try{
        let countryById = await Country.findAll({
            where: {
                id: req.params.id
            }
        });

        return res.json(countryById);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska",data:err});
    }
});


// Ovu rutu korisitmo da insertujemo novu drzavu u tabelu
route.post("/addCountry", async (req, res) => {
    try{
        const shema = Joi.object().keys({
            country_name: Joi.string().trim().required(),
            iso2: Joi.string().trim().max(2).required()
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

            const newCountry = await Country.create(req.body);
            return res.json(newCountry);
        }else{
            res.status(401).json({error:"Can't fulfill this request"});
        }
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", data:err});
    }
});

// Ovu rutu koristimo kada zelimo da pretrazimo sve drzave koje
// u svom nazivu sadrze query string koji je prosledjen (:q)
const {Op} = require("sequelize");
route.get("/findCountry/:q", async (req,res) => {
    try{
        const countryMatches = await Country.findAll({
            where:{
                country_name:{
                    [Op.substring]: req.params.q
                }
            }         
        });

        return res.json(countryMatches);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", data:err});
    }
});

// Ovu rutu koristimo kada zelimo da obrisemo neku drzavu po njenom id-u
route.delete("/deleteCountry/:id", async (req, res) => {
    try{
        const user = await User.findOne({
            where : {
                id : req.user.userId
            }
        });

        if(user.role_id == 1){
            const country = await Country.findByPk(req.params.id);
            await country.destroy();
            res.send(country);
        }else{
            res.status(401).json({error:"Can't fulfill this request"});
        }
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", data:err});
    }
});

// Id ide na rutu a podaci idu u json pa u put zahtev body
// params je kad je iz url-a a body kad je iz zahteva
route.put("/edit/:id", async (req, res) => {
    try{
        const shema = Joi.object().keys({
            id: Joi.number().required(),
            country_name: Joi.string().trim().required(),
            iso2: Joi.string().trim().max(2).required()
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

            const country = await Country.findByPk(req.params.id);
            country.country_name = req.body.country_name;
            country.iso2 = req.body.iso2;
            await country.save();
            return res.json(country);
        }else{
            res.status(401).json({error:"Can't fulfill this request"});
        }
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", data:err});
    }
});