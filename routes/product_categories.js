const express = require("express");
const {sequelize, ProductCategory, Product, User} = require("../models");
const jwt = require('jsonwebtoken');
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
        const productCategories = await ProductCategory.findAll();
        return res.json(productCategories);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska",data:err});
    }
});

route.get("/:id", async(req, res) => {
    try{
        const productById = await ProductCategory.findByPk(req.params.id);
        return res.json(productById);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", data:err});
    }
});

const {Op} = require("sequelize");
route.get("/findProductCategory/:q", async(req, res) => {
    try{
        const productCategoriesMatch = await ProductCategory.findAll({
            where: {
                cat_name: {
                    [Op.substring]: req.params.q
                }
            }
        });

        return res.json(productCategoriesMatch);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", data:err});
    }
});

route.post("/addProductCategory/", async(req, res) => {
    try{
        const shema = Joi.object().keys({
            cat_name: Joi.string().trim().required()
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

            const newProductCategory = await ProductCategory.create(req.body);
            return res.json(newProductCategory);
        }else{
            res.status(401).json({error:"Can't fulfill this request"});
        }
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska",data:err});
    }
});

route.put("/editProductCategory/:id", async(req, res) => {
    try{
        const shema = Joi.object().keys({
            id: Joi.number().required(),
            cat_name: Joi.string().required()
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

            const productCatToEdit = await ProductCategory.findByPk(req.params.id);
            productCatToEdit.cat_name = req.body.cat_name;
            await productCatToEdit.save();
            
            return res.json(productCatToEdit);
        }else{
            res.status(401).json({error:"Can't fulfill this request"});
        }
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska",data:err});
    }
});

route.delete("/deleteProductCategory/:id", async(req, res) => {
    try{
        const user = await User.findOne({
            where : {
                id : req.user.userId
            }
        });

        if(user.role_id == 1 || user.role_id == 2){
            const productCatToDelete = await ProductCategory.findByPk(req.params.id);
            await productCatToDelete.destroy();

            return res.json(productCatToDelete);
        }else{
            res.status(401).json({error:"Can't fulfill this request"});
        }
    }catch(err){
        console.log(err);
        res.status(500).json({error: "Greska", data:err});
    }
});