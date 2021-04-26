const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const checkObjectId = require("../../middleware/checkObjectId");

const Article = require("../../models/Article");
const User = require("../../models/User");

// @route    POST api/article/create
// @desc     Create a article
// @access   Private
router.post(
  "/create",
  [
    auth,
    [
      check("article_text", "Text is required").not().isEmpty(),
      check("article_name", "Name is required").not().isEmpty(),
      check("article_type", "Type is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");
      const { article_name, article_text, article_type } = req.body;

      const newArticle = new Article({
        article_name,
        article_text,
        article_type,
        username: user.firstname + " " + user.lastname,
        user: req.user.id,
      });

      const article = await newArticle.save();

      res.json(article);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    GET api/articles
// @desc     Get all articles
// @access   Private
router.get("/", auth, async (req, res) => {
  try {
    const articles = await Article.find().sort({ date: -1 });
    const user = await User.findById(req.user.id);
    let userArticles = [];
    let userPreferedArticles = [];
    //Remove the article if it has been blocked by the user
    for (i in articles) {
      if (articles[i].blocks.length > 0) {
        for (j in articles[i].blocks) {
          if (
            req.user.id.toString() !== articles[i].blocks[j].user.toString()
          ) {
            userArticles.push(articles[i]);
          }
        }
      } else {
        userArticles.push(articles[i]);
      }
    }

    for (let article in userArticles) {
      for (articleType in userArticles[article].article_type) {
        for (let userpref in user.article_preferences) {
          if (
            user.article_preferences[userpref] ===
            userArticles[article].article_type[articleType]
          ) {
            if (!userPreferedArticles.includes(userArticles[article])) {
              userPreferedArticles.push(userArticles[article]);
            }
          }
        }
      }
    }

    res.json(userPreferedArticles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/articles
// @desc     Get all articles
// @access   Private
router.get("/me", auth, async (req, res) => {
  try {
    const articles = await Article.find({ user: req.user.id }).sort({
      date: -1,
    });

    return res.json(articles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/articles/:id
// @desc     Get article by ID
// @access   Private
router.get("/:id/", [auth, checkObjectId], async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    res.json(article);
  } catch (err) {
    console.error(err.message);

    res.status(500).send("Server Error");
  }
});

// @route    DELETE api/articles/:id
// @desc     Delete a article
// @access   Private
router.delete("/:id/", [auth, checkObjectId], async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    // Check user
    if (article.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    await article.remove();

    res.json({ msg: "Article removed" });
  } catch (err) {
    console.error(err.message);

    res.status(500).send("Server Error");
  }
});

// @route    PUT api/articles/like/:id
// @desc     Like a article
// @access   Private
router.put("/like/:id", [auth, checkObjectId], async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    // Check if the article has already been liked
    if (article.likes.some((like) => like.user.toString() === req.user.id)) {
      article.likes = article.likes.filter(
        ({ user }) => user.toString() !== req.user.id
      );

      await article.save();

      return res.json(article);
    }

    // Check if the article has been unliked
    if (
      article.unlikes.some((unlike) => unlike.user.toString() === req.user.id)
    ) {
      //Remove the unlike
      article.unlikes = article.unlikes.filter(
        ({ user }) => user.toString() !== req.user.id
      );

      //Save the new like
      article.likes.unshift({ user: req.user.id });

      await article.save();

      return res.json(article);
    }

    article.likes.unshift({ user: req.user.id });

    await article.save();

    res.json(article);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    PUT api/articles/unlike/:id
// @desc     Unlike a article
// @access   Private
router.put("/unlike/:id", [auth, checkObjectId], async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    // Check if the article has already been unliked
    if (
      article.unlikes.some((unlike) => unlike.user.toString() === req.user.id)
    ) {
      article.unlikes = article.unlikes.filter(
        ({ user }) => user.toString() !== req.user.id
      );

      await article.save();

      return res.json(article);
    }

    // Check if the article has been liked
    if (article.likes.some((like) => like.user.toString() === req.user.id)) {
      //Remove the like
      article.likes = article.likes.filter(
        ({ user }) => user.toString() !== req.user.id
      );

      //Save the new unlike
      article.unlikes.unshift({ user: req.user.id });

      await article.save();

      return res.json(article);
    }

    article.unlikes.unshift({ user: req.user.id });

    await article.save();

    res.json(article);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    PUT api/articles/unlike/:id
// @desc     Unlike a article
// @access   Private
router.put("/block/:id", [auth, checkObjectId], async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    // Check if the article has already been liked
    if (article.blocks.some((block) => block.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: "Article has already been blocked" });
    }
    article.blocks.unshift({ user: req.user.id });

    await article.save();

    res.json(article.blocks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    PUT api/articles/edit/:id
// @desc     Edit a article
// @access   Private
router.put(
  "/edit/:id",
  [
    auth,
    checkObjectId,
    [
      check("article_text", "Text is required").not().isEmpty(),
      check("article_name", "Name is required").not().isEmpty(),
      check("article_type", "Type is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      let article = await Article.findById(req.params.id);

      if (article.user.toString() !== req.user.id.toString()) {
        return res.status(400).json({ msg: "Unauthorized Access Denied" });
      }

      const { article_text, article_name, article_type } = req.body;

      article.article_text = article_text;
      article.article_name = article_name;
      article.article_type = article_type;

      await article.save();

      res.json(article);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;