//jshint esversion:6

const express = require("express");
const mongoose = require("mongoose");
// const date = require(__dirname + "/date.js");

const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// * adding a database

main().catch((err) => console.log(err));

async function main() {
	const url = "mongodb://127.0.0.1:27017/todolistDB";
	await mongoose.connect(url, { useNewUrlParser: true });

	const itemsSchema = new mongoose.Schema({
		name: String,
	});

	const Item = new mongoose.model("Item", itemsSchema);

	const item1 = new Item({
		name: "Welcome to your todolist",
	});

	const item2 = new Item({
		name: "Hit the + button to add a new item",
	});

	const item3 = new Item({
		name: "<----- Hit this to delete an item",
	});

	const defaultItems = [item1, item2, item3];

	app.get("/", function (req, res) {
		// const day = date.getDate();

		Item.find()
			.then((items) => {
				if (items.length === 0) {
					Item.insertMany(defaultItems)
						.then(() =>
							console.log("Successfully added items to database")
						)
						.catch((err) => console.log(err));
					items = defaultItems;
				}
				res.render("list", { listTitle: "Today", newListItems: items });
			})
			.catch((err) => console.log(err));
	});

	app.post("/", function (req, res) {
		const itemName = req.body.newItem;
		const item = new Item({
			name: itemName,
		});

		item.save();
		res.redirect("/");
	});

	app.post("/delete", function (req, res) {
		let checkedItemId = req.body.checkbox;
		if (checkedItemId) {
			checkedItemId = checkedItemId.trim();
		}
		Item.findByIdAndRemove(checkedItemId)
			.then(() => {
        console.log("successfully deleted checked item")
        res.redirect("/");
      })
			.catch((err) => console.log(err));
	});

	app.get("/work", function (req, res) {
		res.render("list", { listTitle: "Work List", newListItems: workItems });
	});

	app.get("/about", function (req, res) {
		res.render("about");
	});

	app.listen(3000, function () {
		console.log("Server started on port 3000");
	});
}
