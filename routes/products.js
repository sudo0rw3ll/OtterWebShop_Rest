const express = require("express");
const {sequelize, Product, User} = require("../models");
const jwt = require("jsonwebtoken");
const Joi = require("joi");

require("dotenv").config();

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
        const products = await Product.findAll();
        return res.json(products);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska",data:err});
    }
});

route.get("/:id", async (req, res) => {
   try{
        const productById = await Product.findByPk(req.params.id);
        return res.json(productById);        
   }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", data:err});
   } 
});

const {Op} = require("sequelize");
route.get("/findProduct/:q", async (req, res) => {
    try{
        const productMatches = await Product.findAll(
            {
                where : {
                    title : {
                        [Op.substring] : req.params.q
                    }
                }
            }
        );
        return res.json(productMatches);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", data:err});
    }
});

route.post("/addProduct/", async (req, res) => {
    try{
        const shema = Joi.object().keys({
            title: Joi.string().trim().required(),
            description: Joi.string().trim().required(),
            image: Joi.string().trim().required(),
            price: Joi.number().required(),
            is_available: Joi.string().valid('true','false').required(),
            quantity: Joi.number().required(),
            ProductCategoryId: Joi.number().required()
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

            const newProduct = await Product.create(req.body);
            return res.json(newProduct);
        }else{
            res.status(401).json({error:"Can't fulfill this request"});
        }
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", data:err});
    }
});

route.put("/editProduct/:id", async (req, res) => {
    try{
        const shema = Joi.object().keys({
            id: Joi.number().required(),
            title: Joi.string().trim().required(),
            description: Joi.string().trim().required(),
            image: Joi.string().trim().required(),
            price: Joi.number().required(),
            is_available: Joi.string().valid('true','false').required(),
            quantity: Joi.number().required(),
            ProductCategoryId: Joi.number().required()
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

            const productToEdit = await Product.findByPk(req.params.id);
            productToEdit.title = req.body.title;
            productToEdit.description = req.body.description;
            productToEdit.image = req.body.image;
            productToEdit.price = req.body.price;
            productToEdit.is_available = req.body.is_available;
            productToEdit.quantity = req.body.quantity;
            productToEdit.ProductCategoryId = req.body.ProductCategoryId;

            await productToEdit.save();

            return res.json(productToEdit);
        }else{
            res.status(401).json({error:"Can't fulfill this request"});
        }
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", data:err});
    }
});

route.delete("/deleteProduct/:id", async (req, res) => {
    try{
        const user = await User.findOne({
            where : {
                id : req.user.userId
            }
        });

        if(user.role_id == 1 || user.role_id == 2){
            const productToDelete = await Product.findByPk(req.params.id);
            await productToDelete.destroy();

            return res.json(productToDelete);
        }else{
            res.status(401).json({error:"Can't fulfill this request"});
        }
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", data:err});
    }
});