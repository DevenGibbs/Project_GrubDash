const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));
//Add order existing data
const orders = require("../data/orders-data");

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass


//VALIDATORS

// Dish does exist validation
function dishExists(req,res,next) {
    const {dishId } = req.params
    const foundDish = dishes.find((dish)=> dish.id === dishId)

    if(foundDish){
        res.locals.dish = foundDish
        return next ()
    }
    next({
        status: 404,
        message:`Dish does not exist: ${dishId}`
    })
}

// Dish props validation {name, desctiption, price, image_url}
function validateDishProps(req,res,next){
    const { data:{name,description,price, image_url} } = req.body;
  
    if(!name || name == "")
    return next({
      status: 400, 
      message: 'Dish must include a name'
    });
  
    if (!description || description == "")
    return next({
      status: 400, 
      message: "Dish must include a description" 
    });
  
    if (!price)
    return next({
      status: 400, 
      message: "Dish must include a price"
    });
    if (typeof price !== "number" || price <= 0)
    return next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0",
    });
  
    if (!image_url || image_url == "")
    return next({
      status: 400, 
      message: "Dish must include an image_url"
    });
  
    next();
};


//HANDLERS {create, read, update, no delete, list}

// Create
function create (req, res){
    const {data:{ name, description, price, image_url },} = req.body;
    const newDish ={
        id: nextId (),
        name,
        description,
        price,
        image_url,
    }
    dishes.push(newDish);
    res.status(201).json({data:newDish});
}

// Read
function read(req, res, next) {
  res.json({ data: res.locals.dish });
}

// Update
function update(req, res, next) {
  const originalId = req.params.dishId;
  const { data: { id, name, description, price, image_url },} = req.body;
  const updatedDish = {
    id: originalId,
    name,
    description,
    price,
    image_url,
  };
  if (id && id !== req.params.dishId)
    return next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${req.params.dishId}`,
    });
  res.json({ data: updatedDish });
}

// No Delete

// List
function list(req, res) {
    res.json({ data: dishes })
  }

// EXPORTS
module.exports = {
    create:[validateDishProps,create],
    read:[dishExists,read],
    update:[dishExists, validateDishProps,update],
    list
  };