//jshint esversion:6

const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// * adding a database

main().catch((err) => console.log(err));

async function main() {
	const url =
		"mongodb+srv://moha-admin:DJTJkC4f49Ot6BeW@cluster0.bnfj4ya.mongodb.net/todolistDB"; //127.0.0.1
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

	const listSchema = new mongoose.Schema({
		name: String,
		items: [itemsSchema],
	});

	const List = mongoose.model("List", listSchema);

	app.get("/", function (req, res) {
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

	app.get("/:customListName", function (req, res) {
		const customListName = _.capitalize(req.params.customListName);

		List.findOne({ name: customListName })
			.then((foundList) => {
				if (!foundList) {
					//* create new list
					const list = new List({
						name: customListName,
						items: defaultItems,
					});
					list.save();
					res.redirect("/" + customListName);
				} else {
					//* show existing list
					res.render("list", {
						listTitle: customListName,
						newListItems: foundList.items,
					});
				}
			})
			.catch((err) => console.log(err));
	});

	app.post("/", function (req, res) {
		const itemName = req.body.newItem;
		const listName = req.body.list;

		const item = new Item({
			name: itemName,
		});

		if (listName === "Today") {
			item.save();
			res.redirect("/");
		} else {
			List.findOne({ name: listName })
				.then((foundList) => {
					foundList.items.push(item);
					foundList.save();
					res.redirect("/" + listName);
				})
				.catch((err) => console.log(err));
		}
	});

	app.post("/delete", function (req, res) {
		let checkedItemId = req.body.checkbox;
		const listName = req.body.listName;

		if (checkedItemId) {
			checkedItemId = checkedItemId.trim(); //* removes the extra space at the end that mongo adds
		}

		if (listName === "Today") {
			Item.findByIdAndRemove(checkedItemId)
				.then(() => {
					console.log("successfully deleted checked item");
					res.redirect("/");
				})
				.catch((err) => console.log(err));
		} else {
			List.findOneAndUpdate(
				{ name: listName },
				{ $pull: { items: { _id: checkedItemId } } }
			)
				.then((foundList) => {
					res.redirect("/" + listName);
				})
				.catch((err) => console.log(err));
		}
	});

	app.get("/about", function (req, res) {
		res.render("about");
	});

	app.listen(3000, function () {
		console.log("Server started on port 3000");
	});
}
