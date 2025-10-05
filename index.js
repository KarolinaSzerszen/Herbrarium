import express from "express";
import ejs from "ejs";
import { dirname } from "path";
import bodyParser from "body-parser";
import axios from "axios";
import fetch from "node-fetch";
import multer from "multer";

const app = express();
const port = 4000;
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
let imageBase64 = null;
let current = 0;
let the_title = "";
let the_fill = "";
let the_comment = "";

app.use(express.urlencoded({ extended: true })); // Parses form data from POST requests
app.use(express.json()); // Parses JSON payloads (if applicable)

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

async function getPlants() {
  try {
    const response = await fetch(
      "https://trefle.io/api/v1/plants?token=SDv3CUfaAF3plFyTdsLffwX1PLnlfB7BwertV4dWaRU"
    );
    if (!response.ok) {
      throw new Error(`HTTP error! API isn't working correctly`);
    }

    const data = await response.json();
    /* console.log(data); */

    return data.data;
  } catch (error) {
    console.error("Error fetching planst: ", error);
    return [];
  }
}

async function getOnlyEdible() {
  try {
    const response = await fetch(
      "https://trefle.io/api/v1/plants?filter_not%5Bedible_part%5D=null&token=SDv3CUfaAF3plFyTdsLffwX1PLnlfB7BwertV4dWaRU"
    );
    if (!response.ok) {
      throw new Error(`HTTP error! API isn't working correctly`);
    }

    const data = await response.json();
    /*console.log(data); */

    return data.data;
  } catch (error) {
    console.error("Error fetching planst: ", error);
    return [];
  }
}

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/about", (req, res) => {
  res.render("about.ejs");
});

app.get("/plantArchive", async (req, res) => {
  try {
    const flora = await getPlants();
    const edible = await getOnlyEdible();

    /*console.log("Nowe znaleziosko wszystkie gatunki: ", species); */
    let selectedList = req.query.list || "one"; // Normalnie będzie to
    let data = selectedList === "two" ? edible : flora;
    res.render("plantArchive.ejs", {
      /* plants: flora, */
      data,
      selectedList,
    });
  } catch (error) {
    console.log("upsy daisy");
    res.status(500);
  }
});

app.get("/plantNews", (req, res) => {
  res.render("plantNews.ejs");
});

app.get("/forum", (req, res) => {
  res.render("forum.ejs");
});

app.get("/articleMaking", (req, res) => {
  res.render("articleMaking.ejs");
});
app.get("/nettleArticle", (req, res) => {
  res.render("nettleArticle.ejs");
});
app.get("/shyPlantArticle", (req, res) => {
  res.render("shyPlantArticle.ejs");
});
app.get("/makeNoiseArticle", (req, res) => {
  res.render("makeNoiseArticle.ejs");
});

app.post("/upload", upload.single("input_file"), (req, res) => {
  console.log("Body:", req.body);
  console.log("File:", req.file);
  the_title = req.body["Title"];
  the_fill = req.body["Fill"];
  if (!req.file) {
    return res.send("No file uploaded.");
  }

  imageBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString(
    "base64"
  )}`;

  res.render("articleMaking.ejs", {
    article_img: imageBase64,
    title: the_title,
    fill: the_fill.substring(0, 50) + "...",
  });
});

app.post("/submit", upload.single("input_file"), (req, res) => {
  console.log("Body:", req.body);
  //console.log("File:", imageBase64);
  the_title = req.body["Title"];
  the_fill = req.body["Fill"];
  if (!imageBase64 || !the_title || !the_fill) {
    current = 1;
    res.render("articleMaking.ejs", {
      article_img: imageBase64,
      title: the_title,
      fill: the_fill.substring(0, 50),
      value: current,
    });
  } else if (imageBase64 && the_title && the_fill) {
    res.render("plantNews.ejs", {
      article_img: imageBase64,
      title: the_title,
      fill: the_fill.substring(0, 50) + "...",
    });
  }
});

app.get("/newArticle", (req, res) => {
  res.render("newArticle.ejs", {
    article_img: imageBase64,
    title: the_title,
    fill: the_fill,
  });
});

app.post("/nettleArticle/comment", (req, res) => {
  console.log("Body: ", req.body);
  the_comment = req.body["Fill"];
  res.render("nettleArticle.ejs", { comment: the_comment });
});

app.post("/shyPlantArticle/comment", (req, res) => {
  console.log("Body: ", req.body);
  the_comment = req.body["Fill"];
  res.render("shyPlantArticle.ejs", { comment: the_comment });
});

app.post("/makeNoiseArticle/comment", (req, res) => {
  console.log("Body: ", req.body);
  the_comment = req.body["Fill"];
  res.render("makeNoiseArticle.ejs", { comment: the_comment });
});

app.post("/newArticle/comment", (req, res) => {
  console.log("Body: ", req.body);
  the_comment = req.body["Fill"];
  res.render("newArticle.ejs", {
    article_img: imageBase64,
    title: the_title,
    fill: the_fill,
    comment: the_comment,
  });
});
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
