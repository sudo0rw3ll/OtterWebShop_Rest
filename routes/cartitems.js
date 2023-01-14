const express = require("express");
const {sequelize, CartItem, User} = require("../models");
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

route.get("/", async (req, res) => {
    try{
        const cartItems = await CartItem.findAll();
        return res.json(cartItems);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", body:err});
    }
});

route.get("/:id", async (req, res) => {
    try{
        const cartItemById = await CartItem.findByPk(req.params.id);
        return res.json(cartItemById);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", body:err});
    }
});

// route.get("/findCartItem/");

route.post("/addCartItem/", async (req, res) => {
    try{
        const shema = Joi.object().keys({
            quantity: Joi.number().required(),
            cart_id: Joi.number().required(),
            cart_product_id: Joi.number().required()
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

            const newCartItem = await CartItem.create(req.body);
            return res.json(newCartItem);
        }else{
            res.status(401).json({error:"Can't fulfill this request"});
        }
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", body:err});
    }
});

route.put("/editCartItem/:id", async(req,res) => {
    try{
        const shema = Joi.object().keys({
            id: Joi.number().required(),
            quantity: Joi.number().required(),
            cart_id: Joi.number().required(),
            cart_product_id: Joi.number().required()
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
            
            const cartItemToEdit = await CartItem.findByPk(req.params.id);

            cartItemToEdit.quantity = req.body.quantity;
            cartItemToEdit.cart_id = req.body.cart_id;
            cartItemToEdit.cart_product_id = req.body.cart_product_id;

            await cartItemToEdit.save();

            return res.json(cartItemToEdit);
        }else{
            res.status(401).json({error:"Can't fulfill this request"});
        }
   }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", body:err});
   } 
});

route.delete("/deleteCartItem/:id", async (req, res) => {
    try{
        const user = await User.findOne({
            where : {
                id : req.user.userId
            }
        });

        // ako je admin ili moderator

        if(user.role_id == 1 || user.role_id == 2){
            const cartItemToDelete = await CartItem.findByPk(req.params.id);
            await cartItemToDelete.destroy();

            return res.json(cartItemToDelete);
        }else{
            res.status(401).json({error:"Can't fulfill this request"});
        }

    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", body:err});
    }
});