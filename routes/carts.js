const express = require("express");
const {sequelize, Cart, User} = require("../models");
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
route.use(express.json());
route.use(express.urlencoded({extended:true}));
route.use(authToken);

module.exports = route;

route.get("/", async (req, res) => {
    try{
        const carts = await Cart.findAll();
        return res.json(carts);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska",body:err});
    }
});

route.get("/:id", async (req, res) => {
    try{
        const cartById = await Cart.findByPk(req.params.id);
        return res.json(cartById);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", body:err});
    }
});

route.post("/createCart/", async (req, res) => {
    try{
        const shema = Joi.object().keys({
            user_cart_id: Joi.number().required()
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

            const newCart = await Cart.create(req.body);
            return res.json(newCart);
        }else{
            res.status(401).json({error:"Can't fulfill this request"});
        }
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", body:err});
    }
});

route.put("/editCart/:id", async (req, res) => {
    try{
        const shema = Joi.object().keys({
            id: Joi.number().required(),
            user_cart_id: Joi.number().required()
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

            const cartToEdit = await Cart.findByPk(req.params.id);

            cartToEdit.user_cart_id = req.body.user_cart_id;

            await cartToEdit.save();

            return res.json(cartToEdit);
        }else{
            res.status(401).json({error:"Can't fulfill this request"});
        }
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", body:err});
    }
});

route.delete("/deleteCart/:id", async (req, res) => {
    try{
        const user = await User.findOne({
            where : {
                id : req.user.userId
            }
        });

        if(user.role_id == 1 || user.role_id == 2){
            const cartToDelete = await Cart.findByPk(req.params.id);
            await cartToDelete.destroy();

            return res.json(cartToDelete);
        }else{
            res.status(401).json({error:"Can't fulfill this request"});
        }
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska",body:err});
    }
});