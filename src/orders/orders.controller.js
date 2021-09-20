const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass


// VALIDATORS

// Order does exist validation
function orderExists  (req, res, next)  {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id == orderId);
  
  if (foundOrder) {
    res.locals.order = foundOrder;
    next();
  }
  next({
    status: 404,
    message: `Order with id ${orderId} does not exist`,
  });
};

// Order props validation {deliverTo, mobileNumber, dishes}
function validateOrderProps  (req, res, next)  {
  const { data: { deliverTo, mobileNumber, status, dishes },} = req.body;
  
  if (!deliverTo || deliverTo == "")
  return next({
    status: 400, 
    message: "Order must include a deliverTo"
  });
  
  if (!mobileNumber || mobileNumber == "")
  return next({
    status: 400, 
    message: "Order must include a mobileNumber"
  });
  
  if (!dishes)
  return next({
    status: 400, 
    message: "Order must include a dish"
  });
  
  if (!Array.isArray(dishes) || dishes.length <= 0)
  return next({
    status: 400,
    message: "Order must include at least one dish"
  });
  
  dishes.forEach((dish, index) => {
    if (
      !dish.quantity ||
      dish.quantity <= 0 ||
      typeof dish.quantity != "number"
    )
    return next({
      status: 400,
      message: `Dish ${index} must have a quantity that is an integer greater than 0`,
    });
  });
  
  res.locals.newOrder = {
    id: nextId(),
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    status: status,
    dishes: dishes,
  };
  
  next();
};

// HANDLERS {create, read, update, delete, list}

// Create 
function create(req, res)  {
  orders.push(res.locals.newOrder);
  res.status(201).json({ data: res.locals.newOrder });
};

// Read
function read(req, res, next)  {
  res.json({ data: res.locals.order });
};


// Update
function update(req, res, next)  {
  const { orderId } = req.params;
  const originalOrder = res.locals.order;
  const {data: { id, deliverTo, mobileNumber, status, dishes },} = req.body;
  
  if (id && id !== orderId)
  return next({
    status: 400,
    message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`
  });
  
  if (!status || status == "")
  return next({
    status: 400, 
    message: "Order must have a status of pending, preparing, out-for-delivery, delivered"
  });
  
  if (status === "invalid")
  return next({
    status: 400, 
    message: "Order status must be valid"
  });
  
  if (status === "delivered")
  return next({
    status: 400,
    message: "A delivered order cannot be changed"
  });
  
  res.locals.order = {
    id: originalOrder.id,
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    status: status,
    dishes: dishes,
  };
  res.json({ data: res.locals.order });
};

// Delete
function destroy (req, res, next) {
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id == orderId);
  
  if (res.locals.order.status !== "pending")
  return next({
    status: 400,
    message: "An order cannot be deleted unless it is pending"
  });
  
  if (index > -1) orders.splice(index, 1);
  res.sendStatus(204);
};

// List
function list(req, res, next)  {
  res.json({ data: orders });
};

// EXPORTS
module.exports = {
  create: [validateOrderProps, create],
  read: [orderExists, read],
  update: [validateOrderProps, orderExists, update],
  delete: [orderExists, destroy],
  list
};
